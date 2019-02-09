import $ from "cash-dom"

import { mouse, state } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import MenuModel from "./MenuModel"
import MenuView from "./MenuView"

import imageEventActions from "components/image/imageEventActions"


export default class MenuPresenter {
    /**
     * 
     * @param {*} config keys: label, position, width, height, minWidth, padding, drawable 
     */
    constructor(config: any){
        this.model = new MenuModel(config)
        this.view = new MenuView(this.model, config.mountPoint, {
            deletable: this.model.drawable.isDeletable(),
            changeable: this.model.drawable.isDeletable(),
        })   
        // add delete handler.
        if(this.model.drawable.isDeletable()){
            $(this.view.html.refs["menubar-close-button"]).on("click", ($event) => {
                // return on right or middle mouse button, prevent context menu.
                if(!mouse.button.isLeft($event.button)){
                    $event.preventDefault()
                    return
                }
				// stop propagation to prevent selecting a drawable below the button.-
                $event.stopPropagation()
				// save state
				state.add(new state.StateElement({
					do: {
						data: { drawable: this.model.drawable },
						fn: (data) => {
							data.drawable.delete()
							appModel.deleteDrawable(data.drawable)
						}
					},
					undo: {
						data: { drawable: this.model.drawable },
						fn: (data) => {
							appModel.addDrawable(data.drawable)
							imageEventActions.selectDrawable(data.drawable)
						}
					}
				}))
				// execute
                this.model.drawable.delete()
                appModel.deleteDrawable(this.model.drawable)
            })
        }
        this.setWidth(this.model.bar.width)
    }

    // @rename event-methods: onFoo()
    hover(){
        this.view.hover()
    }
    unhover(){
        this.view.unhover()
    }
    select(){
        this.view.select(this.model.drawable.isChangable())   
    }
    unselect(){
        this.view.unselect()   
    }

    setLabel(label: String){
        if(this.model.display.bar || this.model.display.label){
            this.view.setLabel(label)
        }
    }
    setWidth(width: any){
        this.model.bar = { width }
        if(this.model.display.bar && this.model.display.label){
            if(width <= this.model.bar.labelHideThreshold) {
                if(!this.model.state.label.small){
                    this.view.switchToSmallLabel()
                    this.model.state.label.small = true
                }
            } else {
                if(this.model.state.label.small){
                    this.view.switchToMenuLabel()
                    this.model.state.label.small = false
                }
            }
        }
        if(this.model.display.bar){
            // width gets set to minWidth if its less by model setter.
            if((width <= this.model.bar.minWidth)){
                // calculate menubar displacement.
                const x = Math.ceil(width / 2 - this.model.bar.minWidth / 2)
                this.view.undockMenuBar(x, this.model.bar.minWidth, this.model.drawable.isDeletable() ? this.model.bar.iconSize : this.model.bar.borderWidth + this.model.label.padding)
                this.model.state.bar.docked = false
            } 
            else {
                if(!this.model.state.bar.docked){
                    this.view.dockMenuBar(width)
                    this.model.state.bar.docked = true
                }
            }
        }
        // the view updates the label background when setting the width. 
        // theirfore the label text must be visible first before using view.setWidth()
        this.view.setWidth(this.model.bar.width, this.model.drawable.isDeletable() ? this.model.bar.iconSize : this.model.bar.borderWidth + this.model.label.padding)
    }
    
	hide(){
		this.view.hide()
	}
	show(){
		this.view.show()
	}

    // // @feature
    // setHeight(){
    // }
    // // @feature
    // setMinWidth(){
    // }
}