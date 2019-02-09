import { keyboard, state } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import imageEventActions from "./imageEventActions"


export function enableDelete(config){
	disableDelete()
	if(config.actions.edit.delete){
		$(window).on("keydown.drawableDelete", ($event) => {
			if(keyboard.isKeyHit($event, "Delete")){
				if(appModel.isADrawableSelected()){
					console.log("delete (image handler)")
					$event.preventDefault()
					const selectedDrawable = appModel.getSelectedDrawable()
					if(selectedDrawable.isDeletable()){
						// for points of multipoint drawables:
						if(selectedDrawable.parent){
							if(selectedDrawable.parent.model.type === "line"){
								if(selectedDrawable.parent.model.points.length <= 2) return
							} else if(selectedDrawable.parent.model.type === "polygon"){
								if(selectedDrawable.parent.model.points.length <= 3) return
							}
							selectedDrawable.parent.removePoint(selectedDrawable)
							imageEventActions.selectDrawable(selectedDrawable.parent)
						} 
						// for drawables:
						else {
							// save state
							state.add(new state.StateElement({
								do: {
									data: { drawable: selectedDrawable },
									fn: (data) => {
										data.drawable.delete()
										appModel.deleteDrawable(data.drawable)
									}
								},
								undo: {
									data: { drawable: selectedDrawable },
									fn: (data) => {
										appModel.addDrawable(data.drawable)
										imageEventActions.selectDrawable(data.drawable)
									}
								}
							}))
							// execute
							selectedDrawable.delete()
							appModel.deleteDrawable(selectedDrawable)
						}
					}
				}
			}
		})
	}
}
export function disableDelete(){
    $(window).off("keydown.drawableDelete")
}
