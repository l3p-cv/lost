import $ from "cash-dom"

import appModel from "siaRoot/appModel"

import "./toolbar.styles.scss"
import * as toolbarView from "./toolbarView"

import imageEventActions from "components/image/imageEventActions"
import toolbarEventActions from "components/toolbar/toolbarEventActions"

// legit, cyclic?
import { enableNavigationButtons, disableNavigationButtons } from "components/properties/propertiesPresenter"


// on init
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
    }
    else {
		console.warn("runntime disabling of tools via config update is not implemented.")
        hide()
    }
})
// on tool change
appModel.controls.tool.on("update", imageEventActions.resetSelection)
console.log(imageEventActions)

export function onCreationStart(){
	console.log(" - on creation start - ")
	disableNavigationButtons()
	toolbarView.disableToolbar()
	imageEventActions.disableSelect()
	imageEventActions.disableDelete(appModel.config.value)
	imageEventActions.disableUndoRedo(appModel.config.value)
	Object.values(appModel.state.drawables).forEach(observableDrawableList => {
		Object.values(observableDrawableList.value).forEach(drawable => {
			drawable.hide()
		})
	})
}
export function onCreationEnd(){
	console.log(" - on creation end - ")
	enableNavigationButtons()
	toolbarView.enableToolbar()
	imageEventActions.enableSelect()
	imageEventActions.enableDelete(appModel.config.value)
	imageEventActions.enableUndoRedo(appModel.config.value)
	Object.values(appModel.state.drawables).forEach(observableDrawableList => {
		Object.values(observableDrawableList.value).forEach(drawable => {
			drawable.show()
		})
	})
}
// set handler depending on tool id string.
export function enableDrawableCreation(toolId: String){
	switch(toolId){
		case "sia-tool-point":
			toolbarEventActions.enablePointCreation()
			break
		case "sia-tool-line":
			toolbarEventActions.enableLineCreation()
			break
		case "sia-tool-polygon":
			toolbarEventActions.enablePolygonCreation()
			break
		case "sia-tool-bbox":
			toolbarEventActions.enableBBoxCreation()
			break
		default: throw new Error("unknown tool id:", toolId)
	}
}
// unset handler depending on tool id string.
export function disableDrawableCreation(toolId: String){
	switch(toolId){
		case "sia-tool-point":
			toolbarEventActions.disablePointCreation()
			break
		case "sia-tool-line":
			toolbarEventActions.disableLineCreation()
			break
		case "sia-tool-polygon":
			toolbarEventActions.disablePolygonCreation()
			break
		case "sia-tool-bbox":
			toolbarEventActions.disableBBoxCreation()
			break
		default: console.warn("unknown tool id.")
	}
}
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

