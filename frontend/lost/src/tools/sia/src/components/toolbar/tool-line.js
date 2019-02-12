import { mouse, keyboard, svg as SVG, state } from "l3p-frontend"

import PointPresenter from "drawables/point/PointPresenter"
import MultipointPresenter from "drawables/multipoint/MultipointPresenter"

import appModel from "siaRoot/appModel"

import imageInterface from "components/image/imageInterface"

// trying to get around cyclics.
import { selectDrawable } from "components/image/change-select"
import { addDrawable } from "components/image/change-add"
import { removeDrawable } from "components/image/change-delete"
const imageEventActions = { selectDrawable, addDrawable, removeDrawable }
// import imageEventActions from "components/image/imageEventActions"

// // legit, cyclic?
// import { onCreationStart, onCreationEnd } from "./toolbarPresenter"
// const toolbarPresenter = { onCreationStart, onCreationEnd }


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
		imageEventActions.addDrawable(firstPoint)
		imageEventActions.selectDrawable(firstPoint)
	}
	// else if no line was created before, create a initial line, and show it, remove the initial point.
	else if(!line) {
		line = new MultipointPresenter({
			data: [ firstPoint.model.relBounds, { x: mousepos.x / imgW, y: mousepos.y / imgH } ],
			type: "line",
		})
		// hide menubar during creation
		if(line.menuBar){
			line.menuBar.hide()
		}
		imageEventActions.removeDrawable(firstPoint)
		imageEventActions.addDrawable(line)
		// select the second point of the line as indicator.
		imageEventActions.selectDrawable(line.model.points[1])
	}
	// else add a point to the line.
	else {
		currentPoint = line.addPoint(mousepos)
		if(currentPoint){
			imageEventActions.selectDrawable(currentPoint)
		}
	}
}
function deleteLinePoint(){
	// first point
	if(firstPoint && !line){
		imageEventActions.removeDrawable(firstPoint)
		firstPoint = undefined
	}
	// second point
	if(line && line.model.points.length === 2){
		// remove the line from view
		imageEventActions.removeDrawable(line)
		line = undefined
		// re-create the first point, add and select it.
		firstPoint = new PointPresenter({
			data: firstPoint.model.relBounds, 
			isNoAnnotation: true,
		})
		imageEventActions.addDrawable(firstPoint)
		imageEventActions.selectDrawable(firstPoint)
	}
	// 3+n point
	else if(line){
		line.removePoint(line.model.points[line.model.points.length - 1])
		imageEventActions.selectDrawable(line.model.points[line.model.points.length - 1])
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
					imageEventActions.selectDrawable(line)
				}
			},
			undo: {
				data: { line },
				fn: (data) => {
					const { line } = data
					line.delete()
					appModel.deleteDrawable(line)
				}
			}
		}))
		appModel.addDrawable(line)
		line.model.points[line.model.points.length-1].unselect()
		imageEventActions.selectDrawable(line)
		// show menu bar after creation
		if(line.menuBar){
			line.menuBar.show()
		}
	} 
	else {
		appModel.resetDrawableSelection()
		if(firstPoint && !line){
			imageEventActions.removeDrawable(firstPoint)
		}
	}

	// reset creation context
	firstPoint = undefined
	line = undefined

	appModel.event.creationEvent.update(false)
	// toolbarPresenter.onCreationEnd()
}

export function enableLineCreation(onStart, onEnd){
	$(imageInterface.getSVG()).on("mousedown.createLinePoint", ($event) => {
		if(keyboard.isNoModifierHit($event) && mouse.button.isRight($event.button)){
			appModel.event.creationEvent.update(true)
			// toolbarPresenter.onCreationStart()
		}
	})
	$(imageInterface.getSVG()).on("mouseup.createLinePoint", ($event) => {
		// prevent context menu
		$event.preventDefault()
		// create or extend line.
		if(keyboard.isNoModifierHit($event) && mouse.button.isRight($event.button)){
			addLinePoint($event)
		}
	})
	// if in trouble, notice: left mouse button is also used in point change event handlers (imagePresenter)
	$(window).on("dblclick.finishLine", ($event) => {
		if(line && keyboard.isNoModifierHit($event) && mouse.button.isLeft($event.button)){
			finishLine()
		}
	})
	$(window).on("keydown.finishLine", ($event) => {
		if(keyboard.isKeyHit($event, ["Escape", "Enter"])){
			finishLine()
		}
	})
	$(window).on("keydown.deleteLinePoint", ($event) => {
		if((firstPoint || line) && keyboard.isKeyHit($event, "Delete")){
			deleteLinePoint()
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