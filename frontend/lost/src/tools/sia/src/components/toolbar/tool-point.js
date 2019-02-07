import { mouse, keyboard, svg as SVG, state } from "l3p-frontend"

import PointPresenter from "drawables/point/PointPresenter"

import appModel from "siaRoot/appModel"

import imageInterface from "components/image/imageInterface"
import { selectDrawable } from "components/image/change-select"
import { onCreationStart, onCreationEnd } from "components/toolbar/toolbarPresenter"


export function enablePointCreation(){
	$(imageInterface.getSVG()).on("mousedown.createPoint", ($event) => {
		if(!keyboard.isAModifierHit($event) && mouse.button.isRight($event.button)){
			onCreationStart()
		}
	})
	$(imageInterface.getSVG()).on("mouseup.createPoint", ($event) => {
		if(!keyboard.isAModifierHit($event) && mouse.button.isRight($event.button)){
			// console.warn("create point handler(executed)")
			$event.preventDefault()
			const { imgW, imgH } = imageInterface.getDimensions()
			let mousepos = mouse.getMousePosition($event, imageInterface.getSVG())
			// calculate the real mouseposition (@zoom)
			const svg = imageInterface.getSVG()
			const zoom = appModel.ui.zoom.value
			mousepos = {
				x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
				y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
			}
			const point = new PointPresenter({
				data: {
					x: (mousepos.x / imgW),
					y: (mousepos.y / imgH),
				}
			})
			// add redo and undo
			state.add(new state.StateElement({
				do: {
					data: { point },
					fn: (data) => {
						const { point } = data
						appModel.addDrawable(point)
						selectDrawable(point)
					}
				},
				undo: {
					data: { point },
					fn: (data) => {
						const { point } = data
						point.delete()
						appModel.deleteDrawable(point)
					}
				}
			}))
			appModel.addDrawable(point)
			selectDrawable(point)
			onCreationEnd()
		}
	})
}
export function disablePointCreation(){
	$(imageInterface.getSVG()).off("mousedown.createPoint")
	$(imageInterface.getSVG()).off("mouseup.createPoint")
}