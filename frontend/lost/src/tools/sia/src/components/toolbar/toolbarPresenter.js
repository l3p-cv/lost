import $ from "cash-dom"

import appModel from "../../appModel"

import "./toolbar.styles.scss"
import * as toolbarView from "./toolbarView"

import * as propertiesPresenter from "components/properties/propertiesPresenter"

import { enableBBoxCreation, disableBBoxCreation } from "./tool-bbox"
import { enablePointCreation, disablePointCreation } from "./tool-point"
import { disableLineCreation, enableLineCreation } from "./tool-line"
import { enablePolygonCreation, disablePolygonCreation } from "./tool-polygon"
import { disableDelete, enableDelete } from "components/image/change-delete"
import { enableSelect, disableSelect } from "components/image/change-select"
import { undo, redo } from "components/image/change-undo-redo"

import { resetSelection } from "components/image/change-select"

// during drawable creation
// - hide other drawables
// - disable ordinary delete
// - (disable redo and undo)
appModel.controls.creationEvent.on("change", isActive => {
	if(isActive){
		// the toolbars multipoint drawable creation has its own delete handlers 
		disableSelect()
		disableDelete()
		// hide other drawables
		Object.values(appModel.state.drawables).forEach(observableDrawableList => {
			Object.values(observableDrawableList.value).forEach(drawable => {
				drawable.hide()
			})
		})
		$(window).off("keydown.undo")
		$(window).off("keydown.redo")
	} else {
		enableSelect()
		enableDelete()
		// show other drawables
		Object.values(appModel.state.drawables).forEach(observableDrawableList => {
			Object.values(observableDrawableList.value).forEach(drawable => {
				drawable.show()
			})
		})
		$(window).off("keydown.undo").on("keydown.undo", undo)
		$(window).off("keydown.redo").on("keydown.redo", redo)
	}
})
appModel.controls.creationEvent.on("change", isActive => propertiesPresenter.onDrawableCreation(isActive))
appModel.controls.tool.on("update", resetSelection)
appModel.config.on("update", config => {
    if(config.actions.drawing){
        show()
		// show or hide tools depending on config
        toolbarView.initTools(config.tools)

		// update selected tool observable on click
		$(toolbarView.html.ids["sia-toolbar-container"]).on("click", "button", ($event) => {
			appModel.controls.tool.update($event.target.closest("button").id)
		})

		// activate tool when observable updates
        appModel.controls.tool.on("update", (toolId) => {
			toolbarView.activateTool(toolId)
			enableDrawableCreation(toolId)
		})

		// deactivate previous selected tool if any
        appModel.controls.tool.on("before-update", (toolId) => {
            if(toolId){
				toolbarView.deactivateTool(toolId)
                disableDrawableCreation(toolId)
            }
        })

		// activate first tool in list
		const enabledToolNames = Object.entries(config.tools)
			.filter(tool => tool[1] === true)
			.map(tool => tool[0])
		if(enabledToolNames.length > 0){
			const firstTool = enabledToolNames[0]
			toolbarView.html.refs[firstTool].click()
		}

        // set handler depending on tool id string.
        function enableDrawableCreation(toolId: String){
            switch(toolId){
                case "sia-tool-point":
					enablePointCreation()
                    break
                case "sia-tool-line":
                    enableLineCreation()
                    break
                case "sia-tool-polygon":
					enablePolygonCreation()
                    break
                case "sia-tool-bbox":
					enableBBoxCreation()
                    break
                default: throw new Error("unknown tool id:", toolId)
            }
        }
        // unset handler depending on tool id string.
        function disableDrawableCreation(toolId: String){
            switch(toolId){
                case "sia-tool-point":
                    disablePointCreation()
                    break
                case "sia-tool-line":
                    disableLineCreation()
                    break
                case "sia-tool-polygon":
					disablePolygonCreation()
                    break
                case "sia-tool-bbox":
					disableBBoxCreation()
                    break
                default: console.warn("unknown tool id.")
            }
        }
    }
    else {
		console.warn("runntime disabling of tools via config update is not implemented.")
        hide()
    }
})


export function setLayout(layout: String){
    toolbarView.setLayout(layout)
}
export function show(){
    toolbarView.show()
}
export function hide(){
    toolbarView.hide()
}
export function getWidth(){
    return toolbarView.getWidth()
}
export function getHeight(){
    return toolbarView.getHeight()
}

