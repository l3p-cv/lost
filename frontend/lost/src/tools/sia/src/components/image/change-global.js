import { keyboard } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import { enableBoxChange, disableBoxChange } from "./change-box"
import { enablePointChange, disablePointChange } from "./change-point"
import { enableMultipointChange, disableMultipointChange } from "./change-multipoint"
const imageEventActions = {
	enableBoxChange, disableBoxChange,
	enablePointChange, disablePointChange,
	enableMultipointChange, disableMultipointChange,
}

// prevent browser default action on space bar during change event
appModel.event.changeEvent.on("change", isActive => {
	if(isActive){
		$(window).on("keydown.preventSpacebarDefault", $event => {
			if(keyboard.isKeyHit($event, "Space")){
				$event.preventDefault()
			}
		})
	} else {
		$(window).off("keydown.preventSpacebarDefault")
	}
})


export function enableChange(drawable: DrawablePresenter, config: any){
	disableChange()
	drawable = drawable === undefined ? appModel.getSelectedDrawable() : drawable
	if(drawable && config.actions.edit.bounds){
		if(drawable.isChangable()){
			// console.warn("enabled change handlers")
			switch(drawable.getClassName()){
				case "PointPresenter":
					imageEventActions.enablePointChange(drawable)
					break
				case "MultipointPresenter":
					imageEventActions.enableMultipointChange(drawable)
					break
				case "BoxPresenter":
					imageEventActions.enableBoxChange(drawable)
					break
				case "Object":
					if(Object.keys(drawable).length === 0){
						break                
					}
					break
				default: throw new Error(`unknown drawable ${drawable} of type ${drawable.getClassName()}.`)
			}
		} else {
			// preserve shortcuts (should still prevent default even if the funciton is not activated)
			$(window).on("keydown", $event => {
				// prevent browser from scrolling if using arrow keys.
				if(keyboard.isKeyHit($event, ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"])){
					$event.preventDefault()
				}
			})

		}
	}
}
export function disableChange(drawable: DrawablePresenter){
    drawable = drawable === undefined ? appModel.getSelectedDrawable() : drawable
	if(!drawable || Object.keys(drawable).length === 0) return
	switch(drawable.getClassName()){
		case "PointPresenter":
			imageEventActions.disablePointChange(drawable)
			break
		case "MultipointPresenter":
			imageEventActions.disableMultipointChange(drawable)
			break
		case "BoxPresenter":
			imageEventActions.disableBoxChange(drawable)
			break
		default: throw new Error(`unknown drawable ${drawable} of type ${drawable.getClassName()}.`)
	}
}