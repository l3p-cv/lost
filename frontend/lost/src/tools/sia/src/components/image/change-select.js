import appModel from "siaRoot/appModel"

import DrawablePresenter from "drawables/DrawablePresenter"
import BoxPresenter from "drawables/box/BoxPresenter"


// mutates appModel
export function selectDrawable(next: Drawable){
    const curr = appModel.getSelectedDrawable()
    // Don't re-select a drawable if it is allready selected. 
    // If another drawable is currently selected unselect it.
    if(curr instanceof DrawablePresenter && curr !== next){
        // console.log("will unselect:", curr)
        curr.unselect()
        if(curr instanceof BoxPresenter){
            curr.resetEdge()
        }
        if(curr.parent){
            curr.parent.unselect()
        }
    }

    // A drawable will only be selected if it is not allready selected.
    if(curr !== next){
        // console.log("will select:", next)
        next.select()
        appModel.selectDrawable(next)
        if(next.parent){
            next.parent.select()
            if(!appModel.controls.creationEvent.value){
                if(curr){
                    next.parent.previousPoint = curr
                }
                next.parent.currentPoint = next
            }
        }
    }
}
// mutates appModel
export function resetSelection(){
    const drawable = appModel.getSelectedDrawable()
    if(drawable instanceof DrawablePresenter){
        // console.log("reset selection:", drawable)
        appModel.resetDrawableSelection()
        drawable.unselect()
        if(drawable instanceof BoxPresenter){
            drawable.resetEdge()
        }
        if(drawable.parent){
            drawable.parent.unselect()
        }
    }
}