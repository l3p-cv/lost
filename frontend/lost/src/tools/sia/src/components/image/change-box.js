import { mouse, keyboard, svg as SVG, state } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import imageInterface from "./imageInterface"

import { selectDrawable } from "./change-select"
import { keyMoveDrawable } from "./change-move"
window.imageInterface = imageInterface

let mouseStart = undefined
let mousePrev = undefined
let mousepos = undefined
let distance = { x: undefined, y: undefined }
let stateElement = undefined
let savedStartState = false
let frameRequestBoxChange = undefined
let frameRequestBoxEdgeScaling = undefined

function enableKeyMoveBox(drawable){
	$(window).on("keydown.keyMoveBox", $event => {
		if(!drawable.isEdgeSelected() && keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
			appModel.event.changeEvent.update(true)

			if(!savedStartState){
				stateElement = new state.StateElement()
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
	$(window).on("keyup.keyMoveBox", $event => {
		if(stateElement && !drawable.isEdgeSelected() && keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){

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
}
function enableScaleBoxEdge(drawable){
	$(window).on("keydown.scaleBoxEdge", $event => {
		if(drawable.isEdgeSelected() && keyboard.isModifierNotHit($event, "Alt") && keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
			console.log("keydown.scaleBoxEdge")
			$event.preventDefault()
			appModel.event.changeEvent.update(true)

			let moveStep = undefined
			if(keyboard.isModifierHit($event, "Shift")){
				moveStep = appModel.controls.moveStepFast
				console.log({ moveStep })
				appModel.controls.currentMoveStep = moveStep
			} else {
				moveStep = appModel.controls.moveStep
				appModel.controls.currentMoveStep = moveStep
			}
			console.log({ moveStep })

			if(frameRequestBoxEdgeScaling !== undefined) cancelAnimationFrame(frameRequestBoxEdgeScaling)

			// add undo
			if(!savedStartState){
				stateElement = new state.StateElement()
				stateElement.addUndo({
					data: {
						x: drawable.getX() / imageInterface.getWidth(),
						y: drawable.getY() / imageInterface.getHeight(),
						w: drawable.getW() / imageInterface.getWidth(),
						h: drawable.getH() / imageInterface.getHeight(),
					},
					fn: (data) => {
						selectDrawable(drawable)
						drawable.setBounds({
							x: data.x * imageInterface.getWidth(),
							y: data.y * imageInterface.getHeight(),
							w: data.w * imageInterface.getWidth(),
							h: data.h * imageInterface.getHeight(),
						})
					} 
				})
				savedStartState = true
			} 
			
			// scale edge
			try {
				frameRequestBoxEdgeScaling = requestAnimationFrame(() => {
					switch (drawable.getEdge()) {
						case "right":
							switch ($event.key) {
								case "d":
								case "D":
								case "ArrowRight":
									drawable.setBounds({
										w: drawable.getW() + moveStep,
										x: drawable.getX() + moveStep / 2,
									})
									drawable.setChanged()
									break
								case "a":
								case "A":
								case "ArrowLeft":
									drawable.setBounds({
										w: drawable.getW() - moveStep,
										x: drawable.getX() - moveStep / 2,
									})
									drawable.setChanged()
									break
							}
							break
						case "bottom":
							switch ($event.key) {
								case "w":
								case "W":
								case "ArrowUp":
									drawable.setBounds({
										h: drawable.getH() - moveStep,
										y: drawable.getY() - moveStep / 2,
									})
									drawable.setChanged()
									break
								case "s":
								case "S":
								case "ArrowDown":
									drawable.setBounds({
										h: drawable.getH() + moveStep,
										y: drawable.getY() + moveStep / 2,
									})
									drawable.setChanged()
									break
							}
							break
						case "top":
							switch ($event.key) {
								case "w":
								case "W":
								case "ArrowUp":
									drawable.setBounds({
										h: drawable.getH() + moveStep,
										y: drawable.getY() - moveStep / 2,
									})
									drawable.setChanged()
									break
								case "s":
								case "S":
								case "ArrowDown":
									drawable.setBounds({
										h: drawable.getH() - moveStep,
										y: drawable.getY() + moveStep / 2,
									})
									drawable.setChanged()
									break
							}
							break
						case "left":
							switch ($event.key) {
								case "a":
								case "A":
								case "ArrowLeft":
									drawable.setBounds({
										w: drawable.getW() + moveStep,
										x: drawable.getX() - moveStep / 2,
									})
									drawable.setChanged()
									break
								case "d":
								case "D":
								case "ArrowRight":
									drawable.setBounds({
										w: drawable.getW() - moveStep,
										x: drawable.getX() + moveStep / 2,
									})
									drawable.setChanged()
									break
							}
							break
						default: 
							frameRequestBoxEdgeScaling = undefined
							return
					}
				})
			} catch(error){
				console.error(error.message)
				throw error
			} finally {
				frameRequestBoxEdgeScaling = undefined
			}
		}
	})
	$(window).on("keyup.scaleBoxEdge", $event => {
		if(stateElement && drawable.isEdgeSelected() && keyboard.isModifierNotHit($event, "Alt") && keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
			console.log("keyup.scaleBoxEdge")
			appModel.event.changeEvent.update(true)

			stateElement.addRedo({
				data: {
					x: drawable.getX() / imageInterface.getWidth(),
					y: drawable.getY() / imageInterface.getHeight(),
					w: drawable.getW() / imageInterface.getWidth(),
					h: drawable.getH() / imageInterface.getHeight(),
				},
				fn: (data) => {
					selectDrawable(drawable)
					drawable.setBounds({
						x: data.x * imageInterface.getWidth(),
						y: data.y * imageInterface.getHeight(),
						w: data.w * imageInterface.getWidth(),
						h: data.h * imageInterface.getHeight(),
					})
				}
			})
			state.add(stateElement)
			
			stateElement = undefined
			savedStartState = false

			appModel.event.changeEvent.update(false)
		}
	})
}
function disableKeyMoveBox(){
	$(window).off("keydown.keyMoveBox")
	$(window).off("keyup.keyMoveBox")
}
function disableScaleBoxEdge(){
	$(window).off("keydown.scaleBoxEdge")
	$(window).off("keyup.scaleBoxEdge")
}

export function enableBoxChange(drawable){
	// mouse box scaling
	$(drawable.view.html.root).on("mousedown.changeBoxStart", ($event) => {
		// return on right or middle mouse button, prevent context menu.
		if (!mouse.button.isLeft($event.button)) {
			$event.preventDefault()
			return
		}
		// @QUICKFIX: for close button
		if($event.target.closest(`[data-ref="menubar-close-button"]`)){
			return
		}
		// console.warn("box change handler (start)")
		appModel.event.changeEvent.update(true)
		
		// set move cursor if mouse on menubar to move the box.
		if($event.target.closest(`[data-ref="menu"]`)){
			drawable.setCursor(mouse.CURSORS.MOVE)
		}

		// init context
		mouseStart = mouse.getMousePosition($event, imageInterface.getSVG())
		// calculate the real mouseposition (@zoom)
		const svg = imageInterface.getSVG()
		const zoom = appModel.ui.zoom.value
		mouseStart = {
			x: (mouseStart.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
			y: (mouseStart.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
		}
		mousePrev = mouseStart

		// set global cursor via class
		try {
			mouse.setGlobalCursor(drawable.model.currentCursor.class, {
				noPointerEvents: true,
				noSelection: true,
			})
		} catch(e){
			console.error(e)
			console.log(drawable)
			console.log(drawable.model)
			console.log(drawable.view.html)
		}

		// add the update function
		$(window).on("mousemove.changeBoxUpdate", ($event) => {
			// add undo
			if(!savedStartState){
				stateElement = new state.StateElement()
				stateElement.addUndo({
					data: {
						x: drawable.getX() / imageInterface.getWidth(),
						y: drawable.getY() / imageInterface.getHeight(),
						w: drawable.getW() / imageInterface.getWidth(),
						h: drawable.getH() / imageInterface.getHeight(),
					},
					fn: (data) => {
						selectDrawable(drawable)
						drawable.setBounds({
							x: data.x * imageInterface.getWidth(),
							y: data.y * imageInterface.getHeight(),
							w: data.w * imageInterface.getWidth(),
							h: data.h * imageInterface.getHeight(),
						})
					} 
				})
				savedStartState = true
			}
			if(frameRequestBoxChange !== undefined) cancelAnimationFrame(frameRequestBoxChange)
			frameRequestBoxChange = requestAnimationFrame(() => {
				// prepare update
				mousepos = mouse.getMousePosition($event, imageInterface.getSVG())
				// calculate the real mouseposition (@zoom)
				const svg = imageInterface.getSVG()
				const zoom = appModel.ui.zoom.value
				mousepos = {
					x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
					y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
				}
				mousePrev = mousePrev === undefined ? mousepos : mousePrev
				distance.x = mousePrev.x - mousepos.x
				distance.y = mousePrev.y - mousepos.y
				mousePrev = mousepos
				// execute update
				switch (drawable.model.currentCursor.id) {
					case mouse.CURSORS.MOVE.id:
						// invert distance
						distance.x = - distance.x
						distance.y = - distance.y
						drawable.move(distance)
						drawable.setChanged()
						break
					case mouse.CURSORS.CURSOR_EDGE_BOTTOM.id:
						drawable.scaleBottom(distance)
						drawable.setChanged()
						break
					case mouse.CURSORS.CURSOR_EDGE_LEFT.id:
						drawable.scaleLeft(distance)
						drawable.setChanged()
						break
					case mouse.CURSORS.CURSOR_EDGE_RIGHT.id:
						drawable.scaleRight(distance)
						drawable.setChanged()
						break
					case mouse.CURSORS.CURSOR_EDGE_TOP.id:
						drawable.scaleTop(distance)
						drawable.setChanged()
						break
					case mouse.CURSORS.CURSOR_CORNER_TOP_LEFT.id:
						drawable.scaleTopLeft(distance)
						drawable.setChanged()
						break
					case mouse.CURSORS.CURSOR_CORNER_TOP_RIGHT.id:
						drawable.scaleTopRight(distance)
						drawable.setChanged()
						break
					case mouse.CURSORS.CURSOR_CORNER_BOTTOM_RIGHT.id:
						drawable.scaleBottomRight(distance)
						drawable.setChanged()
						break
					case mouse.CURSORS.CURSOR_CORNER_BOTTOM_LEFT.id:
						drawable.scaleBottomLeft(distance)
						drawable.setChanged()
						break
				}
				mouseStart = mousepos
			})
		})

		// mouse change (end)
		$(window).on("mouseup.changeBoxEnd", ($event) => {
			// return on right or middle mouse button, prevent context menu.
			if (!mouse.button.isLeft($event.button)) {
				$event.preventDefault()
				return
			}
			// console.warn("box change handler (end)")
			$(window).off("mousemove.changeBoxUpdate")
			$(window).off("mouseup.changeBoxEnd")

			// add redo
			// if user does mouse down and up without mousemove, the stateElement won't be cameraInitialized.
			if(savedStartState){
				stateElement.addRedo({
					data: {
						x: drawable.getX() / imageInterface.getWidth(),
						y: drawable.getY() / imageInterface.getHeight(),
						w: drawable.getW() / imageInterface.getWidth(),
						h: drawable.getH() / imageInterface.getHeight(),
					},
					fn: (data) => {
						selectDrawable(drawable)
						drawable.setBounds({
							x: data.x * imageInterface.getWidth(),
							y: data.y * imageInterface.getHeight(),
							w: data.w * imageInterface.getWidth(),
							h: data.h * imageInterface.getHeight(),
						})
					}
				})
				state.add(stateElement)

				savedStartState = false
				stateElement = undefined
			}

			// "reset mouse"
			mouse.unsetGlobalCursor()
			mouseStart = undefined
			mousePrev = undefined
			mousepos = undefined
			distance = { x: undefined, y: undefined }

			appModel.event.changeEvent.update(false) 
		})
	})

	// keyboard edge selection
	$(window).on("keydown.selectBoxEdge", $event => {
		if(keyboard.isModifierHit($event, "Alt")){
			console.log("keydown.selectBoxEdge")
			appModel.event.changeEvent.update(true)
			
			// prevent scrolling when using arrow keys
			$event.preventDefault()

			// temporary disable box movement via keyboard
			disableKeyMoveBox()
			
			// edge selection
			if(keyboard.isModifierHit($event, "Alt")) {
				switch ($event.key) {
					case "w":
					case "W":
					case "ArrowUp":
						drawable.selectEdge("top")
						break
					case "d":
					case "D":
					case "ArrowRight":
						drawable.selectEdge("right")
						break
					case "s":
					case "S":
					case "ArrowDown":
						drawable.selectEdge("bottom")
						break
					case "a":
					case "A":
					case "ArrowLeft":
						drawable.selectEdge("left")
						break
					default: return
				}
			}
		}
	})
	// reset edge if space, enter, tab or escape was used
	$(window).on("keydown.resetEdge", $event => {
		if(drawable.isEdgeSelected() && keyboard.isKeyHit($event, ["Space", "Enter", "Tab", "Escape"])){
			$event.preventDefault()
			drawable.resetEdge()
			enableKeyMoveBox(drawable)
			// force re-select (Escape will unselect the drawable)
			// this will re-enable box movement via keyboard
			if(keyboard.isKeyHit($event, "Escape")){
				selectDrawable(drawable)
			}
		}
	})
	$(window).on("keyup.selectBoxEdge", $event => {
		if(keyboard.isKeyHit($event, "Alt")){
			appModel.event.changeEvent.update(false)
		}
	})

	enableScaleBoxEdge(drawable)
	enableKeyMoveBox(drawable)
}
export function disableBoxChange(drawable){
	$(drawable.view.html.root).off("mousedown.changeBoxStart")
	$(window).off("mousemove.changeBoxUpdate")
	$(window).off("mouseup.changeBoxEnd")
	$(window).off("keydown.selectBoxEdge")
	$(window).off("keyup.selectBoxEdge")
	$(window).off("keydown.resetEdge")
	disableScaleBoxEdge()
	disableKeyMoveBox()
}