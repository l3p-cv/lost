import { throttle } from "lodash-es"
import { mouse } from "l3p-frontend"

import { CURSOR_UPDATE_FREQ } from "../drawable.statics"

import DrawablePresenter from "../DrawablePresenter"

import DEFAULTS from "./box.defaults"

import BoxModel from "./BoxModel"
import imageInterface from "components/image/imageInterface"

import BoxView from "./BoxView"
import MenuPresenter from "../menu/MenuPresenter"
import appModel from "../../appModel"


export default class BoxPresenter extends DrawablePresenter {
    constructor(annotationData: any){
        const model = new BoxModel(annotationData)
        const view = new BoxView({
            label: model.label.name,
            bounds: model.actBounds.value,
        })
        super(model, view)
        this.menuBar = new MenuPresenter({
            drawable: this,
            mountPoint: this.view.html.refs["container-node"],
            label: {
                text: this.model.label.name,
                padding: DEFAULTS.getStrokeWidth(),
            },
            bar: {
                label: {
                    text: this.model.label.name,
                    padding: DEFAULTS.getStrokeWidth(),
                },
                width: this.model.actBounds.value.w + (2 * DEFAULTS.getStrokeWidth()),
                borderWidth: DEFAULTS.getStrokeWidth(),           
            },
        })
        this.model.actBounds.on("update", (bounds) => {
            this.menuBar.setWidth((bounds.w + (2 * DEFAULTS.getStrokeWidth())))
        })
        
        // throttle cursor update
        if(this.isChangable()){
            this.updateCursor = throttle(this.updateCursor, CURSOR_UPDATE_FREQ)
        } else {
            this.updateCursor = undefined // needed?
        }
    }
	onZoomChange(){
		const bounds = this.model.actBounds.value
		this.menuBar.setWidth((bounds.w + (2 * DEFAULTS.getStrokeWidth())))
		this.view.setBounds(bounds)
	}
    onHover(){
        this.view.hover()
        this.menuBar.hover()
    }
    onUnhover(){
        this.view.unhover()
        this.menuBar.unhover()
    }
    onSelect(){
        this.view.select()
        this.menuBar.select()
    }
    onUnselect(){
        this.view.unselect()
        this.menuBar.unselect()
    }

    setBounds(bounds: any){
        // @move validation to model
        bounds = this.model.validate(bounds, {
            minW: 1,
            minH: 1,
            maxW: imageInterface.getWidth(),
            maxH: imageInterface.getHeight(),
        }, "abs")
        if(bounds){
            this.model.updateBounds(bounds)
            this.view.setBounds(bounds)
        }
    }
    setPosition(coord: any){
        this.setBounds(coord)
    }

    move(distance: any){
        let { x, y } = distance
        x = x ? x : 0
        y = y ? y : 0
        this.setBounds({
            x: this.getX() + x,
            y: this.getY() + y
        })
    }
    scaleLeft(distance: any){
        this.setBounds({
            w: this.getW() + distance.x,
            x: this.getX() - distance.x / 2,
        })
    }
    scaleTop(distance: any){
        this.setBounds({
            h: this.getH() + distance.y,
            y: this.getY() - distance.y / 2,
        })
    }
    scaleBottom(distance: any){
        // a negative distance means a height-increase.
        this.setBounds({
            h: this.getH() - distance.y,
            y: this.getY() - distance.y / 2,
        })
    }
    scaleRight(distance: any){
        // a negative distance means a width-increase.
        this.setBounds({
            w: this.getW() - distance.x,
            x: this.getX() - distance.x / 2,
        })
    }
    scaleTopLeft(distance: any){
        this.setBounds({
            w: this.getW() + distance.x,
            h: this.getH() + distance.y,
            x: this.getX() - distance.x / 2,
            y: this.getY() - distance.y / 2,
        })
    }
    scaleTopRight(distance: any){
        this.setBounds({
            w: this.getW() - distance.x,
            h: this.getH() + distance.y,
            y: this.getY() - distance.y / 2,
            x: this.getX() - distance.x / 2,
        })
    }
    scaleBottomLeft(distance: any){
        this.setBounds({
            h: this.getH() - distance.y,
            y: this.getY() - distance.y / 2,
            w: this.getW() + distance.x,
            x: this.getX() - distance.x / 2,
        })
    }
    scaleBottomRight(distance: any){
        this.setBounds({
            w: this.getW() - distance.x,
            h: this.getH() - distance.y,
            x: this.getX() - distance.x / 2,
            y: this.getY() - distance.y / 2,
        })
    }

    updateCursor(e){
        if(e.target === undefined || e.target.dataset === undefined || e.target.dataset.ref === undefined){
            return
        }

        // mouse position relative to the event target
        let mousepos = mouse.getMousePosition(e, e.target)
        // calculate the real mouseposition (@zoom)
        const zoom = appModel.ui.zoom.value
        mousepos = {
            x: mousepos.x * zoom,
            y: mousepos.y * zoom,
        }

        // the bbox of the event target
        const tBBox = e.target.getBBox()

        // bounds for decision making
        const edgeTop = 0
        const edgeLeft = 0
        const edgeRight = tBBox.width
        const edgeBottom = tBBox.height

        // between returns true if a value is between min and max, else false.
        const between = (min, value, max) => (value >= min && value <= max)

        /**
         * Classify position of the cursor.
         * With the ability to provide a gap between the edges and the cursor.
         * 
         * @return  isEdge, isCorner, isCenter, edgeCount
         */
        function classifyCursorPosition(config){
            const { minPixel, maxPixel, percentage } = config
            // edge detection range
            let EDTx = percentage * tBBox.width
            let EDTy = percentage * tBBox.height
            // apply min threshold
            EDTx = (EDTx < minPixel) ? minPixel : EDTx
            EDTy = (EDTy < minPixel) ? minPixel : EDTy
            // apply max threshold
            EDTx = (EDTx > maxPixel) ? maxPixel : EDTx
            EDTy = (EDTy > maxPixel) ? maxPixel : EDTy

            const isEdge = {
                isLeftEdge: between((edgeLeft), mousepos.x, (edgeLeft + EDTx)),
                isRightEdge: between((edgeRight - EDTx), mousepos.x, (edgeRight)),
                isBottomEdge: between((edgeBottom - EDTy), mousepos.y, (edgeBottom)),
                isTopEdge: between((edgeTop), mousepos.y, (edgeTop + EDTy))
            }
            const isCorner = {
                isTopLeftCorner: isEdge.isTopEdge && isEdge.isLeftEdge,
                isTopRightCorner: isEdge.isTopEdge && isEdge.isRightEdge,
                isBottomLeftCorner: isEdge.isBottomEdge && isEdge.isLeftEdge,
                isBottomRightCorner: isEdge.isBottomEdge && isEdge.isRightEdge
            }
            const isCenter = !(isEdge.isLeftEdge || isEdge.isRightEdge || isEdge.isBottomEdge || isEdge.isTopEdge)

            // processing
            // count edges
            let edgeCount = 0
            for (var key in isEdge) {
                if (isEdge.hasOwnProperty(key)) {
                    if (isEdge[key] === true) {
                        edgeCount++
                    }
                }
            }

            return { isEdge, isCorner, isCenter, edgeCount }
        }

        // decision and update
        let cursor = undefined
        switch(e.target.dataset.ref){
            case "label":
            case "label-text":
            case "label-background":
            case "menubar-label":
            case "menubar-label-text":
            case "menubar-background":
                cursor = mouse.CURSORS.MOVE
                break
            case "cursor-node":
                const { isEdge, isCorner, isCenter, edgeCount } = classifyCursorPosition({
                    percentage: 0.15,
                    minPixel: DEFAULTS.getStrokeWidth(),
                    maxPixel: 14,
                })
                switch (edgeCount) {
                    case 1:
                        for (var key in isEdge) {
                            if (isEdge.hasOwnProperty(key)) {
                                if (isEdge[key] === true) {
                                    switch (key) {
                                        case "isLeftEdge":
                                        cursor = mouse.CURSORS.CURSOR_EDGE_LEFT
                                        break
                                        case "isRightEdge":
                                        cursor = mouse.CURSORS.CURSOR_EDGE_RIGHT
                                        break
                                        case "isTopEdge":
                                        cursor = mouse.CURSORS.CURSOR_EDGE_TOP
                                        break
                                        case "isBottomEdge":
                                        cursor = mouse.CURSORS.CURSOR_EDGE_BOTTOM
                                        break
                                    }
                                }
                            }
                        }
                        break
                    case 2:
                        for (var key in isCorner) {
                            if (isCorner.hasOwnProperty(key)) {
                                if (isCorner[key] === true) {
                                    switch (key) {
                                        case "isTopLeftCorner":
                                        cursor = mouse.CURSORS.CURSOR_CORNER_TOP_LEFT
                                        break
                                        case "isTopRightCorner":
                                        cursor = mouse.CURSORS.CURSOR_CORNER_TOP_RIGHT
                                        break
                                        case "isBottomLeftCorner":
                                        cursor = mouse.CURSORS.CURSOR_CORNER_BOTTOM_LEFT
                                        break
                                        case "isBottomRightCorner":
                                        cursor = mouse.CURSORS.CURSOR_CORNER_BOTTOM_RIGHT
                                        break
                                    }
                                }
                            }
                        }
                        break
                    case 0: // equals isCenter
                        cursor = mouse.CURSORS.MOVE
                        break
                    default: throw  new Error("default case in updateCursor: couldnt detect edgecount.")
                }
                this.view.setCursor(cursor)
                break
        }
        if(cursor === undefined){
			// sometimes had error after connecting ui.zoom with stroke width.
			// commented below out because everything was all right tho...
			//    console.log(classifyCursorPosition({
			//         percentage: 0.15,
			//         minPixel: DEFAULTS.getStrokeWidth(),
			//         maxPixel: 14,
			//     }))
			//    throw new Error("would set undefined cursor now.")
        } else {
            this.model.currentCursor = cursor
        }
    }

    selectEdge(edge: String){
        this.view.selectEdge(edge)
    }
    resetEdge(){
        this.view.resetEdge()
    }
    isEdgeSelected(): Boolean {
        return this.view.isEdgeSelected()
    }
    getEdge(): String {
        return this.view.edge
    }
    
    getBounds(): any {
        return this.model.actBounds.value
    }
    getX(): Number {
        return this.model.actBounds.value.x
    }
    getY(): Number {
        return this.model.actBounds.value.y
    }
    getW(): Number {
        return this.model.actBounds.value.w
    }
    getH(): Number {
        return this.model.actBounds.value.h
    }
    getTop(): Number {
        return this.model.actBounds.value.top
    }
    getLeft(): Number {
        return this.model.actBounds.value.left
    }
    getRight(): Number {
        return this.model.actBounds.value.right
    }
    getBottom(): Number {
        return this.model.actBounds.value.bottom
    }

    // @required-extensible
    resize(){
        super.resize((imageDimensions) => {
            let { imgW, imgH } = imageDimensions
            // should floorEven only in the view
            this.setBounds({
                x: this.model.relBounds.x * imgW,
                y: this.model.relBounds.y * imgH,
                w: this.model.relBounds.w * imgW,
                h: this.model.relBounds.h * imgH,
            })
        })
    }
}