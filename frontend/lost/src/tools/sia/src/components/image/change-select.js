import { keyboard, mouse } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import imageInterface from "./imageInterface"


export function selectDrawable(next: Drawable){
    if(!next){
        return
    }
    const curr = appModel.getSelectedDrawable()
    // Don't re-select a drawable if it is allready selected. 
    // If another drawable is currently selected unselect it.
    // if(curr instanceof DrawablePresenter && curr !== next){
	if(curr && Object.keys(curr).length > 0){
		if(curr !== next){
			// console.log("will unselect:", curr)
			curr.unselect()
			if(curr.getClassName() === "BoxPresenter"){
				curr.resetEdge()
			}
			if(curr.parent){
				curr.parent.unselect()
			}
		}
	}

    // A drawable will only be selected if it is not allready selected.
    if(curr !== next){
        // console.log("will select:", next)
        next.select()
        appModel.selectDrawable(next)
        if(next.parent){
            next.parent.select()
            if(curr){
                next.parent.previousPoint = curr
            }
            next.parent.currentPoint = next
        }
    }
}
export function resetSelection(){
    if(appModel.isADrawableSelected()){
        // console.log("reset selection:", drawable)
	    const drawable = appModel.getSelectedDrawable()
        appModel.resetDrawableSelection()
        drawable.unselect()
        if(drawable.getClassName() === "BoxPresenter"){
            drawable.resetEdge()
        }
        if(drawable.parent){
            drawable.parent.unselect()
        }
    }
}
export function enableSelect(){
    // console.warn("enable select")
    // mouse
    let unselect = false
    $(imageInterface.getSVG()).on("click.selectDrawable", ($event) => {
        // return on right or middle mouse button, prevent context menu.
        if (!mouse.button.isLeft($event.button)) {
            $event.preventDefault()
            return
        }
        let drawable = $event.target.closest(".drawable")
        if(drawable){
            drawable = drawable.drawablePresenter
            // if(drawable instanceof DrawablePresenter){
            if(drawable !== undefined && Object.keys(drawable).length > 0){
                selectDrawable(drawable)
            }
        }
    })
    $(imageInterface.getSVG()).on("mousedown.resetSelectionStart", ($event) => {
        // return on right or middle mouse button, prevent context menu.
        if (!mouse.button.isLeft($event.button)) {
            $event.preventDefault()
            return
        }
        if(appModel.isADrawableSelected()){            
            let next = $event.target.closest(".drawable")
            next = (next !== null) ? next.drawablePresenter : undefined
            if (!next){
                unselect = true
            } else {
                unselect = false
            }
        }
    })
    $(window).on("mouseup.resetSelectionEnd", ($event) => {
        // return on right or middle mouse button, prevent context menu.
        if(!mouse.button.isLeft($event.button)) {
            $event.preventDefault()
            return
        }
        if(appModel.isADrawableSelected()){
            // @WORKAROUND: firefox bug? HTMLDocument does not inherit from HTMLElement (spec) => no closest() method. 
            let next = undefined
            try {
                next = $event.target.closest(".drawable")
            } catch(e){
                next = null
            }
            next = (next !== null) ? next.drawablePresenter : undefined
            if(unselect && !next){
                resetSelection()
            }
            unselect = false
        }
    })
    // key
    $(window).on("keydown.selectDrawable", ($event) => {
        // important:
        // we use the drawable index array instead of the raw data.
        // deleted drawables should not be selected.
        if(keyboard.isKeyHit($event, "Tab")) {
            $event.stopPropagation()
            $event.preventDefault()

            if(appModel.hasDrawables()){
                // a variable containing the index of the next drawable of 'drawableIds'.
                let nextIndex = -1

                // if a drawables is selected, select the next drawable.
                // if user pressed shift select the previous drawable if any.
                // unselect the selected drawable.
                if(appModel.isADrawableSelected()){
                    let selectedDrawable = appModel.getSelectedDrawable()
                    // just return if only one drawable exist and is allready selected.
                    if(appModel.state.drawableIdList.length === 1){
                        return
                    }
                    if(selectedDrawable.parent){
                        selectedDrawable = selectedDrawable.parent
                    }
                    let currentDrawableIndex = appModel.getDrawableIndex(selectedDrawable)
                    selectedDrawable.unselect()
                    if(keyboard.isModifierHit($event, "Shift")){
                        nextIndex = currentDrawableIndex >= 1
                            // the previous index
                            ? currentDrawableIndex - 1
                            // the last index
                            : appModel.state.drawableIdList.length - 1
                        nextIndex = nextIndex === -1 
                            ? 0
                            : nextIndex
                    } else {
                        // the next or first
                        nextIndex = (currentDrawableIndex + 1) % appModel.state.drawableIdList.length
                    }
                }
                // else if no drawable is selected
                else {
                    // if a drawable was selected before use its index.
                    if(appModel.state.selectedDrawableId){
                        nextIndex = appModel.state.drawableIdList.indexOf(appModel.state.selectedDrawableId)
                        nextIndex = nextIndex === -1 
                            ? 0
                            : nextIndex
                    }
                    // else no drawable was selected before, use index 0 to select the drawable that was added first.
                    else {
                        nextIndex = 0
                    }
                }
                // find the actual drawable in the model data by id, using the index, and execute selection.
                const nextId = appModel.state.drawableIdList[nextIndex]
                const next = appModel.getDrawableById(nextId)
                selectDrawable(next)

                // align browser view. 
                document.querySelector("main div.card-header").scrollIntoView(true)
            }
        }
    })
    $(window).on("keydown.resetSelection", ($event) => {
        if (keyboard.isKeyHit($event, "Escape")){
            if(appModel.isADrawableSelected()){
                $event.preventDefault()
                resetSelection()
            }
        }
    })    
}
export function disableSelect(){
    // console.warn("disable select")
    // mouse
    $(imageInterface.getSVG()).off("click.selectDrawable")
    $(imageInterface.getSVG()).off("mousedown.resetSelectionStart")
    $(window).off("mouseup.resetSelectionEnd")
    // Key
    $(window).off("keydown.selectDrawable")
    $(window).off("keydown.resetSelection")
}
