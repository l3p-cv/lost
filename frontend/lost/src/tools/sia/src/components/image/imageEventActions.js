import appModel from "siaRoot/appModel"

import { enableSelect, disableSelect, resetSelection, selectDrawable } from "./change-select"
import { enableChange, disableChange } from "./change-global"
import { enableDelete, disableDelete, removeDrawable } from "./change-delete"
import { enableUndoRedo, disableUndoRedo } from "./change-undo-redo"

import { addDrawable } from "./change-add"


export default {
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
	resetSelection, selectDrawable,
	enableSelect, disableSelect, 
	enableChange, disableChange,
	enableDelete, disableDelete,
	enableUndoRedo, disableUndoRedo,
	addDrawable, removeDrawable,
}