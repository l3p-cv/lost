import { NodeTemplate, mouse } from "l3p-frontend"

import DEFAULTS from "./multipoint.defaults"
import * as POINT_DEFAULTS from "../point/point.defaults"
import DrawableView from "../DrawableView"


export default class MultipointView extends DrawableView {
    // constructor(config: any){
    constructor(model: any){
        super()
        this.type = model.type
        this.html = new NodeTemplate(`
            <svg class="sia-multipoint drawable">
                <g data-ref="position-node">
                    <g data-ref="container-node" 
                        transform="translate(
                            ${model.actBounds.value.left - POINT_DEFAULTS.getOutlineRadius(true) - POINT_DEFAULTS.strokeWidth},
                            ${model.actBounds.value.top - POINT_DEFAULTS.getOutlineRadius(true) - POINT_DEFAULTS.strokeWidth})
                        "
                    ></g>
                    <${model.type === "line" ? "polyline" : "polygon"} data-ref="cursor-node" 
                        fill="none" 
                        stroke-linecap="round"
                        stroke-linejoin="bevel"
                        stroke="transparent"
                        stroke-width="${DEFAULTS.strokeWidth + 14}"
                        points="${
                            model.actPointData.value.map(p => `${p.x},${p.y}`).join(" ") 
                        }"
                    />
                    <${model.type === "line" ? "polyline" : "polygon"} data-ref="collision-node" 
                        fill="none" 
                        stroke-linecap="round"
                        stroke-linejoin="bevel"
                        stroke="black"
                        stroke-width="${DEFAULTS.strokeWidth}"
                        points="${
                            model.actPointData.value.map(p => `${p.x},${p.y}`).join(" ") 
                        }"
                    />
                    <g data-ref="points"></g>
                </g>
            </svg>
        `)
        model.points.map(p => p.view).forEach(pv => this.html.refs["points"].appendChild(pv.html.fragment))

        this.rootNode = this.html.root
        this.positionNode = this.html.refs["position-node"]
        this.collisionNode = this.html.refs["collision-node"]
        this.cursorNode = this.html.refs["cursor-node"]

        // cache node styles for best performance
        this.ccss = {
            rootNode : this.rootNode.style,
            positionNode : this.positionNode.style,
            collisionNode : this.collisionNode.style,
            cursorNode: this.cursorNode,
        }
    }
    hover(){}
    unhover(){}
    select(changeable: boolean){
        if(changeable){
            this.html.root.classList.toggle(mouse.CURSORS.SELECT.class, false)
            this.html.root.classList.toggle(mouse.CURSORS.MOVE.class, true)
        }
    }
    unselect(){
        this.html.root.classList.toggle(mouse.CURSORS.SELECT.class, true)
    }

    updatePoints(coords: any){
        const pointString = coords.map(c => `${c.x},${c.y}`).join(" ")
        this.collisionNode.setAttribute("points", pointString)
        this.cursorNode.setAttribute("points", pointString)
    }
    updatePoint(coord: any, index: Number){
        const pointArray = this.collisionNode.getAttribute("points").split(" ")
        pointArray[index] = `${coord.x},${coord.y}`
        const pointString = pointArray.join(" ")
        // execute update
        this.collisionNode.setAttribute("points", pointString)
        this.cursorNode.setAttribute("points", pointString)
    }

    addPoint(coord: any, point: PointView){
        const pointString = this.collisionNode.getAttribute("points") + ` ${coord.x},${coord.y}`
        this.collisionNode.setAttribute("points", pointString)
        this.cursorNode.setAttribute("points", pointString)
        this.html.refs["points"].appendChild(point.html.fragment)
    }
    insertPoint(index: Number, coord: any, point: PointView){
        const pointArray = this.collisionNode.getAttribute("points").split(" ")
        pointArray.splice(index, 0, `${coord.x},${coord.y}`)
        const pointString = pointArray.join(" ")
        // execute update
        this.collisionNode.setAttribute("points", pointString)
        this.cursorNode.setAttribute("points", pointString)
        this.html.refs["points"].appendChild(point.html.fragment)
    }

    // @refactor: pass the PointPresenter and remove its view aswell.?
    removePoint(point: PointView, index: Number){
        let pointString = this.collisionNode.getAttribute("points")
        let pointsArray = pointString.split(" ")
        pointsArray.splice(index, 1)
        pointString = pointsArray.join(" ")
        // execute remove
        this.collisionNode.setAttribute("points", pointString)
        this.cursorNode.setAttribute("points", pointString)
        point.html.root.remove()
    }

    // @required
    setColor(color: String){
        switch(this.type){
            case "line":
                this.collisionNode.setAttribute("fill", "none")
                break
            case "polygon":
                this.collisionNode.setAttribute("fill", color)
                break
        }
    }
    // @required
    setStrokeColor(color: String){
        this.collisionNode.setAttribute("stroke", color)
    }
}
