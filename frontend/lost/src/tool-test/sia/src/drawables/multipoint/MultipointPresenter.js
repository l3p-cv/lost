import DrawablePresenter from "../DrawablePresenter"

import MultipointModel from "./MultipointModel"
import MultipointView from "./MultipointView"
import MULTIPOINT_DEFAULTS from "./multipoint.defaults"
import * as POINT_DEFAULTS from "../point/point.defaults"

import PointPresenter from "../point/PointPresenter"
import MenuPresenter from "../menu/MenuPresenter"

import imageInterface from "components/image/imageInterface"

import DoublyLinkedList from "dbly-linked-list"

import * as svg from "drawables/svg"


function extendPoint(point, index, parent){
    point.parent = parent
    // worked on redo undo (insert point)
    point.insertionIndex = index
    point.model.actBounds.on("update", (coord) => parent.onPointChange(coord, parent.model.points.indexOf(point)))
}

export default class MultipointPresenter extends DrawablePresenter {
    constructor(annotationData: any){
        // create internal drawables.
        const points = annotationData.data.map(coord => new PointPresenter({ 
            data: coord, 
            labelIds: annotationData.labelIds,
            status: annotationData.status,
            isNoAnnotation: true,
        }))

        let model = new MultipointModel(annotationData, points)
        let view = new MultipointView(model)
        super(model, view)
        this.menuBar = new MenuPresenter({
            drawable: this,
            mountPoint: this.view.html.refs["container-node"],
            label: {
                text: this.model.label.name,
                padding: MULTIPOINT_DEFAULTS.strokeWidth,
            },
            bar: {
                label: {
                    text: this.model.label.name,
                    padding: POINT_DEFAULTS.strokeWidth,
                },
                width: this.model.actBounds.value.w + 2 * POINT_DEFAULTS.getRadius(false) + 2 * POINT_DEFAULTS.strokeWidth,
                borderWidth: MULTIPOINT_DEFAULTS.strokeWidth,           
            },
        })
        // quickfix...
        this.model.actBounds.on("update", (bounds) => {
            this.menuBar.setWidth(bounds.w + 2 * POINT_DEFAULTS.getRadius(false) + 2 * POINT_DEFAULTS.strokeWidth)
            svg.setTranslation(this.view.html.refs["container-node"], { 
                x: bounds.left - POINT_DEFAULTS.getOutlineRadius(true) / 2 - POINT_DEFAULTS.strokeWidth,
                y: bounds.top - POINT_DEFAULTS.getOutlineRadius(true) - POINT_DEFAULTS.strokeWidth,
            })
        })

        // add a back reference for all internal drawables.
        this.model.points.forEach((point, index) => extendPoint(point, index, this))

        // add a doubly linked list for being able to track point selection. and use it in edit features.
        // and add second to last point to the point selection list.
        this.pointSelectionList = new DoublyLinkedList()
        this.model.points.forEach((point, index) => {
            if(index >= 1){
                this.pointSelectionList.insert(point)
            }
        })

        // appModel.ui.zoom.on("update", (zoom) => this.view.onZoomChange(zoom), this)
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
        this.view.select(this.isChangable())
        this.menuBar.select()
    }
    onUnselect(){
        this.view.unselect()
        this.menuBar.unselect()
    }
    onLabelChange(label){
        // display same label on point select.
        this.model.points.forEach(point => {
            point.setLabel(label)
        })
    }
    onPointChange(coord: any, index: Number){
        this.model.onPointChange()
        this.view.updatePoint(coord, index)
    }

    move(distance: any){
        let { x, y } = distance
        x = x ? x : 0
        y = y ? y : 0
        this.model.points.forEach((point) => point.move({ x, y }))
        this.model.onPointChange()
    }
    setPosition(coord: any){
        let { x, y } = coord
        x = x ? x : 0
        y = y ? y : 0
        const dist = {
            x: x - this.getX(),
            y: y - this.getY(),
        }
        this.model.points.forEach((point) => point.move(dist))
        this.model.onPointChange()
    }

    addPoint(coord: any){
        // create a point with the coordinate.
        // add a back reference to the line.
        const { imgW, imgH } = imageInterface.getDimensions()
        const point = new PointPresenter({ 
            data: {
                x: coord.x / imgW,
                y: coord.y / imgH,
            }, 
            labelIds: this.model.labelIds, 
            isNoAnnotation: true,
        })
        extendPoint(point, (this.model.points.length - 1), this)
    
        // insert into point selection list.
        this.pointSelectionList.insert(point)

        // add point to view
        this.view.addPoint(point.model.actBounds.value, point.view)

        // add point to model and get back the reference of the created 'PointPresenter'
        this.model.addPoint(point)
    
        // return point to allow additional event handling after adding the point.
        return point
    }
    insertPoint(coord: any, mode: String = "insert"){
        // create a point with the coordinate.
        // add a back reference to the line.
        const { imgW, imgH } = imageInterface.getDimensions()
        const point = new PointPresenter({ 
            data: {
                x: coord.x / imgW,
                y: coord.y / imgH,
            }, 
            labelIds: this.model.labelIds, 
            isNoAnnotation: true,
        })

        // find the insertion index.
        let insertionIndex = undefined
        if(mode === "add"){
            // find out where to add the point (end or beginning)
            const points = this.model.actPointData.value
            const startPointDist = Math.sqrt(Math.pow((points[0].x - coord.x), 2) + Math.pow(((imgH - points[0].y) - (imgH - coord.y)), 2))
            const endPointDist = Math.sqrt(Math.pow((points[points.length-1].x - coord.x), 2) + Math.pow(((imgH - points[points.length-1].y) - (imgH - coord.y)), 2))
            if(startPointDist < endPointDist){
                insertionIndex = 0
            } else {
                insertionIndex = points.length
            }
        } 
        else if(mode === "insert"){
            // console.log("-----------------------------------------")
            // console.log("INSERT POINT")
            // console.log("-----------------------------------------")
            function inIntervall(p1: any, p2: any, s: any){
                const min = {
                    x: Math.min(p1.x, p2.x),
                    y: Math.min(p1.y, p2.y),
                }
                const max = {
                    x: Math.max(p1.x, p2.x),
                    y: Math.max(p1.y, p2.y),
                }
                return (s.x >= min.x && s.x <= max.x) && (s.y >= min.y && s.y <= max.y) 
            }
            function intersection(p1: any, p2: any, q: any, debug: Boolean): Number {
                if(debug){
                    console.warn("GET DISTANCE")
                    console.log("-----------------------------------------")
                    console.log(`before: p1(${p1.x},${p1.y}); p2(${p2.x},${p2.y}); coord(${q.x},${q.y})`)
                }
                // coordinate system recalculation
                p1 = {
                    x: p1.x,
                    y: imgH - p1.y
                }
                p2 = {
                    x: p2.x,
                    y: imgH - p2.y
                }
                q = {
                    x: q.x,
                    y: imgH - q.y,
                }
                if(debug){
                    console.log(`after: p1(${p1.x},${p1.y}); p2(${p2.x},${p2.y}); coord(${q.x},${q.y})`)
                }

                // find out linear equation of p1 and p2:
                const slope = (p2.y - p1.y) / (p2.x - p1.x)
                // if slope is infinite, p1.x equals p2.x, p1p2 is parallel to y-axis.
                if((Math.abs(slope) === Infinity)){
                    if(debug){
                        console.warn("line is parallel to y-axis")
                    }
                    const s = {
                        x: p1.x,
                        y: q.y,
                    }
                    const distance = inIntervall(p1, p2, s) ? Math.abs(q.x - s.x) : Infinity
                    if(debug){
                        console.log(`s(${s.x},${s.y})`)
                        console.log("distance:", distance)
                    }
                    return { s, distance }
                } 
                // if slope is zero, p1.y equals p2.y, p1p2 is parallel to x-axis.
                else if(slope === 0){
                    if(debug){
                        console.warn("line is parallel to x-axis")
                    }
                    const s = {
                        x: q.x,
                        y: p1.y,
                    }
                    const distance = inIntervall(p1, p2, s) ? Math.abs(q.y - s.y) : Infinity
                    if(debug){
                        console.log(`s(${s.x},${s.y})`)
                        console.log("distance:", distance)
                    }
                    return { s, distance }
                } else {
                    if(debug){
                        console.warn("normal caluclation")
                    }
                    const b = p1.y - (slope * p1.x)
                    if(debug){
                        console.log("about linear equation of p1p2:")
                        console.log(`m = ${slope}`)
                        console.log(`b = ${b}`)
                    }

                    // find out orthogonal linear equation of q:
                    const slopeOrthogonal = -1 / slope
                    const bOrthogonal = q.y - (slopeOrthogonal * q.x)
                    if(debug){
                        console.log("about linear equation of orthogonal line through point q:")
                        console.log(`m = ${slopeOrthogonal}`)
                        console.log(`b = ${bOrthogonal}`)
                    }
                    
                    // find out intersection point coordinate:
                    const s = { x: undefined, y: undefined }
                    s.x = (bOrthogonal - b) / (slope - slopeOrthogonal)
                    s.y = slope * s.x + b

                    // calculate distance
                    const distance = inIntervall(p1, p2, s) 
                        ? Math.sqrt( Math.abs(Math.pow((s.y - q.y),2) + Math.pow((s.x - q.x),2)) )
                        : Infinity
                    if(debug){
                        console.log(`s(${s.x},${s.y})`)
                        console.log("distance:", distance)
                    }
                    return { s, distance }
                }
            }
            function getPointInsertion(points: Array<any>, coord: any, debug: Boolean, type: String): any {
                let pointInsertion = undefined
                switch(type){
                    case "line":
                        for(let i = 0; i < points.length-1; i++){
                            const { s , distance } = intersection(points[i], points[i+1], coord, false)
                            if(debug){
                                console.log(`index: ${i}, p1(${points[i].x},${points[i].y}) p2(${points[i+1].x},${points[i+1].y}), distance: ${distance}`)
                            }
                            if(pointInsertion === undefined){
                                pointInsertion = { index: i+1, distance, s }
                            } else if(pointInsertion.distance > distance) {
                                pointInsertion = { index: i+1, distance, s }
                            }
                            if(debug){
                                console.log(pointInsertion)
                            }
                        }
                        break
                    case "polygon":
                        for(let i = 0; i < points.length; i++){
                            if(i === points.length - 1){
                                var { s , distance } = intersection(points[i], points[0], coord, false)
                            } else {
                                var { s , distance } = intersection(points[i], points[i+1], coord, false)
                            }
                            if(debug){
                                if(i === points.length - 1){
                                    console.log(`index: ${i}, p1(${points[i].x},${points[i].y}) p2(${points[0].x},${points[0].y}), distance: ${distance}`)
                                } else {
                                    console.log(`index: ${i}, p1(${points[i].x},${points[i].y}) p2(${points[i+1].x},${points[i+1].y}), distance: ${distance}`)
                                }
                            }
                            if(pointInsertion === undefined){
                                pointInsertion = { index: i+1, distance, s }
                            } else if(pointInsertion.distance > distance) {
                                pointInsertion = { index: i+1, distance, s }
                            }
                            if(debug){
                                console.log(pointInsertion)
                            }
                        }    
                        break
                }
                // if no intersection point could be found, all distances would be Infinity (@see: inIntervall())
                // add a point to beginning or end of the line, depending on coordinate distance to these points.
                if(pointInsertion.distance === Infinity){
                    if(debug){
                        console.warn("no insertion found!")
                    }
                    const startPointDistance = Math.sqrt(Math.pow((points[0].x - pointInsertion.s.x), 2) +  Math.pow(((imgH - points[0].y) - pointInsertion.s.y), 2))
                    const endPointDistance = Math.sqrt(Math.pow((points[points.length-1].x - pointInsertion.s.x), 2) +  Math.pow(((imgH - points[points.length-1].y) - pointInsertion.s.y), 2))
                    if(debug){
                        console.log(`s(${pointInsertion.s.x},${pointInsertion.s.y})`)
                        console.log("start point distance:", startPointDistance)
                        console.log("end point distance:", endPointDistance)
                    }
                    if(startPointDistance < endPointDistance){
                        pointInsertion.index = 0
                    } else {
                        pointInsertion.index = points.length
                    }
                }
                return pointInsertion
            }
            
            // add point to model and get back the reference of the created 'PointPresenter'
            // console.log("Line.actPointData:", this.model.actPointData.value)
            const pointInsertion = getPointInsertion(this.model.actPointData.value, coord, false, this.model.type)
            const { index, distance } = pointInsertion
            insertionIndex = index

            // @feature: ...
            // @todo: do something with the distance ( min value = crop )
            if(distance === Infinity && (index === 0 || index === this.model.points.length)){
                // console.warn("will add point?")
                // console.log(`insert before/after?: p(${this.model.relPointData[index].x},${this.model.relPointData[index].y})`)
                return // just return for now, the mode switch couldve made this un needed. could be a later feature.
            }
        }

        extendPoint(point, insertionIndex, this)

        // insert into point selection list.
        this.pointSelectionList.insert(point)
        
        // add point to view.
        this.view.insertPoint(insertionIndex, point.model.actBounds.value, point.view)

        // add point to model.
        this.model.insertPoint(insertionIndex, point)

        // return point to allow additional event handling after adding the point.
        return point
    }

    removePoint(point: PointPresenter){
        if(this.model.points.length > 2){
            // remove from selection list
            // @notice: because a point must be selected for remove, we can just delete the tail of the list
            if(!this.pointSelectionList.isEmpty()){
                this.pointSelectionList.remove()
            }
            const index = this.model.points.indexOf(point)
            this.view.removePoint(point.view, index)
            this.model.removePoint(index)
        } else {
            this.pointSelectionList.clear()
        }
    }

    // @required
    getX(){
        return this.model.actBounds.value.x
    }
    getY(){
        return this.model.actBounds.value.y
    }
    getBounds(){
        return this.model.actBounds.value
    }

    // @required-extensible
    resize(){
        super.resize((imageDimensions) => {
            this.model.points.forEach(p => p.resize())
            this.model.onPointChange() // do i even need to call this?
        })
    }
}
