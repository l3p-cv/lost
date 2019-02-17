import { mouse, keyboard, svg as SVG, state } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import imageInterface from "./imageInterface"

import { selectDrawable } from "./change-select"
import { keyMoveDrawable } from "./change-move"
import { handleMultipointPointInsertion, handleLinePointAdd } from "./change-multipoint"


// mouse
let mouseStart = undefined
let mousePrev = undefined
let mousepos = undefined
let stateElement = undefined
let savedStartState = false
// @TODO: use keyStates to create a better user experience and a cleaner event handling.
const keyStates = {
	"w": false,
	"s": false,
	"d": false,
	"a": false,
	"arrowup": false,
	"arrowdown": false,
	"arrowright": false,
	"arrowleft": false,
}
export function enablePointChange(drawable){
	// mouse handler
	$(drawable.view.html.root).on("mousedown.movePointStart", ($event) => {
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
		$(window).on("mousemove.movePointUpdate", ($event) => {
			// hide the point while moving
			if(drawable.parent){
				drawable.hide()
			}
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
			else {
				drawable.move({
					x: mousepos.x - mousePrev.x,
					y: mousepos.y - mousePrev.y,
				})
			}    
		})

		$(window).on("mouseup.movePointEnd", ($event) => {
			// return on right or middle mouse button, prevent context menu.
			if (!mouse.button.isLeft($event.button)) {
				$event.preventDefault()
				return
			}
			$(window).off("mousemove.movePointUpdate")
			$(window).off("mouseup.movePointEnd")
			// update drawable status and reselect if its a multi-point-annotation point.
			// show the point when finished moving
			drawable.setChanged()
			if(drawable.parent){
				drawable.parent.setChanged()
				drawable.show()
				selectDrawable(drawable)
				appModel.selectDrawable(drawable)
			}

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

			// reset
			mouse.unsetGlobalCursor()
			mouseStart = undefined
			mousePrev = undefined
			mousepos = undefined
			savedStartState = false
			stateElement = undefined

			appModel.event.changeEvent.update(false)
		})
	})
	// keyboard handler
	$(window).on("keydown.movePoint", $event => {
		if(keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
			keyStates[$event.key] = true
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
	$(window).on("keyup.movePoint", $event => {
		if(stateElement && keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){   
			keyStates[$event.key] = false
			
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
export function disablePointChange(drawable){
	$(drawable.view.html.root).off("mousedown.movePointStart")
	$(window).off("keydown.movePoint")
	$(window).off("keyup.movePoint")
	$(window).off("keydown.multipointInsertPointStart")
	$(window).off("keydown.lineAddPointStart")
}