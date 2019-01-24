import { mouse } from "l3p-frontend"
import { STATE } from "./drawable.statics"
import DEFAULTS from "./drawable.defaults"
import appModel from "../appModel"

import { toHslaString } from "shared/color"
import imageInterface from "components/image/imageInterface"


const DEFAULT_OPTIONS = {}
Object.defineProperty(DEFAULT_OPTIONS, "isNoAnnotation", {
    value: false,
    writable: false,
})


let id = 0
appModel.data.drawables.on(["update", "reset"], () => id = -1)

export default class DrawableModel {
    constructor(annotationData) {
        if(annotationData === undefined) throw new Error("no annotation data.")
        // the raw bounds data is relational to the image dimensions, if the image
        // component does not have usable width and height do not allow to create a drawable.
        const dimensions = imageInterface.getDimensions()
        const { imgW, imgH } = dimensions
        if(imgW === 0 || imgH === 0){
            throw new Error("resize the image view before creating drawables.")
        }

        this.actBounds = undefined // @subclasses
        this.relBounds = undefined // @subclasses

        // if the element has no id (not allready in database) it gets a negative.
        // if the element has no label array it gets assigned [-1].
        // if the element has no status it  gets assigned STATUS.NEW.
        this.isNoAnnotation = (annotationData.isNoAnnotation !== undefined) ? annotationData.isNoAnnotation : false
        this.isAnnotation = !this.isNoAnnotation
        this.id = annotationData.id || id--
        this.isSelected = false

        // atm. only used for BoxPresenter
        this.currentCursor = mouse.CURSORS.SELECT

        // label and status
        if(annotationData.status){
            if(annotationData.status instanceof Set){
                this.status = annotationData.status
            } else if(Array.isArray(annotationData.status)){
                this.status = new Set()
                annotationData.status.forEach(x => this.status.add(x))
            } else {
                this.status = new Set()
                this.status.add(annotationData.status)
            }
        } else {
            this.status = new Set()
            this.status.add(STATE.NEW)
        }
        this.labelIds = (annotationData.labelIds && annotationData.labelIds.length >= 1)
                ? annotationData.labelIds
                : [-1]
        if(this.status.has(STATE.NEW) && !appModel.state.isInInitialState){
            this.label = appModel.state.selectedLabel.value
            this.labelIds = [-1]
        } else {
            this.label = appModel.getLabelById(this.labelIds[0])
        }

        const color = appModel.getLabelColor(this.label)
        this.color = {
            raw: color,
            fill: {
                selected: toHslaString(color, DEFAULTS.opacity.selected.fill),
                unselected: toHslaString(color, DEFAULTS.opacity.notSelected.fill),
            },
            stroke: {
                selected: toHslaString(color, DEFAULTS.opacity.selected.stroke),
                unselected: toHslaString(color, DEFAULTS.opacity.notSelected.stroke),
            },   
        }
    }
    // @required-extensible
    getResponseData(specificData: any){
        if(specificData === undefined){
            throw new Error("Your 'Drawable' subclass model needs to pass it's data to super.getResponseData()")
        }

        return {
            id: (this.id < 0) ? undefined : this.id,
            labelIds: this.labelIds.filter(id => id >= 0),
            status: (this.status.has(STATE.DATABASE) && this.status.has(STATE.CHANGED))
                ? STATE.CHANGED
                : this.status.values().next().value,
            data: specificData,
        }
    }
    getDataForJSON(specificData: any){
        if(specificData === undefined){
            throw new Error("Your 'Drawable' subclass model needs to pass it's data to super.getDataForJSON()")
        }

        return {
            id: (this.id < 0) ? undefined : this.id,
            labelIds: this.labelIds.filter(id => id >= 0),
            status: Array.from(this.status),
            data: specificData,
        }
    }

    setLabel(label: any){
        this.label = label
        this.labelIds = [label.id]
    }
    updateColor(){
        const color = appModel.getLabelColor(this.label)
        this.color = {
            raw: color,
            fill: {
                selected: toHslaString(color, DEFAULTS.opacity.selected.fill),
                unselected: toHslaString(color, DEFAULTS.opacity.notSelected.fill),
            },
            stroke: {
                selected: toHslaString(color, DEFAULTS.opacity.selected.stroke),
                unselected: toHslaString(color, DEFAULTS.opacity.notSelected.stroke),
            },   
        }
    }

    // this does not remove the box from the appModel but alters its state.
    delete(){
        if(this.isNoAnnotation) return 
        if(!this.status.has(STATE.NEW)){
            this.status.clear()
            this.status.add(STATE.DELETED)
        }
    }
    setChanged(){
        // update element state to changed if the element is not STATE.NEW
        if(!this.status.has(STATE.NEW)){
            this.status.add(STATE.CHANGED)
        }
        if(this.status.has(STATE.DELETED)){
            throw new Error("Incorrect drawable status. Should not be able to change a deleted drawbable.")
        }
    }
}
