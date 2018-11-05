import { Observable } from "l3p-core"

import DrawableModel from "../DrawableModel"

import PointPresenter from "../point/PointPresenter"
import BoxPresenter from "../box/BoxPresenter"

import imageInterface from "components/image/imageInterface"


/**
 * array of PointModels/presenters?
 * - add property: point.isNoAnnotation = true for event handling
 */
export default class MultipointModel extends DrawableModel {
    constructor(annotationData, points) {
        super(annotationData)

        // line data specific error handling.
        if(annotationData.data !== undefined && annotationData.type === "line" && annotationData.data.length < 2){
            throw new Error(`Can't create line, data missing. need at least two coordinates.`)
        }
        // polygon data specific error handling.
        if(annotationData.data === undefined && annotationData.type === "polygon" && annotationData.data.length < 3){
            throw new Error(`Can't create polygon, data missing. need at least three coordinates.`)
        }

        // add type info
        this.type = annotationData.type

        // add the 'PointPresenter's
        this.points = points

        // define point data.
        this.relPointData = []
        this.actPointData = new Observable([])

        // define bounds
        this.relBounds = {}
        this.actBounds = new Observable({})

        // init point data and bounds
        this.onPointChange()
    }
    // get width(){
    //     return this.actBounds.value.w + 
    // }
    // - updates relPointData, requires only 'this.points' to be correct.
    // - updates actPointData
    // - updates box bounds
    onPointChange(){
        const { imgW, imgH } = imageInterface.getDimensions()
        this.relPointData = this.points
            .map(p => p.getCoord())
            .map(coord => {
                return {
                    x: coord.x / imgW,
                    y: coord.y / imgH,
                }
        })
        this.relBounds = calculateBounds(this.relPointData)
        this.actPointData.update(this.relPointData.map(coord => {
            return {
                x: coord.x * imgW,
                y: coord.y * imgH,
            }
        }))
        // actBounds needs to be updated at last, cause it could have listeners equipped that
        // use relBounds aswell. should propably refactor this and only allow access via methods.
        this.actBounds.update(calculateBounds(this.actPointData.value))
    }

    addPoint(point: PointPresenter){
        this.points.push(point)
        this.onPointChange()
    }
    insertPoint(index: Number, point: PointPresenter){
        this.points.splice(index, 0, point)
        this.onPointChange()
    }

    removePoint(index: Number){
        this.points.splice(index, 1)[0]
        this.onPointChange()
    }

    // @required-extensible
    getResponseData(){
        return super.getResponseData(this.relPointData)
    }
    getDataForJSON(){
        return super.getDataForJSON(this.relPointData)
    }
}

function calculateBounds(points: Array<any>){
    const min = {
        x: Math.min.apply(Math, points.map(coord => coord.x)),
        y: Math.min.apply(Math, points.map(coord => coord.y)),
    }
    const max = {
        x: Math.max.apply(Math, points.map(coord => coord.x)),
        y: Math.max.apply(Math, points.map(coord => coord.y)),
    }
    const w = max.x - min.x
    const h = max.y - min.y
    const x = min.x + (w / 2) // center
    const y = min.y + (h / 2) // center
    const left = min.x
    const right = max.x
    const top = min.y
    const bottom = max.y
    return { 
        x, y, w, h,
        left, right, top, bottom, 
    }
}



















