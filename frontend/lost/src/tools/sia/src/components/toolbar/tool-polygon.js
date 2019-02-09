import { mouse, keyboard, svg as SVG, state } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import PointPresenter from "drawables/point/PointPresenter"
import MultipointPresenter from "drawables/multipoint/MultipointPresenter"

import imageInterface from "components/image/imageInterface"
import imageEventActions from "components/image/imageEventActions"

// legit, cyclic?
import { addDrawable, removeDrawable } from "components/image/imagePresenter"
const imagePresenter = { addDrawable, removeDrawable }

// legit, cyclic?
import { onCreationStart, onCreationEnd } from "./toolbarPresenter"
const toolbarPresenter = { onCreationStart, onCreationEnd }



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
		imagePresenter.addDrawable(firstPoint)
		imageEventActions.selectDrawable(firstPoint)
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
		imagePresenter.removeDrawable(firstPoint)
		// when a drawable is added to the appModel, the imagePresenter is notificated and adds the drawable.
		imagePresenter.addDrawable(line)
		imageEventActions.selectDrawable(line.model.points[1])
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
		imagePresenter.removeDrawable(line)
		// when a drawable is added to the appModel, the imagePresenter is notificated and adds the drawable.
		imagePresenter.addDrawable(polygon)
		imageEventActions.selectDrawable(polygon.model.points[2])
	}
	// else add a point to the polygon.
	else {
		currentPoint = polygon.addPoint(mousepos)
		if(currentPoint){
			imageEventActions.selectDrawable(currentPoint)
		}
	}
}
function deletePolygonPoint(){
	// first point
	if(firstPoint && !line){
		imagePresenter.removeDrawable(firstPoint)
		firstPoint = undefined
	}
	// second point
	else if(line && !polygon){
		// remove the line from model and image view (event bound).
		imagePresenter.removeDrawable(line)
		line = undefined
		// re-create the first point, add and select it.
		firstPoint = new PointPresenter({
			data: firstPoint.model.relBounds, 
			isNoAnnotation: true,
		})
		imagePresenter.addDrawable(firstPoint)
		imageEventActions.selectDrawable(firstPoint)
	}
	// third point
	else if(polygon && polygon.model.points.length === 3){
		// remove the polygon
		imagePresenter.removeDrawable(polygon)
		polygon = undefined
		// recreate the line and add the line
		line = new MultipointPresenter({
			data: line.model.relPointData,
			type: "line",
		})
		imagePresenter.addDrawable(line)
		imageEventActions.selectDrawable(line.model.points[1])
	}
	// 4+n point
	else if(polygon) {
		polygon.removePoint(polygon.model.points[polygon.model.points.length - 1])
		imageEventActions.selectDrawable(polygon.model.points[polygon.model.points.length - 1])
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
	} else {
		console.log({firstPoint, line, polygon})
		appModel.resetDrawableSelection()
		if(firstPoint && !line && !polygon){
			imagePresenter.removeDrawable(firstPoint)
		}
		if(line && !polygon){
			imagePresenter.removeDrawable(line)
		}
	}

	// reset creation context
	firstPoint = undefined
	line = undefined
	polygon = undefined

	toolbarPresenter.onCreationEnd()
}

export function enablePolygonCreation(){
	$(imageInterface.getSVG()).on("mousedown.createPolygonPoint", ($event) => {
		if(keyboard.isNoModifierHit($event) && mouse.button.isRight($event.button)){
			toolbarPresenter.onCreationStart()
		}
	})
	$(imageInterface.getSVG()).on("mouseup.createPolygonPoint", ($event) => {
		// prevent context menu
		$event.preventDefault()
		// create or extend polygon.
		if(keyboard.isNoModifierHit($event) && mouse.button.isRight($event.button)){
			addPolygonPoint($event)
		}
	})
	$(window).on("dblclick.finishPolygon", ($event) => {
		if(firstPoint !== undefined || line !== undefined || polygon !== undefined){
			if(keyboard.isNoModifierHit($event) && mouse.button.isLeft($event.button)){
				finishPolygon()
			}
		}
	})
	$(window).on("keydown.finishPolygon", ($event) => {
		if(keyboard.isKeyHit($event, ["Escape", "Enter"])){
			finishPolygon()
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
}