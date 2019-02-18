import { mouse, keyboard, svg as SVG, state } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import PointPresenter from "drawables/point/PointPresenter"
import MultipointPresenter from "drawables/multipoint/MultipointPresenter"

import imageInterface from "components/image/imageInterface"

// trying to get around cyclics.
import { selectDrawable } from "components/image/change-select"
import { addDrawable } from "components/image/change-add"
import { removeDrawable } from "components/image/change-delete"
const imageEventActions = { selectDrawable, addDrawable, removeDrawable }



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
		imageEventActions.addDrawable(firstPoint)
		firstPoint.select()
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
		imageEventActions.removeDrawable(firstPoint)
		// when a drawable is added to the appModel, the imagePresenter is notificated and adds the drawable.
		imageEventActions.addDrawable(line)
		firstPoint.unselect()
		line.model.points[1].select()
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
		imageEventActions.removeDrawable(line)
		// when a drawable is added to the appModel, the imagePresenter is notificated and adds the drawable.
		imageEventActions.addDrawable(polygon)
		polygon.model.points[1].unselect()
		polygon.model.points[2].select()
	}
	// else add a point to the polygon.
	else {
		currentPoint = polygon.addPoint(mousepos)
		if(currentPoint){
			polygon.model.points[polygon.model.points.length - 2].unselect()
			currentPoint.select()
		}
	}
}
function deletePolygonPoint(){
	// first point
	if(firstPoint && !line){
		imageEventActions.removeDrawable(firstPoint)
		firstPoint = undefined
		appModel.event.creationEvent.update(false)
	}
	// second point
	else if(line && !polygon){
		// remove the line from model and image view (event bound).
		imageEventActions.removeDrawable(line)
		line = undefined
		// re-create the first point, add and select it.
		firstPoint = new PointPresenter({
			data: firstPoint.model.relBounds, 
			isNoAnnotation: true,
		})
		imageEventActions.addDrawable(firstPoint)
		firstPoint.select()
	}
	// third point
	else if(polygon && polygon.model.points.length === 3){
		// remove the polygon
		imageEventActions.removeDrawable(polygon)
		polygon = undefined
		// recreate the line and add the line
		line = new MultipointPresenter({
			data: line.model.relPointData,
			type: "line",
		})
		imageEventActions.addDrawable(line)
		line.model.points[1].select()
	}
	// 4+n point
	else if(polygon) {
		polygon.removePoint(polygon.model.points[polygon.model.points.length - 1])
		polygon.model.points[polygon.model.points.length - 1].select()
	}
}
function finishPolygon(){
	if(!polygon){
		throw new Error("Can not finish. 'polygon' is undefined.")
	}
	state.add(new state.StateElement({
		do: {
			data: { polygon },
			fn: (data) => {
				const { polygon } = data
				appModel.addDrawable(polygon)
				imageEventActions.selectDrawable(polygon)
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
	appModel.addDrawable(polygon)
	polygon.model.points[polygon.model.points.length-1].unselect()
	imageEventActions.selectDrawable(polygon)
	// show menu bar after creation
	if(polygon.menuBar){
		polygon.menuBar.show()
	}

	// reset creation context
	firstPoint = undefined
	line = undefined
	polygon = undefined

	appModel.event.creationEvent.update(false)
}
function cancelPolygonCreation(){
	// remove point from view
	if(firstPoint){
		imageEventActions.removeDrawable(firstPoint)
	}
	// remove line from view
	if(line){
		imageEventActions.removeDrawable(line)
	}
	// remove polygon from view
	if(polygon){
		imageEventActions.removeDrawable(polygon)
	}

	// reset creation context
	firstPoint = undefined
	line = undefined
	polygon = undefined

	appModel.event.creationEvent.update(false)
}
export function enablePolygonCreation(){
	$(imageInterface.getSVG()).on("mousedown.createPolygonPoint", ($event) => {
		if(mouse.button.isRight($event.button)){
			appModel.event.creationEvent.update(true)
		}
	})
	$(imageInterface.getSVG()).on("mouseup.createPolygonPoint", ($event) => {
		// prevent context menu
		$event.preventDefault()
		// create or extend polygon.
		if(mouse.button.isRight($event.button)){
			addPolygonPoint($event)
		}
	})
	$(window).on("dblclick.finishPolygon", ($event) => {
		if(polygon 
			&& keyboard.isNoModifierHit($event)
			&& mouse.button.isLeft($event.button)
		){
			finishPolygon()
		}
	})
	$(window).on("keydown.finishPolygon", ($event) => {
		if(polygon 
			&& keyboard.isNoModifierHit($event)
			&& keyboard.isKeyHit($event, ["Enter"])
		){
			finishPolygon()
		}
	})
	$(window).on("keydown.cancelPolygonCreation", ($event) => {
		if(keyboard.isKeyHit($event, ["Escape"])){
			cancelPolygonCreation()
		}
	})
	$(window).on("keydown.deletePolygonPoint", ($event) => {
		if((firstPoint || line || polygon) && keyboard.isKeyHit($event, "Delete")){
			deletePolygonPoint()
		}
	})
}

export function disablePolygonCreation(){
	$(imageInterface.getSVG()).off("mousedown.createPolygonPoint")
	$(imageInterface.getSVG()).off("mouseup.createPolygonPoint")
	$(window).off("keydown.deletePolygonPoint")
	$(window).off("keydown.finishPolygon")
	$(window).off("dblclick.finishPolygon")
	$(window).off("keydown.cancelPolygonCreation")
}