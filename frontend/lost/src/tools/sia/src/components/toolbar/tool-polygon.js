import { mouse, keyboard, svg as SVG, state } from "l3p-frontend"

import PointPresenter from "drawables/point/PointPresenter"
import MultipointPresenter from "drawables/multipoint/MultipointPresenter"

import appModel from "siaRoot/appModel"

import imageInterface from "components/image/imageInterface"
import { selectDrawable } from "components/image/change-select"


let currentPoint = undefined
let firstPoint = undefined
let line = undefined
let polygon = undefined
function addPolygonPoint($event){
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
		// imagePresenter.addDrawable(firstPoint)
		appModel.addDrawable(firstPoint)
		selectDrawable(firstPoint)
	}
	// else if no line was created before, create a initial line, and show it, remove the initial point.
	else if(!line) {
		line = new MultipointPresenter({
			data: [ firstPoint.model.relBounds, { x: mousepos.x / imgW, y: mousepos.y / imgH } ],
			type: "line",
		})
		// hide the menu bar during creation
		if(line.menuBar){
			line.menuBar.hide()
		}
		// imagePresenter.removeDrawable(firstPoint)
		appModel.deleteDrawable(firstPoint)
		// when a drawable is added to the appModel, the imagePresenter is notificated and adds the drawable.
		// imagePresenter.addDrawable(line)
		appModel.addDrawable(line)
		selectDrawable(line.model.points[1])
	}
	else if(!polygon){
		polygon = new MultipointPresenter({
			data: [ firstPoint.model.relBounds, line.model.relPointData[1], { x: mousepos.x / imgW, y: mousepos.y / imgH } ],
			type: "polygon",
		})
		// hide the menu bar during creation
		if(polygon.menuBar){
			polygon.menuBar.hide()
		}
		// imagePresenter.removeDrawable(line)
		appModel.deleteDrawable(line)
		// when a drawable is added to the appModel, the imagePresenter is notificated and adds the drawable.
		appModel.addDrawable(polygon)
		selectDrawable(polygon.model.points[2])
	}
	// else add a point to the polygon.
	else {
		currentPoint = polygon.addPoint(mousepos)
		if(currentPoint){
			selectDrawable(currentPoint)
		}
	}
}
function deletePolygonPoint(){
	// first point
	if(firstPoint && !line){
		// imagePresenter.removeDrawable(firstPoint)
		appModel.deleteDrawable(firstPoint)
		firstPoint = undefined
	}
	// second point
	else if(line && !polygon){
		// remove the line from model and image view (event bound).
		// imagePresenter.removeDrawable(line)
		appModel.deleteDrawable(line)
		line = undefined
		// re-create the first point, add and select it.
		firstPoint = new PointPresenter({
			data: firstPoint.model.relBounds, 
			isNoAnnotation: true,
		})
		// imagePresenter.addDrawable(firstPoint)
		appModel.addDrawable(firstPoint)
		selectDrawable(firstPoint)
	}
	// third point
	else if(polygon && polygon.model.points.length === 3){
		// remove the polygon
		appModel.deleteDrawable(polygon)
		polygon = undefined
		// recreate the line and add the line
		line = new MultipointPresenter({
			data: line.model.relPointData,
			type: "line",
		})
		// imagePresenter.addDrawable(line)
		appModel.addDrawable(line)
		selectDrawable(line.model.points[1])
	}
	// 4+n point
	else if(polygon) {
		polygon.removePoint(polygon.model.points[polygon.model.points.length - 1])
		selectDrawable(polygon.model.points[polygon.model.points.length - 1])
	}
}
function finishPolygon(){
	if(polygon){
		state.add(new state.StateElement({
			do: {
				data: { polygon },
				fn: (data) => {
					const { polygon } = data
					appModel.addDrawable(polygon)
					selectDrawable(polygon)
				},
			},
			undo: {
				data: { polygon },
				fn: (data) => {
					const { polygon } = data
					polygon.delete()
					appModel.deleteDrawable(polygon)
				},
			}
		}))
		appModel.selectDrawable(polygon)
		polygon.model.points[polygon.model.points.length-1].unselect()
		polygon.select()
		// show menu bar after creation
		if(polygon.menuBar){
			polygon.menuBar.show()
		}
	} else if(line){
		// imagePresenter.removeDrawable(line)
		appModel.deleteDrawable(line)
	} else if(firstPoint){
		// imagePresenter.removeDrawable(firstPoint)
		appModel.deleteDrawable(firstPoint)
	}

	// reset creation context
	firstPoint = undefined
	line = undefined
	polygon = undefined
}

export function enablePolygonCreation(){
	$(imageInterface.getSVG()).on("mousedown.createPolygonPoint", ($event) => {
		if(mouse.button.isRight($event.button)){
			if(appModel.controls.changeEvent.value === false){
				appModel.controls.creationEvent.update(true)
			}
		}
	})
	$(imageInterface.getSVG()).on("mouseup.createPolygonPoint", ($event) => {
		// console.log("create polygon handler (triggered)")
		$event.preventDefault()
		// @QUICK-FIX-1: when selected, and adding points by ctrl or alt feature, no new drawable should be created.
		// @QUICK-FIX-1: currently not switching of this handler.
		if(keyboard.isAModifierHit($event)){
			return
		}
		// create or extend line.
		if(mouse.button.isRight($event.button)){
			// console.warn("create polygon handler (executed add)")
			addPolygonPoint($event)
		}
	})
	$(window).on("dblclick.finishPolygon", ($event) => {
		if(firstPoint !== undefined || line !== undefined || polygon !== undefined){
			// if(!$event.target.closest("#sia-imgview-svg")){
			// @uncomment: felt ugly to be forced to click on a free area to finish drawing.
			if(mouse.button.isLeft($event.button)){
				finishPolygon()
				// if(appModel.controls.changeEvent.value === false){
					appModel.controls.creationEvent.update(false)
				// }
			}
		}
	})
	$(window).on("keydown.finishPolygon", ($event) => {
		if(appModel.controls.creationEvent.value){
			if(keyboard.isKeyHit($event, ["Escape", "Enter"])){
				// console.warn("create polygon handler (executed finish)")
				finishPolygon()
				// if(appModel.controls.changeEvent.value === false){
					appModel.controls.creationEvent.update(false)
				// }
			}
		}
	})
	$(window).on("keydown.deletePolygonPoint", ($event) => {
		if(appModel.controls.creationEvent.value){
			if(keyboard.isKeyHit($event, "Delete")){
				deletePolygonPoint()
			}
		}
	})
}

export function disablePolygonCreation(){
	$(imageInterface.getSVG()).off("mousedown.createPolygonPoint")
	$(imageInterface.getSVG()).off("mouseup.createPolygonPoint")
	$(window).off("keydown.deletePolygonPoint")
	$(window).off("keydown.finishPolygon")
	$(window).off("dblclick.finishPolygon")
}