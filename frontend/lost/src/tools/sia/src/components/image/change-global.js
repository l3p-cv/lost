import { keyboard } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import DrawablePresenter from "drawables/DrawablePresenter"

import { enablePointChange, disablePointChange } from "./change-point"
import { enableMultipointChange, disableMultipointChange } from "./change-multipoint"
import { enableBoxChange, disableBoxChange } from "./change-box"


export function enableChange(drawable: DrawablePresenter, config: any){
	disableChange()
	drawable = drawable === undefined ? appModel.getSelectedDrawable() : drawable
	if(drawable && config.actions.edit.bounds){
		if(drawable instanceof DrawablePresenter){
			if(drawable.isChangable()){
				// console.warn("enabled change handlers")
				switch(drawable.getClassName()){
					case "PointPresenter":
						enablePointChange(drawable)
						break
					case "MultipointPresenter":
						enableMultipointChange(drawable)
						break
					case "BoxPresenter":
						enableBoxChange(drawable)
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
}
export function disableChange(drawable: DrawablePresenter){
	// console.log("disable change on:", drawable)
    drawable = drawable === undefined ? appModel.getSelectedDrawable() : drawable
    if(drawable instanceof DrawablePresenter){
        switch(drawable.getClassName()){
            case "PointPresenter":
				disablePointChange(drawable)
                break
            case "MultipointPresenter":
				disableMultipointChange(drawable)
                break
            case "BoxPresenter":
				disableBoxChange(drawable)
                break
            default: throw new Error(`unknown drawable ${drawable} of type ${drawable.getClassName()}.`)
        }
    }
}