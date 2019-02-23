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
			}
		}
	})
	$(window).on("keyup.lineInsertPointEnd", ($event) => {
		if(keyboard.isKeyHit($event, "Control")){
			mouse.unsetGlobalCursor()
			$(imageInterface.getSVG()).off("mousedown.lineInsertPoint")
			$(window).off("keyup.lineInsertPointEnd")
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
			}
		}
	})
	$(window).on("keyup.lineInsertPointEnd", ($event) => {
		if(keyboard.isKeyHit($event, "Alt")){
			mouse.unsetGlobalCursor()
			$(imageInterface.getSVG()).off("mousedown.lineInsertPoint")
			$(window).off("keyup.lineInsertPointEnd")
		}
	})
}


export function enableMultipointChange(drawable){
	// mouse
	let mouseStart = undefined
	let mousePrev = undefined
	let mousepos = undefined
	let stateElement = undefined
	let savedStartState = false
	let insertOrAddEventActive = false
	$(drawable.view.html.root).on("mousedown.moveDrawableStart", ($event) => {
		// return on right or middle mouse button, prevent context menu.
		if (!mouse.button.isLeft($event.button)) {
			$event.preventDefault()
			return
		}
		appModel.event.changeEvent.update(true)
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
			state.add(stateElement)

			// reselect if its a multi-point-annotation point.
			drawable.setChanged()
			mouse.unsetGlobalCursor()
			mouseStart = undefined
			mousePrev = undefined
			mousepos = undefined
			savedStartState = false
			stateElement = undefined

			appModel.event.changeEvent.update(false)
		})
	})

	// Key
	$(window).on("keydown.moveDrawable", $event => {
		if(keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
			appModel.event.changeEvent.update(true)
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
			}
			keyMoveDrawable($event, drawable)
		}
	})
	$(window).on("keyup.moveDrawable", $event => {
		if(stateElement && keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
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
			state.add(stateElement)

			stateElement = undefined
			savedStartState = false

			appModel.event.changeEvent.update(false)
		}
	})

	// on [CTRL]
	$(window).on("keydown.multipointInsertPointStart", ($event) => {
		if(appModel.isADrawableSelected()){
			const selectedDrawable = appModel.getSelectedDrawable()
			if(selectedDrawable.getClassName() === "MultipointPresenter"){
				if(keyboard.isModifierHit($event, "Control")){
					console.log($event)
					insertOrAddEventActive = true
					appModel.event.changeEvent.update(true)
					handleMultipointPointInsertion($event, drawable)
				}	
			}
		}
	})
	$(window).on("keyup.multipointInsertPointEnd", ($event) => {
		if(insertOrAddEventActive){
			if(keyboard.isKeyHit($event, "Control")){
				insertOrAddEventActive = false
				appModel.event.changeEvent.update(false)
			}
		}
	})
	if(drawable.model.type === "line"){
		// on [ALT]
		$(window).on("keydown.lineAddPointStart", ($event) => {
			if(appModel.isADrawableSelected()){
				const selectedDrawable = appModel.getSelectedDrawable()
				if(selectedDrawable.getClassName() === "MultipointPresenter"){
					if(keyboard.isModifierHit($event, "Alt")){
						insertOrAddEventActive = true
						appModel.event.changeEvent.update(true)
						handleLinePointAdd($event, drawable)
					}
				}
			}
		})
		$(window).on("keyup.lineAddPointEnd", ($event) => {
			if(insertOrAddEventActive){
				if(keyboard.isKeyHit($event, "Alt")){
					insertOrAddEventActive = false
					appModel.event.changeEvent.update(false)
				}
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
	$(window).off("keyup.multipointInsertPointEnd")
	$(window).off("keyup.lineAddPointEnd")
}
