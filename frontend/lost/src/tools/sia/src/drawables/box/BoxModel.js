import { Observable } from "l3p-frontend"
import * as math from "shared/math"

import BOX_DEFAULTS from "./box.defaults"

import DrawableModel from "../DrawableModel"

import imageInterface from "components/image/imageInterface"
import appModel from "../../appModel"

export default class BoxModel extends DrawableModel {
    constructor(anno) {
        super(anno)
        const { imgW, imgH } = imageInterface.getDimensions()
        // validate and fix the annotation data. (defaults)
        const minSideLength = BoxModel.getSquareMinSideLength()
        const bounds = (anno.data !== undefined) 
            ? anno.data 
            : {
                x: BOX_DEFAULTS.bounds.x,
                y: BOX_DEFAULTS.bounds.y,
                w: minSideLength,
                h: minSideLength,
            }

        // validate and init relative bounds.
        const { x, y, w, h, left, right, top, bottom } = this.validate(bounds, {
            minW: minSideLength / imgW,
            minH: minSideLength / imgH,
            maxW: 1,
            maxH: 1,
        }, "rel")
        this.relBounds = { x, y, w, h, left, right, top, bottom }

        // init observable actual bounds.
        this.actBounds = new Observable({
            x: x * imgW,
            y: y * imgH,
            w: w * imgW,
            h: h * imgH,
            left: left * imgW,
            right: right * imgW,
            top: top * imgH,
            bottom: bottom * imgH,
        })
    }
    static areaValid(w: Number, h: Number, valueType: String){
        const config = appModel.config.value.drawables.bbox
        if(config.minAreaType === "rel"){
            if(valueType === "rel"){
                return w * h >= config.minArea
            } else {
                const { width, height } = appModel.data.image.rawLoadedImage.value
                return (w / width) * (h / height) >= config.minArea
            }
        } else {
            if(valueType === "abs"){
                return w * h >= config.minArea
            } else {
                const { width, height } = appModel.data.image.rawLoadedImage.value
                return (w * width) * (h * height) >= config.minArea
            }
        }
    }
    static getSquareMinSideLength(){
        const image = appModel.data.image.rawLoadedImage.value
        if(!image.width || !image.height || image.width === 0 || image.height === 0){
            throw new Error("Image not loaded, can't read raw width and height.")
        } else {
            const cfg = appModel.config.value
            switch(cfg.drawables.bbox.minAreaType){
                case "rel":
                    const originalImageArea = image.width * image.height
                    const minBoxArea = cfg.drawables.bbox.minArea * originalImageArea
                    const minBoxSideLength = Math.sqrt(minBoxArea)
                    return math.ceilEven(minBoxSideLength)
                case "abs":
                    return math.ceilEven(Math.sqrt(cfg.drawables.bbox.minArea))
            }
        }
    }
    validate(bounds: any, limits: any, valueType: String){
        const { minW, minH, maxW, maxH } = limits
        if(minW && maxW < minW || minH && maxH < minH){
            throw new Error("drawable minimum width or height exceeds the maximum.")
        }

        let { x, y, w, h } = bounds

        // @minsize 12.09.18
        if(this.actBounds !== undefined){
            if(x !== undefined && w !== undefined){
                if(w > this.actBounds.value.w){
                    if(x > this.actBounds.value.x){
                        // console.log("right increase")
                        let right = BoxModel.calculateRight(x, w)
                        if(right > maxW){
                            let maxChange = maxW - this.actBounds.value.right
                            w = this.actBounds.value.w + maxChange
                            x = this.actBounds.value.x + (maxChange / 2)
                        }
                    }
                    else if(x < this.actBounds.value.x){
                        // console.log("left increase")
                        let left = BoxModel.calculateLeft(x, w)
                        if(left < 0){
                            let maxChange = this.actBounds.value.left
                            w = this.actBounds.value.w + maxChange
                            x = w / 2 
                        }
                    }
                }
                // @minsize 12.09.18
                else if(minW && w < this.actBounds.value.w){
                    if(x < this.actBounds.value.x){
                        // console.log("right decrease")
                        if(w < minW){
                            let maxChange = this.actBounds.value.w - minW
                            w = minW
                            x = this.actBounds.value.x - (maxChange / 2)
                        }
                    }
                    else if(x > this.actBounds.value.x){
                        // console.log("left decrease")
                        if(w < minW){
                            let maxChange = this.actBounds.value.w - minW
                            w = minW
                            x = this.actBounds.value.x + (maxChange / 2)
                        }
                    }
                }
            }
            if(y !== undefined && h !== undefined){
                if(h > this.actBounds.value.h){
                    if(y > this.actBounds.value.y){
                        // console.log("bottom increase")
                        let bottom = BoxModel.calculateBottom(y, h)
                        if(bottom > maxH){
                            let maxChange = maxH - this.actBounds.value.bottom
                            h = this.actBounds.value.h + maxChange
                            y = this.actBounds.value.y + (maxChange / 2)
                        }
                    }
                    else if(y < this.actBounds.value.y){
                        // console.log("top increase")
                        let top = BoxModel.calculateTop(y, h)
                        if(top < 0){
                            let maxChange = this.actBounds.value.top
                            h = this.actBounds.value.h + maxChange
                            y = this.actBounds.value.y - (maxChange / 2)
                        }
                    }
                }
                // @minsize 12.09.18
                else if(minH && h < this.actBounds.value.h){
                    if(y < this.actBounds.value.y){
                        // console.log("bottom decrease")
                        if(h < minH){
                            let maxChange = this.actBounds.value.h - minH
                            h = minH
                            y = this.actBounds.value.y - (maxChange / 2)
                        }
                    }
                    else if(y > this.actBounds.value.y){
                        // console.log("top decrease")
                        if(h < minH){
                            let maxChange = this.actBounds.value.h - minH
                            h = minH
                            y = this.actBounds.value.y + (maxChange / 2)
                        }
                    }
                }
            }
            // fill in unchanged values.
            x = (x === undefined) ? this.actBounds.value.x : x
            y = (y === undefined) ? this.actBounds.value.y : y
            w = (w === undefined) ? this.actBounds.value.w : w
            h = (h === undefined) ? this.actBounds.value.h : h
        }

        // @minsize 12.09.18

        // @quickfix-opt-1: skip area validation on box init (relative values indicate it).
        // if(valueType !== "rel" && !BoxModel.areaValid(w, h, valueType)){
        // @quickfix-opt-2: skip area validation on creation event.
        if(appModel.controls.creationEvent.value === false && !BoxModel.areaValid(w, h, valueType)){
            // console.warn("area not valid")
            return false
        }

        // fix width and height.
        w = minW && (w < minW) ? minW : w
        h = minH && (h < minH) ? minH : h
        w = (w > maxW) ? maxW : w
        h = (h > maxH) ? maxH : h

        // fix x and y.
        var { left, right, top, bottom } = BoxModel.calculateBorders(x, y, w, h)
        x = (left < 0) ? (w / 2) : x
        x = (right > maxW) ? (maxW - (w / 2)) : x
        y = (top < 0) ? (h / 2) : y
        y = (bottom > maxH) ? (maxH - (h / 2)) : y
        
        // re-calculate bounds after fix.
        var { left, right, top, bottom } = BoxModel.calculateBorders(x, y, w, h)

        return { x, y, w, h, left, right, top, bottom }
    }
    updateBounds(bounds: any){
        const { imgW, imgH } = imageInterface.getDimensions()
        const { x, y, w, h, left, right, top, bottom } = bounds
        this.relBounds = {
            w: (w / imgW),
            h: (h / imgH),
            x: (x / imgW),
            y: (y / imgH),
            left: (left / imgW),
            right: (right / imgW),
            top: (top / imgH),
            bottom: (bottom / imgH),
        }
        // actBounds needs to be updated at last, cause it could have listeners equipped that
        // use relBounds aswell. should propably refactor this and only allow access via methods.
        this.actBounds.update(bounds)
    }
    static calculateLeft(x, w){
        return x - (w / 2)
    }
    static calculateRight(x, w){
        return x + (w / 2)
    }
    static calculateTop(y, h){
        return y - (h / 2)
    }
    static calculateBottom(y, h){
        return y + (h / 2)
    }
    static calculateBorders(x, y, w, h){
        return {
            left: x - (w / 2),
            right: x + (w / 2),
            top: y - (h / 2),
            bottom: y + (h / 2),
        }
    }
    // @required-extensible
    getResponseData(){
        return super.getResponseData(this.relBounds)
    }
    getDataForJSON(){
        return super.getDataForJSON(this.relBounds)
    }
}


















