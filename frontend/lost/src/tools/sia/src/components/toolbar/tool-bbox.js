import { mouse, keyboard, svg as SVG, state } from "l3p-frontend"

import BoxPresenter from "drawables/box/BoxPresenter"
import BoxModel from "drawables/box/BoxModel"
import { STATE } from "drawables/drawable.statics"

import appModel from "siaRoot/appModel"

import imageInterface from "components/image/imageInterface"

// trying to get around cyclics.
import { selectDrawable } from "components/image/change-select"
const imageEventActions = { selectDrawable }


let newBox = undefined
let wImg = undefined
let hImg = undefined
let mouseStart = undefined
let mouseCurr = undefined
let lastUpdateCall = undefined
let validated = false

function resetContext(){
	newBox = undefined
	wImg = undefined
	hImg = undefined
	mouseStart = undefined
	mouseCurr = undefined
	lastUpdateCall = undefined
	validated = false
}

function validate($event) {
	// check in which direction the user draws the box, create and add it
	// calculate the real mouseposition (@zoom)
	mouseCurr = mouse.getMousePosition($event, imageInterface.getSVG())
	const svg = imageInterface.getSVG()
	const zoom = appModel.ui.zoom.value
	mouseCurr = {
		x: (mouseCurr.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
		y: (mouseCurr.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
	}
	let right = mouseStart.x <= mouseCurr.x
	let down = mouseStart.y <= mouseCurr.y

	// create a new box
	// actual values
	let w = BoxModel.getSquareMinSideLength()
	let h = BoxModel.getSquareMinSideLength()
	// console.log(w)
	// console.log(h)
	let x = right 
		? mouseStart.x
		: mouseStart.x - w
	let y = down 
		? mouseStart.y
		: mouseStart.y - h
	// relative values
	w = w / wImg
	h = h / hImg
	x = (x / wImg) + (w / 2)
	y = (y / hImg) + (h / 2)
	
	newBox = new BoxPresenter({
		status: STATE.NEW,
		data: { x, y, w, h }
	})

	// hide the menu bar during creation
	if(newBox.menuBar){
		newBox.menuBar.hide()
	}

	// add the box hidden.
	appModel.addDrawable(newBox)
	// select the box.
	newBox.select()

	// start the update on mousemove and show the box.
	$(window).on("mousemove", update)
	$(window).off("mousemove", validate)

	// a flag to indicate that a box was created and update may execute.
	validated = true
}
function update(e) {
	if(lastUpdateCall !== undefined) cancelAnimationFrame(lastUpdateCall)
	lastUpdateCall = requestAnimationFrame(() => {
		mouseCurr = mouse.getMousePosition(e, imageInterface.getSVG())
		// calculate the real mouseposition (@zoom)
		const svg = imageInterface.getSVG()
		const zoom = appModel.ui.zoom.value
		mouseCurr = {
			x: (mouseCurr.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
			y: (mouseCurr.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
		}
		
		const left = mouseCurr.x <= mouseStart.x
		const up = mouseCurr.y <= mouseStart.y
		const right = !left
		const down = !up
		let x, y, w, h;
		let wDiff, hDiff;
		if(left){
			w = mouseStart.x - mouseCurr.x
			wDiff = w - newBox.getW()
			x = newBox.getX() - wDiff / 2
			if(down){
				h = mouseCurr.y - mouseStart.y
				hDiff = h - newBox.getH()
				y = newBox.getY() + hDiff / 2
			}
			else if(up){
				h = mouseStart.y - mouseCurr.y
				hDiff = h - newBox.getH()
				y = newBox.getY() - hDiff / 2
			} 
		}
		else if(right){
			w = mouseCurr.x - mouseStart.x
			wDiff = w - newBox.getW()
			x = newBox.getX() + wDiff / 2
			if(down === true){
				h = mouseCurr.y - mouseStart.y
				hDiff = h - newBox.getH()
				y = newBox.getY() + hDiff / 2
			}
			else if(up){
				h = mouseStart.y - mouseCurr.y
				hDiff = h - newBox.getH()
				y = newBox.getY() - hDiff / 2
			} 
		}

		newBox.setBounds({ x, y, w, h })
	})
}

export function enableBBoxCreation(){
	$(imageInterface.getSVG()).on("mousedown.createBoxStart", ($event) => {
		// only execute on right mouse button.
		if(keyboard.isAModifierHit($event) || !mouse.button.isRight($event.button)){
			return
		}

		// start creation mode.
		appModel.event.creationEvent.update(true)

		// set a global cursor.
		mouse.setGlobalCursor(mouse.CURSORS.CREATE.class, {
			noPointerEvents: true,
			noSelection: true,
		})

		// update the context
		wImg = imageInterface.getWidth()
		hImg = imageInterface.getHeight()
		mouseStart = mouse.getMousePosition($event, imageInterface.getSVG())

		// calculate the real mouseposition (@zoom)
		const svg = imageInterface.getSVG()
		const zoom = appModel.ui.zoom.value
		mouseStart = {
			x: (mouseStart.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
			y: (mouseStart.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
		}

		// start event validation
		$(window).on("mousemove", validate)
	})
	$(window).on("mouseup.createBoxEnd", ($event) => {
		if(!mouse.button.isRight($event.button)){
			return
		}

		// need to remove validation (creation) handler aswell. if user just clicks without dragging,
		// the handler will never get executed and therefore it will not remove itself.
		$(window).off("mousemove", validate)

		// stop update.
		if(lastUpdateCall !== undefined) cancelAnimationFrame(lastUpdateCall)
		$(window).off("mousemove", update)

		// reset the global cursor.            
		mouse.unsetGlobalCursor()

		// add redo undo.
		if(validated){
			state.add(new state.StateElement({
				do: {
					data: {
						box: newBox
					},
					fn: (data) => {
						// add the box hidden.
						appModel.addDrawable(data.box)
						// select the box.
						imageEventActions.selectDrawable(data.box)
					}
				},
				undo: {
					data: {
						box: newBox
					},
					fn: (data) => {
						data.box.delete()
						appModel.deleteDrawable(data.box)
					}
				}
			}))

			// show the menu bar during creation
			if(newBox.menuBar){
				newBox.menuBar.show()
			}
		}

		// finish
		appModel.event.creationEvent.update(false)
		imageEventActions.selectDrawable(newBox)
		resetContext()
	})
}

export function disableBBoxCreation(){
	$(imageInterface.getSVG()).off("mousedown.createBoxStart")
	$(window).off("mouseup.createBoxEnd")
}