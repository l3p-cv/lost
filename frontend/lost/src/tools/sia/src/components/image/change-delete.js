import { keyboard, state } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import { selectDrawable } from "./change-select"


export function enableDelete(){
    $(window).on("keydown.drawableDelete", ($event) => {
        if(keyboard.isKeyHit($event, "Delete")){
            if(appModel.isADrawableSelected()){
				console.log("image delete drawable")
                $event.preventDefault()
                const selectedDrawable = appModel.getSelectedDrawable()
                if(selectedDrawable.isDeletable()){
                    // for multipoint drawables:
                    if(selectedDrawable.parent){
                        if(selectedDrawable.parent.model.type === "line"){
                            if(selectedDrawable.parent.model.points.length <= 2) return
                        } else if(selectedDrawable.parent.model.type === "polygon"){
                            if(selectedDrawable.parent.model.points.length <= 3) return
                        }
                        selectedDrawable.parent.removePoint(selectedDrawable)
                    } 
                    // for drawables:
                    else {
                        // add redo and undo
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
                                    selectDrawable(data.drawable)
                                }
                            }
                        }))
                        selectedDrawable.delete()
                        appModel.deleteDrawable(selectedDrawable)
                    }
                }
            }
        }
    })
}
export function disableDelete(){
    $(window).off("keydown.drawableDelete")
}
