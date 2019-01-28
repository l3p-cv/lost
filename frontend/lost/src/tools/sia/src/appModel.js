import { Observable } from "l3p-frontend"
import { STATE } from "drawables/drawable.statics"
import * as DrawableDefaults from "drawables/drawable.defaults"

import * as MenuDefaults from "drawables/menu/menu.defaults"

import { API_URL } from 'root/settings'


export default {
	// a property to hold stuff from the sia react component.
	reactComponent: {},
    config: new Observable({
        tools: {
            point: true,
            line: true,
            polygon: true,
            bbox: true,
        },
        actions: {
            drawing: true,
            // labeling can be completely deactivated.
            labeling: true,
            // labeling, changing bounds and deleting for 
            // previously created drawables (different annotation "session")
            // can be set independently.
            edit: {
                label: true,  // unfinished
                bounds: true,
                delete: true,
            },
        },
        drawables: {
            bbox: {
                minArea: 250,
                minAreaType: "abs",
                // minArea: 0.00001,
                // minAreaType: "rel",
            }
        }
    }),
    ui: {
        resized: new Observable(false),
        layout: new Observable(""),
        imageWidth: new Observable(0),
        imageHeight: new Observable(0),
        menuBarHeight: MenuDefaults.bar.height,
        zoom: new Observable(1),
    },
    state: {
        // for drawable tab selection cycling
        selectedDrawableId: undefined,
        previousDrawableId: undefined,
        drawableIdList: [],
        // the selected drawable
        previousDrawable: undefined,
        selectedDrawable: new Observable({}),
        // a color table, changes on every image
        colorTable: undefined,  // type will be 'Map'
        imageData: null,        // type will be 'ImageData' 
        selectedLabel: new Observable(DrawableDefaults.LABEL),
        drawables: {
            points: new Observable([]),
            lines: new Observable([]),
            polygons: new Observable([]),
            bBoxes: new Observable([]),
        },
    },
    controls: {
        moveStep: 1,
        moveStepFast: undefined,
        currentMoveStep: 1, // same as moveStep per default
        tool: new Observable(""),
        // @move: to appModel.event
		// @rename: \w+EventRunning
        creationEvent: new Observable(false),
        changeEvent: new Observable(false),
    },
    data: {
        image: {
            // BACKEND
            id: undefined,
            url: new Observable(""),
            isFirst: undefined,
            isLast: undefined,
            number: undefined,
            amount: undefined,
            rawLoadedImage: new Observable({}),
            // FRONTEND
            info: new Observable({
                name: "",
                id: 0,
                number: 0,
                amount: 0,
            }),
        },
        drawables: new Observable({
            points: undefined,
            lines: undefined,
            polygons: undefined,
            bBoxes: undefined,
        }),
        categories: [],
        labelList: new Observable([]),
    },
    
    updateAnnotations(data: any){
        if(data !== "nothing available"){
			// update image data.
			// image id and url must stay in this sequence.
            this.data.image.id = data.image.id
            this.data.image.url.update(`${API_URL}${data.image.url}`)
            this.data.image.isFirst = (data.image.isFirst) ? data.image.isFirst : false
            this.data.image.isLast = (data.image.isLast) ? data.image.isLast : false
            this.data.image.number = data.image.number
            this.data.image.amount = data.image.amount

			// update drawables.
            this.data.drawables.reset()
            Object.values(this.state.drawables).forEach(obs => obs.reset())
            this.data.drawables.update(data.drawables)

			// create and update some status data.
            this.data.image.info.update({
                name: (() => {
                    let name = data.image.url
                    name = name.split("/")
                    name = name[name.length-1]
                    return name
                })(),
                id: this.data.image.id,
                number: this.data.image.number,
                amount: this.data.image.amount,
            })
        }
    },
    updateLabels(labels: Array<any>){
		labels = labels.map(label => ({
			id: label.id,
			description: label.description,
			name: label.label,
		}))
		// add default "no label" label as first element. 
        labels.unshift(DrawableDefaults.LABEL)
		this.data.labelList.update(labels)
    },
	
    getDrawableById(mountId: Number){
        if(mountId === undefined){
            throw new Error(`empty parameter 'moundId' is undefined.`)
        }
        let drawableList = Object.values(this.state.drawables).find(list => list.value.find(drawable => drawable.mountId === mountId))
        if(drawableList === undefined){
            throw new Error(`could not find drawable by mountId "${mountId}"`)
        }
        if(drawableList){
            drawableList = drawableList.value
            const drawable = drawableList.find(drawable => drawable.mountId === mountId)
            if(drawable === undefined){
                throw new Error(`could not find drawable by mountId "${mountId}"`)
            }
            return drawable
        }
    },
    getResponseData(options: any){
        const drawables = {}
        Object.keys(this.state.drawables).forEach(key => {
            const dataArray = this.state.drawables[key].value
            if(dataArray.length > 0){
                // save output version of drawable data to the object, to the corresponding key.
                drawables[key] = dataArray.map(d => d.getResponseData())
            }
        })
        // error prevention
        if(drawables.bBoxes
        && drawables.bBoxes.length
        && drawables.bBoxes.some(box => Object.values(box.data).some(v => typeof v !== "number")))
        {
            throw new Error("all box values must be numbers, something went wrong with your data.")
        }
        return {
            imgId: this.data.image.id,
            drawables,
        }
    },
    getLabelById(id: Number){
        let labelObj = this.data.labelList.value.find(l => (l.id === id))
        if(!labelObj){
            throw new Error(`label with id ${id} was not found.`)
        }
        return labelObj
    },
    getLabelColor(label: any){
        return this.state.colorTable.get(label.id)
    },
    getSelectedDrawable(){
        if(this.isADrawableSelected()){
            return this.state.selectedDrawable.value
        } else {
            return undefined
        }
    },
    getSelectedDrawableIndex(){
        if(this.isADrawableSelected()){
            return this.state.drawableIdList.indexOf(this.getSelectedDrawable().id)
        } else {
            return undefined
        }
    },
    getDrawableIndex(drawable: DrawablePresenter){
        if(drawable === undefined){
            throw new Error("empty parameter 'drawable' is undefined.")
        }
        return this.state.drawableIdList.indexOf(drawable.mountId)
    },
    isADrawableSelected(){
        return !(this.state.selectedDrawable.isInInitialState)
    },
    hasDrawables(){
        return this.state.drawableIdList.length > 0
    },
    selectDrawable(drawable: DrawablePresenter){
        const selectedDrawable = this.getSelectedDrawable()
        // if a drawable is selected save the id.
        if(selectedDrawable){
            this.state.previousDrawable = selectedDrawable
            this.state.previousDrawableId = selectedDrawable.mountId
        }
        // save the id of the drawable.
        this.state.selectedDrawableId = drawable.mountId
        // select the new drawable
        this.state.selectedDrawable.update(drawable)
    },
    resetDrawableSelection() {
        // reset the selected drawable observable, so the "reset" listeners get called.
        if(this.isADrawableSelected()){
            this.state.selectedDrawable.reset()
        }
    },
    addDrawable(drawable: DrawablePresenter){
        switch(drawable.getClassName()){
            case "BoxPresenter":
                this.state.drawables.bBoxes.add(drawable)
                break
            case "PointPresenter":
                this.state.drawables.points.add(drawable)
                break
            case "MultipointPresenter":
                if(drawable.model.type === "line"){
                    this.state.drawables.lines.add(drawable)
                } else if(drawable.model.type === "polygon"){
                    this.state.drawables.polygons.add(drawable)
                } else {
                    throw new Error(`Multipoint drawable has no type ("line" or "polygon").`)
                }
                break
            default:
                throw new Error("The drawable class is not supported.")
        }
        this.state.drawableIdList.push(drawable.mountId)
    },
    deleteDrawable(drawable: DrawablePresenter){
        // find the drawable inside the observable drawable lists and remove it.
        const found = Object.keys(this.state.drawables).some(key => {
            const _drawable = this.state.drawables[key].value.find(d => d.mountId === drawable.mountId)
            if(_drawable !== undefined){
                // remove the index of the drawable that will be deleted.
                const _drawableIndex = this.state.drawableIdList.indexOf(_drawable.mountId)
                if(_drawableIndex >= 0){
                    this.state.drawableIdList.splice(_drawableIndex, 1)
                } 
                // if the drawable is selected, reset state.selectedDrawable.
                // exchange the id of the last drawable with the id of the previous selected drawable.
                const selectedDrawable = this.getSelectedDrawable()
                if(drawable === selectedDrawable){
                    this.resetDrawableSelection()
                    this.state.selectedDrawableId = this.state.previousDrawableId
                }

                // remove the drawable from data if it has not the deleted flag.
                if(!_drawable.model.status.has(STATE.DELETED)){
                    this.state.drawables[key].remove(_drawable)
                }
                
                // finish iteration (Array.some)
                return true
            } else {
                return false
            }
        })
        if(!found){
            throw new Error("The drawable you wanted to delete does not exist.")
        }

        // create restore point.
        // state.dodo(this.createRestorePoint())
    },
    deleteSelectedDrawable(){
        const drawable = this.getSelectedDrawable()       
        if(drawable){
            this.deleteDrawable(drawable)
        }
    },

    cleanSession(){
        console.log("%c cleaning session storage ", "background: #282828; color: #FE8019")
        sessionStorage.removeItem("sia-annotation-id")
        sessionStorage.removeItem("sia-first-image-loaded")
		this.data.image.rawLoadedImage.reset()
		this.data.image.url.reset()
		this.data.image.info.reset()
        Object.values(this.state.drawables).forEach(data => data.reset())
        this.ui.zoom.reset()
    },
}
