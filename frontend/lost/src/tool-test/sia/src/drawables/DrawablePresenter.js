import { CURSOR_UPDATE_FREQ, STATE } from "./drawable.statics"

import appModel from "../appModel"

import imageInterface from "components/image/imageInterface"

import DrawableModel from "./DrawableModel"
import DrawableView from "./DrawableView"

/**
*
*/
let id = 0
appModel.data.drawables.on(["update", "reset"], () => id = 0)

/**
*
*/
export default class DrawablePresenter {
    constructor(model, view){
        if(model instanceof DrawableModel === false) throw new Error("no model.")
        if(view instanceof DrawableView === false) throw new Error("no view.")
        this.model = model
        this.view = view
        
        this.mountId = id++

        // add a reference to the presenter on the root node of the view
        this.view.html.root.drawablePresenter = this

        // INIT VIEW
        // hover effect
        $(this.view.rootNode).on("mouseover", () => this.bringToFront())
        $(this.view.rootNode).on("mouseenter", () => this.hover())
        $(this.view.rootNode).on("mouseleave", () => this.unhover())

        // VALIDATE PRESENTER
        if(this.getX === undefined){
            throw new Error("Your 'DrawablePresenter' subclass needs a getX method.")
        } 

        // INIT PRESENTER
        // set initial label and color
        if(this.model.isNoAnnotation === false){
            this.setLabel(this.model.label)
        } else {
            this.setColor()
        }
    }

    // @required-extensible
    resize(cb: Function){
        if(!this.model.status.has(STATE.DELETED)){
            this.internalResize = true
            // execute specific resize algorithm
            cb(imageInterface.getDimensions())
            this.internalResize = false
        }
    }
    setLabel(label: any){
        this.model.setLabel(label)
        this.model.updateColor()
        this.setColor()
        if(this.model.isAnnotation){
            if(this.view.setLabel){
                this.view.setLabel(label.name, this.getX())
            }
            if(this.menuBar && this.menuBar.setLabel){
                this.menuBar.setLabel(label.name)
            }
        }
        if(this.onLabelChange instanceof Function){
            this.onLabelChange(label)
        }
    }
    setColor(){
        if(this.model.isSelected){
            this.view.setColor(this.model.color.fill.selected)
            this.view.setStrokeColor(this.model.color.stroke.selected)
        } else {
            this.view.setColor(this.model.color.fill.unselected)
            this.view.setStrokeColor(this.model.color.stroke.unselected)
        }
    }

    hover(){
        if(this.model.isSelected === false){
            this.bringToFront()
            if(this.onHover instanceof Function){
                this.onHover()
            }
        }
    }
    unhover(){
        if(this.model.isSelected === false){
            if(this.onUnhover instanceof Function){
                this.onUnhover()
            }
        }
    }
    select(){
        this.hover() // collides with this.model.isSelected!
        this.model.isSelected = true // position important
        if(this.isChangable()){
            this.enableCursorUpdate()
        } else {
            this.view.html.root.classList.toggle("drawable-locked", true)
        }
        this.setColor() // collides with this.model.isSelected!
        if(this.onSelect instanceof Function){
            this.onSelect()
        }
    }
    unselect(){
        this.unhover() // collides with this.model.isSelected!
        this.model.isSelected = false // position important
        if(this.isChangable()){
            this.disableCursorUpdate()
        }
        this.view.html.root.classList.toggle("drawable-locked", false)
        this.resetCursor()
        this.setColor() // collides with this.model.isSelected!
        if(this.onUnselect instanceof Function){
            this.onUnselect()
        }
    }

    isLabelable(){
        const actions = appModel.config.value.actions
        return (actions.edit && actions.edit.label)
            || (!(actions.edit && actions.edit.label) && actions.drawing && !this.model.status.has(STATE.DATABASE))
    }
    isDeletable(){
        const actions = appModel.config.value.actions
        return (actions.edit && actions.edit.delete)
            || (!(actions.edit && actions.edit.delete) && actions.drawing && !this.model.status.has(STATE.DATABASE))
    }
    isChangable(){
        const actions = appModel.config.value.actions
        return (actions.edit && actions.edit.bounds)
            || (!(actions.edit && actions.edit.bounds) && actions.drawing && !this.model.status.has(STATE.DATABASE))
    }
    
    isInFront(){
        return imageInterface.getDrawableContainer().lastChild === this.view.html.root
    }
    bringToFront(){
        // console.log("bring to front?", !this.isInFront())
        if(!this.isInFront()){
            this.view.bringToFront()
        }
    }

    enableCursorUpdate(){
        // @QUICKFIX:
        if(this.updateCursor){
            $(this.view.rootNode).on("mousemove.cursorUpdate", (e) => this.updateCursor(e))
        }
    }
    disableCursorUpdate(){
        $(this.view.rootNode).off("mousemove.cursorUpdate")
    }
    setCursor(eventType: any){
        this.view.setCursor(eventType)
    }
    resetCursor(){
        this.view.resetCursor()
    }

    show(){
        this.view.show()
    }
    hide(){
        this.view.hide()
    }

    setChanged(){
        this.model.setChanged()
    }
    delete(){
        this.unselect()
        this.view.delete()
        this.model.delete()
    }

    getResponseData(){
        return this.model.getResponseData()
    }
    getDataForJSON(){
        return this.model.getDataForJSON()
    }
    getClassName(){
        return this.__proto__.constructor.name
    }
}