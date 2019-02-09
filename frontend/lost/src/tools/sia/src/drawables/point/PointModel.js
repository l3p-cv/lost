import { Observable } from "l3p-frontend"

import appModel from "siaRoot/appModel"

import { toHslaString } from "shared/color"

import DEFAULTS from "./point.defaults"

import DrawableModel from "../DrawableModel"

import imageInterface from "components/image/imageInterface"


export default class PointModel extends DrawableModel {
    constructor(annotationData: any) {
        super(annotationData)
        const { imgW, imgH } = imageInterface.getDimensions()

        // validate point coordinate.
        const { x, y } = this.validate(annotationData.data, {
            min: {
                x: 0,
                y: 0,
            },
            max: {
                x: 1,
                y: 1,
            },
        })

        // init relative bounds.
        this.relBounds = { x, y }

        // init actual bounds.
        this.actBounds = new Observable({
            x: x * imgW,
            y: y * imgH,
        })
    }
    validate(coord: any, limits: any){
        const { min, max } = limits
        let { x, y } = coord
        // fill in unchanged values.
        x = (x === undefined) ? this.actBounds.value.x : x
        y = (y === undefined) ? this.actBounds.value.y : y

        // correct errors.
        x = x < min.x ? min.x : x
        y = y < min.y ? min.y : y
        x = x > max.x ? max.x : x
        y = y > max.y ? max.y : y
        
        return { x, y }
    }
    // @coord: actual bounds
    updateBounds(coord: any){
        const { imgW, imgH } = imageInterface.getDimensions()
        const { x, y } = coord
        this.relBounds = {
            x: (x / imgW),
            y: (y / imgH),
        }
        // actBounds needs to be updated at last, cause it could have listeners equipped that
        // use relBounds aswell. should propably refactor this and only allow access via methods.
        this.actBounds.update(coord)
    }
    // @override: use point opacity defaults
    updateColor(label: any){
		const baseColor = label !== undefined
			? appModel.getLabelColor(label)
			: appModel.getLabelColor(this.label)

		this.color = {
            raw: baseColor,
            fill: {
                selected: toHslaString(baseColor, DEFAULTS.opacity.selected.fill),
                unselected: toHslaString(baseColor, DEFAULTS.opacity.notSelected.fill),
            },
            stroke: {
                selected: toHslaString(baseColor, DEFAULTS.opacity.selected.stroke),
                unselected: toHslaString(baseColor, DEFAULTS.opacity.notSelected.stroke),
            },   
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
