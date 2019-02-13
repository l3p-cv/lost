import { mouse, keyboard, svg as SVG, state } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import imageInterface from "./imageInterface"

import { selectDrawable } from "./change-select"
import { keyMoveDrawable } from "./change-move"


export function handleMultipointPointInsertion($event, drawable, mode){
	mouse.setGlobalCursor(mouse.CURSORS.CREATE.class)
	$(imageInterface.getSVG()).on("mousedown.lineInsertPoint", ($event) => {
		if(!mouse.button.isRight($event.button)) {
			$event.preventDefault()
			return
		}
		appModel.controls.changeEvent.update(true)
		// this key check looks like it is just duplication but it is not.
		if(keyboard.isModifierHit($event, "Control")){
			let mousepos = mouse.getMousePosition($event, imageInterface.getSVG())
			// calculate the real mouseposition (@zoom)
			const zoom = appModel.ui.zoom.value
			mousepos = {
				x: (mousepos.x + (SVG.getViewBoxX(imageInterface.getSVG()) * 1 / zoom)) * zoom,
				y: (mousepos.y + (SVG.getViewBoxY(imageInterface.getSVG()) * 1 / zoom)) * zoom,
			}
			const point = drawable.insertPoint(mousepos)
			if(point){
				drawable.setChanged()
				selectDrawable(point)
			}
		}
	})
	$(window).on("keyup.lineInsertPointEnd", ($event) => {
		// @KEYBOARD: isModifierHit (checking modifiers) wont work here! modifier needs to be detected via key!
		// this key check looks like it is just duplication but it is not.
		if(keyboard.isKeyHit($event, "Control")){
			mouse.unsetGlobalCursor()
			$(imageInterface.getSVG()).off("mousedown.lineInsertPoint")
			$(window).off("keyup.lineInsertPointEnd")
			appModel.controls.changeEvent.update(false)
		}
	})
}
export function handleLinePointAdd($event, drawable){
	mouse.setGlobalCursor(mouse.CURSORS.CREATE.class)
	$(imageInterface.getSVG()).on("mousedown.lineInsertPoint", ($event) => {
		if(!mouse.button.isRight($event.button)){
			$event.preventDefault()
			return
		}
		appModel.controls.changeEvent.update(true)
		// this key check looks like it is just duplication but it is not.            
		if(keyboard.isModifierHit($event, "Alt", true)){
			let mousepos = mouse.getMousePosition($event, imageInterface.getSVG())
			// calculate the real mouseposition (@zoom)
			const zoom = appModel.ui.zoom.value
			mousepos = {
				x: (mousepos.x + (SVG.getViewBoxX(imageInterface.getSVG()) * 1 / zoom)) * zoom,
				y: (mousepos.y + (SVG.getViewBoxY(imageInterface.getSVG()) * 1 / zoom)) * zoom,
			}
			const point = drawable.insertPoint(mousepos, "add")
			if(point){
				drawable.setChanged()
				selectDrawable(point)
			}
		}
	})
	$(window).on("keyup.lineInsertPointEnd", ($event) => {
		// this key check looks like it is just duplication but it is not.            
		if(keyboard.isKeyHit($event, "Alt")){
			mouse.unsetGlobalCursor()
			$(imageInterface.getSVG()).off("mousedown.lineInsertPoint")
			$(window).off("keyup.lineInsertPointEnd")
			appModel.controls.changeEvent.update(false)
		}
	})
}


export function enableMultipointChange(drawable){
	// mouse
	var mouseStart = undefined
	var mousePrev = undefined
	var mousepos = undefined
	var stateElement = undefined
	var savedStartState = false
	$(drawable.view.html.root).on("mousedown.moveDrawableStart", ($event) => {
		// return on right or middle mouse button, prevent context menu.
		if (!mouse.button.isLeft($event.button)) {
			$event.preventDefault()
			return
		}
		appModel.controls.changeEvent.update(true)
		// console.warn("drawable change handler (start)")
		mouseStart = mouse.getMousePosition($event, imageInterface.getSVG())
		// calculate the real mouseposition (@zoom)
		const svg = imageInterface.getSVG()
		const zoom = appModel.ui.zoom.value
		mouseStart = {
			x: (mouseStart.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
			y: (mouseStart.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
		}
		stateElement = new state.StateElement()

		$(window).on("mousemove.moveDrawableUpdate", ($event) => {
			// console.warn("drawable move handler (update)")
			mouse.setGlobalCursor(mouse.CURSORS.NONE.class, {
				noPointerEvents: true,
				noSelection: true,
			})
			mousePrev = (mousePrev === undefined) ? mouseStart : mousepos
			mousepos = mouse.getMousePosition($event, imageInterface.getSVG())
			// calculate the real mouseposition (@zoom)
			const svg = imageInterface.getSVG()
			const zoom = appModel.ui.zoom.value
			mousepos = {
				x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
				y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
			}
			if(!savedStartState){
				stateElement.addUndo({
					data: {
						x: drawable.getX() / imageInterface.getWidth(),
						y: drawable.getY() / imageInterface.getHeight(),
					},
					fn: (data) => {
						selectDrawable(drawable)
						drawable.setPosition({
							x: data.x * imageInterface.getWidth(),
							y: data.y * imageInterface.getHeight(),
						})
					} 
				})
				savedStartState = true
			}
			drawable.move({
				x: mousepos.x - mousePrev.x,
				y: mousepos.y - mousePrev.y,
			})
		})

		$(window).on("mouseup.moveDrawableEnd", ($event) => {
			// return on right or middle mouse button, prevent context menu.
			if (!mouse.button.isLeft($event.button)) {
				$event.preventDefault()
				return
			}
			// console.warn("drawable move handler (end)")
			$(window).off("mousemove.moveDrawableUpdate")
			$(window).off("mouseup.moveDrawableEnd")
			
			// finish setting up the 'StateElement'
			stateElement.addRedo({
				data: {
					x: drawable.getX() / imageInterface.getWidth(),
					y: drawable.getY() / imageInterface.getHeight(),
				},
				fn: (data) => {
					selectDrawable(drawable)
					drawable.setPosition({
						x: data.x * imageInterface.getWidth(),
						y: data.y * imageInterface.getHeight(),
					})
				}
			})
			// make undo redo possible
			if(!appModel.controls.creationEvent.value){
				state.add(stateElement)
			}

			// reselect if its a multi-point-annotation point.
			drawable.setChanged()
			mouse.unsetGlobalCursor()
			mouseStart = undefined
			mousePrev = undefined
			mousepos = undefined
			savedStartState = false
			stateElement = undefined

			setTimeout(() => {
				appModel.controls.changeEvent.update(false)
			}, 300)
		})
	})

	// Key
	$(window).on("keydown.moveDrawable", $event => {
		if(keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
			appModel.controls.changeEvent.update(true)
			if(!savedStartState){
				stateElement = new state.StateElement()
				// add undo
				stateElement.addUndo({
					data: {
						x: drawable.getX() / imageInterface.getWidth(),
						y: drawable.getY() / imageInterface.getHeight(),
					},
					fn: (data) => {
						selectDrawable(drawable)
						drawable.setPosition({
							x: data.x * imageInterface.getWidth(),
							y: data.y * imageInterface.getHeight(),
						})
					} 
				})
				savedStartState = true
				$(window).one("keyup.moveDrawable", $event => {
					if(keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
						
						stateElement.addRedo({
							data: {
								x: drawable.getX() / imageInterface.getWidth(),
								y: drawable.getY() / imageInterface.getHeight(),
							},
							fn: (data) => {
								selectDrawable(drawable)
								drawable.setPosition({
									x: data.x * imageInterface.getWidth(),
									y: data.y * imageInterface.getHeight(),
								})
							}
						})
						if(!appModel.controls.creationEvent.value){
							state.add(stateElement)
						}
						stateElement = undefined
						savedStartState = false
					}
				})
			}
			keyMoveDrawable($event, drawable)
			appModel.controls.changeEvent.update(false)
		}
	})

	// on [CTRL]
	$(window).on("keydown.multipointInsertPointStart", ($event) => {
		if(keyboard.isModifierHit($event, "Control")){
			handleMultipointPointInsertion($event, drawable)
		}
	})
	if(drawable.model.type === "line"){
		// on [ALT]
		$(window).on("keydown.lineAddPointStart", ($event) => {
			if(keyboard.isModifierHit($event, "Alt")){
				handleLinePointAdd($event, drawable)
			}
		})
	}
}
export function disableMultipointChange(drawable){
	$(drawable.view.html.root).off("mousedown.moveDrawableStart")
	$(window).off("keydown.moveDrawable")
	$(window).off("keyup.moveDrawable")
	$(window).off("keydown.multipointInsertPointStart")
	$(window).off("keydown.lineAddPointStart")
}
