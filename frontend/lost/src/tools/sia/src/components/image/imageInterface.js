import appModel from "siaRoot/appModel"

import { enableSelect, disableSelect, resetSelection } from "./change-select"
import { enableChange, disableChange } from "./change-global"
import { enableDelete, disableDelete } from "./change-delete"
import { enableUndoRedo, disableUndoRedo } from "./change-undo-redo"

// special layer, not using any other view imports.
// should rewrite this to match nodetemplate id or ref api.
let image = undefined
let svg = undefined
let drawableContainer = undefined
export default {
    getSVG(){
        if(svg === undefined){
            svg = document.getElementById("sia-imgview-svg")
        }
        if(svg === undefined || svg === null){
            throw new Error("Could not find svg element.")
        }
        return svg
    },
    getSVGEmbeddedImage(){
        if(image === undefined){
            image = document.getElementById("sia-imgview-svg-image")
        }
        if(image === undefined || image === null){
            throw new Error("Could not find svg image element.")
        }
        return image
    },
    getDrawableContainer(){
        if(drawableContainer === undefined){
            drawableContainer = document.getElementById("sia-imgview-svg")
            drawableContainer = drawableContainer.querySelector(`[data-ref="drawables"]`)
        }
        if(drawableContainer === undefined || drawableContainer === null){
            throw new Error("Could not find drawable container.")
        }
        return drawableContainer
    },
    getWidth(){
        return parseInt(this.getSVGEmbeddedImage().getAttribute("width"))
    },
    getHeight(){ 
        return parseInt(this.getSVGEmbeddedImage().getAttribute("height"))
    },
    getDimensions(){
        // get current width and height (of image, or container)
        const dimensions = {
            imgW: this.getWidth(),
            imgH: this.getHeight(),
        }
        // check if every value is not undefined
        const valid = Object.values(dimensions).reduce((result, val) => result && (val !== undefined), true)
        if(!valid) { 
            throw new Error("image has bad dimensions.") 
        }
        return dimensions 
    },
	hideDrawables(){
		Object.values(appModel.state.drawables).forEach(observableDrawableList => {
			Object.values(observableDrawableList.value).forEach(drawable => {
				drawable.hide()
			})
		})
	},
	showDrawables(){
		Object.values(appModel.state.drawables).forEach(observableDrawableList => {
			Object.values(observableDrawableList.value).forEach(drawable => {
				drawable.hide()
			})
		})
	},
	enableChange, disableChange,
	enableSelect, disableSelect, resetSelection,
	enableDelete, disableDelete,
	enableUndoRedo, disableUndoRedo,
}

