import $ from "cash-dom"

import appModel from "../../appModel"

import "./toolbar.styles.scss"
import * as toolbarView from "./toolbarView"

import imageInterface from "components/image/imageInterface"
import propertiesInterface from "components/properties/propertiesInterface"
// This below should become propertiesInterface.
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
appModel.controls.tool.on("update", imageInterface.resetSelection)


export function onCreationStart(){
	console.log(" - on creation start - ")
	disableNavigationButtons()
	toolbarView.disableToolbar()
	imageInterface.disableSelect()
	imageInterface.disableDelete(appModel.config.value)
	imageInterface.disableUndoRedo(appModel.config.value)
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
	imageInterface.enableSelect()
	imageInterface.enableDelete(appModel.config.value)
	imageInterface.enableUndoRedo(appModel.config.value)
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
			propertiesInterface.enablePointCreation()
			break
		case "sia-tool-line":
			propertiesInterface.enableLineCreation()
			break
		case "sia-tool-polygon":
			propertiesInterface.enablePolygonCreation()
			break
		case "sia-tool-bbox":
			propertiesInterface.enableBBoxCreation()
			break
		default: throw new Error("unknown tool id:", toolId)
	}
}
// unset handler depending on tool id string.
export function disableDrawableCreation(toolId: String){
	switch(toolId){
		case "sia-tool-point":
			propertiesInterface.disablePointCreation()
			break
		case "sia-tool-line":
			propertiesInterface.disableLineCreation()
			break
		case "sia-tool-polygon":
			propertiesInterface.disablePolygonCreation()
			break
		case "sia-tool-bbox":
			propertiesInterface.disableBBoxCreation()
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

