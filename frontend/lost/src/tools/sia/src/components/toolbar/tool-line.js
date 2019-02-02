import { mouse, keyboard, svg as SVG, state } from "l3p-frontend"

import PointPresenter from "drawables/point/PointPresenter"
import MultipointPresenter from "drawables/multipoint/MultipointPresenter"

import appModel from "siaRoot/appModel"

import imageInterface from "components/image/imageInterface"
import { selectDrawable } from "components/image/change-select"


let firstPoint = undefined
let currentPoint = undefined
let line = undefined
function addLinePoint($event){
	const { imgW, imgH } = imageInterface.getDimensions()
	let mousepos = mouse.getMousePosition($event, imageInterface.getSVG())
	// calculate the real mouseposition (@zoom)
	const svg = imageInterface.getSVG()
	const zoom = appModel.ui.zoom.value
	mousepos = {
		x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
		y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
	}
	// if no points were created before, create an initial point and show it.
	if(!firstPoint){
		firstPoint = new PointPresenter({ 
			data: { x: mousepos.x / imgW, y: mousepos.y / imgH }, 
			isNoAnnotation: true,
		})
		state.add(new state.StateElement({
			do: {
				data: { $event },
				fn: (data) => {
					const { $event } = data
					addLinePoint($event)
					window.one = $event
				},
			},
			undo: {
				data: { firstPoint },
				fn: (data) => {
					deleteLinePoint()
				},
			}
		}))
		appModel.addDrawable(firstPoint)
		selectDrawable(firstPoint)
		console.log("added line point")
	}
	// else if no line was created before, create a initial line, and show it, remove the initial point.
	else if(!line) {
		line = new MultipointPresenter({
			data: [ firstPoint.model.relBounds, { x: mousepos.x / imgW, y: mousepos.y / imgH } ],
			type: "line",
		})
		state.add(new state.StateElement({
			do: {
				data: { $event },
				fn: (data) => {
					console.log("redo point")
					const { $event } = data
					addLinePoint($event)
					window.two = $event
				},
			},
			undo: {
				data: { line },
				fn: (data) => {
					deleteLinePoint()
				},
			}
		}))
		// hide menubar during creation
		if(line.menuBar){
			line.menuBar.hide()
		}
		appModel.deleteDrawable(firstPoint)
		appModel.addDrawable(line)
		// select the second point of the line as indicator.
		selectDrawable(line.model.points[1])
	}
	// else add a point to the line.
	else {
		currentPoint = line.addPoint(mousepos)
		if(currentPoint){
			state.add(new state.StateElement({
				do: {
					data: { $event },
					fn: (data) => {
						const { $event } = data
						addLinePoint($event)
					},
				},
				undo: {
					data: { line },
					fn: (data) => {
						deleteLinePoint()
					},
				}
			}))
			selectDrawable(currentPoint)
		}
	}
}
function deleteLinePoint(){
	console.log("delete line point (toolbar handler)")
	// first point
	if(firstPoint && !line){
		appModel.deleteDrawable(firstPoint)
		firstPoint = undefined
		appModel.controls.creationEvent.update(false)
	}
	// second point
	if(line && line.model.points.length === 2){
		// remove the line from view
		appModel.deleteDrawable(line)
		line = undefined
		// re-create the first point, add and select it.
		firstPoint = new PointPresenter({
			data: firstPoint.model.relBounds, 
			isNoAnnotation: true,
		})
		appModel.addDrawable(firstPoint)
		selectDrawable(firstPoint)
	}
	// 3+n point
	else if(line){
		line.removePoint(line.model.points[line.model.points.length - 1])
		selectDrawable(line.model.points[line.model.points.length - 1])
	}
}
function finishLine(){
	if(line){
		state.add(new state.StateElement({
			do: {
				data: { line },
				fn: (data) => {
					const { line } = data
					appModel.addDrawable(line)
					selectDrawable(line)
				},
			},
			undo: {
				data: { line },
				fn: (data) => {
					const { line } = data
					line.delete()
					appModel.deleteDrawable(line)
				},
			}
		}))
		appModel.selectDrawable(line)
		line.model.points[line.model.points.length-1].unselect()
		line.select()
		// show menu bar after creation
		if(line.menuBar){
			line.menuBar.show()
		}
	} else {
		throw new Error("tried to finish line but line was undefined.")
	}

	// reset creation context
	line = undefined
	firstPoint = undefined

	appModel.controls.creationEvent.update(false)
}

export function enableLineCreation(){
	$(imageInterface.getSVG()).on("mousedown.createLinePoint", ($event) => {
		if(mouse.button.isRight($event.button)){
			if(appModel.controls.changeEvent.value === false){
				appModel.controls.creationEvent.update(true)
			}
		}
	})
	$(imageInterface.getSVG()).on("mouseup.createLinePoint", ($event) => {
		$event.preventDefault()
		// @QUICK-FIX-1: when selected, and adding points by ctrl or alt feature, no new drawable should be created.
		// @QUICK-FIX-1: currently not switching of this handler.
		if(keyboard.isAModifierHit($event)){
			return
		}
		// create or extend line.
		if(mouse.button.isRight($event.button)){
			addLinePoint($event)
		}
	})
	// left mouse button is also used in point change event handlers (imagePresenter)
	$(window).on("dblclick.finishLine", ($event) => {
		if(appModel.controls.creationEvent.value === true){
			if(appModel.controls.changeEvent.value === false){
				if(firstPoint !== undefined || line !== undefined){
					if(mouse.button.isLeft($event.button)){
						finishLine()
					}
				}
			}
		}
	})
	$(window).on("keydown.finishLine", ($event) => {
		if(appModel.controls.creationEvent.value === true){
			if(appModel.controls.changeEvent.value === false){
				if(keyboard.isKeyHit($event, ["Escape", "Enter"])){
					finishLine()
				}
			}
		}
	})
	$(window).on("keydown.deleteLinePoint", ($event) => {
		if(appModel.controls.creationEvent.value === true){
			if(appModel.controls.changeEvent.value === false){
				if(keyboard.isKeyHit($event, "Delete")){
					deleteLinePoint()
				}
			}
		}
	})
}
export function disableLineCreation(){
	$(imageInterface.getSVG()).off("mousedown.createLinePoint")
	$(imageInterface.getSVG()).off("mouseup.createLinePoint")
	$(window).off("keydown.deleteLinePoint")
	$(window).off("keydown.finishLine")
	$(window).off("dblclick.finishLine")
}