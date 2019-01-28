
import { NodeTemplate } from "l3p-frontend"

import "./box.styles.scss"
import DEFAULTS from "./box.defaults"

import DrawableView from "../DrawableView"


/**
* COLLSION NODE (MAIN NODE)
* the collision node is the main node, representing the box models dimensions.
* the setX|Y|W|H methods will apply the models dimensions to it.
* child nodes inherit most of its values.
* the collision node includes a canvas element, where the current
* part of the image, the box is positioned on will be drawn and
* updated on box changes. box emulates a third dimensional overlay.
*/

/**
* BORDER NODE
* the border node is absolute positioned inside the main node (collisionNode)
* it inherits width and height but exceeds it by two times its border width.
* -> positioning required (1*borderWidth up and 1*borderWidth left)
*/

/**
* CURSOR NODE
* used for cursor detecton on the view.
*/
export default class BoxView extends DrawableView {
    /**
     * @param: config: { label: String, bounds: any }
     */
    constructor(config: any) {
        const { bounds } = config
        const { x, y, w, h } = bounds

        const borderWidth = DEFAULTS.getStrokeWidth()
        const wb = w + (2 * borderWidth)
        const hb = h + (2 * borderWidth)
        super(
            new NodeTemplate(`
                <svg class="sia-bbox drawable">
                    <g data-ref="position-node" transform="translate(${x-(w/2)}, ${y-(h/2)})">
                        <g data-ref="container-node" transform="translate(${-borderWidth}, ${-borderWidth})">
                            
                            // the collision nodes boundaries are the actual data values
                            <rect data-ref="collision-node" x="${borderWidth}" y="${borderWidth}" width="${w}" height="${h}" stroke="none" stroke-width="0"/>

                            // the border nodes boundaries include the collision node and borders
                            <svg data-ref="border-node" x="0" y="0" width="${wb}" height="${hb}">
                                <g data-ref="border-group" fill="black" stroke="none" stroke-width="0">
                                    <polygon data-ref="border-top" points="0,0 ${wb},0 ${wb-borderWidth},${borderWidth} ${borderWidth},${borderWidth}"/>
                                    <polygon data-ref="border-right" points="${wb},0 ${wb},${hb} ${wb-borderWidth},${hb-borderWidth} ${wb-borderWidth},${borderWidth}"/>
                                    <polygon data-ref="border-bottom" points="${wb},${hb} 0,${hb} ${borderWidth},${hb-borderWidth} ${wb-borderWidth},${hb-borderWidth}"/>
                                    <polygon data-ref="border-left" points="0,${hb} 0,0 ${borderWidth},${borderWidth} ${borderWidth},${hb-borderWidth}"/>
                                </g>
                            </svg>

                            // the cursor nodes boundaries should include menu and borders (does not include menu right now 18.04.18)
                            <rect data-ref="cursor-node" x="0" y="0" width="${wb}" height="${wb}" fill="transparent" stroke="none" stroke-width="0"/>

                        </g>
                    </g>
                </svg>
            `)
        )
        
        // an edge can be highlighted.
        this.edge = ""


        // box node reference workaround (adapted string template as fast as possible)
        this.rootNode = this.html.root
        this.positionNode = this.html.refs["position-node"]
        this.containerNode= this.html.refs["container-node"]
        this.collisionNode = this.html.refs["collision-node"]
        this.borderNode = this.html.refs["border-node"]
        this.borderGroup = this.html.refs["border-group"]
        this.cursorNode = this.html.refs["cursor-node"]
            
        // cache node styles for best performance
        this.ccss = {
            // core nodes
            rootNode : this.rootNode.style,
            positionNode : this.positionNode.style,
            collisionNode : this.collisionNode.style,
            cursorNode : this.cursorNode.style,
        }
        
        this.unselect()
    }
    hover(){ /* STUB */ }
    unhover(){ /* STUB */ }
    select(){
        // this css-class changes cursor
        this.positionNode.classList.toggle("sia-bbox-not-selected", false)
    }
    unselect(){
        // this css-class changes cursor
        this.positionNode.classList.toggle("sia-bbox-not-selected", true)
        // reset edge if any is selcted
        this.resetEdge()
    }

    // @required
    setColor(color: String){
        this.collisionNode.setAttribute("fill", color)
    }
    // @required
    setStrokeColor(color: String){
        this.borderColor = color
        this.borderGroup.setAttribute("fill", color)
    }

    // @extensible
    setPosition(bounds: any){
        super.setPosition(bounds, "center")
    }
    // @extensible
    setBounds(bounds: any){
        // this.show() // @FIREFOX REASONS getBBox() of hidden graphic.
        const { x, y, w, h } = bounds
        const borderWidth = DEFAULTS.getStrokeWidth()
        const hb = h + 2 * borderWidth
        const wb = w + 2 * borderWidth

        // update widths and heights
        this.collisionNode.setAttribute("width", `${w}`)
        this.collisionNode.setAttribute("height", `${h}`)
        this.cursorNode.setAttribute("width", `${wb}`)
        this.cursorNode.setAttribute("height", `${hb}`)
        this.borderNode.setAttribute("width", `${wb}`)
        this.borderNode.setAttribute("height", `${hb}`)

        // update border
        this.html.refs["border-top"].setAttribute("points", `0,0 ${wb},0 ${wb-borderWidth},${borderWidth} ${borderWidth},${borderWidth}`)
        this.html.refs["border-right"].setAttribute("points", `${wb},0 ${wb},${hb} ${wb-borderWidth},${hb-borderWidth} ${wb-borderWidth},${borderWidth}`)
        this.html.refs["border-bottom"].setAttribute("points", `${wb},${hb} 0,${hb} ${borderWidth},${hb-borderWidth} ${wb-borderWidth},${hb-borderWidth}`)
        this.html.refs["border-left"].setAttribute("points", `0,${hb} 0,0 ${borderWidth},${borderWidth} ${borderWidth},${hb-borderWidth}`)

        // update position
        this.setPosition(bounds)
    }

    selectEdge(edge: String){
        // Only one edge can be active.
        this.resetEdge()
        // Don't use the 'setStrokeColor()' method to change the color of one border side, as it updates the color for the whole border group.
        switch(edge) {
            case "top":
                this.edge = "top"
                this.html.refs["border-top"].setAttribute("fill", DEFAULTS.border.colorActiveEdge)
                break
            case "right":
                this.edge = "right"
                this.html.refs["border-right"].setAttribute("fill", DEFAULTS.border.colorActiveEdge)
                break
            case "bottom":
                this.edge = "bottom"
                this.html.refs["border-bottom"].setAttribute("fill", DEFAULTS.border.colorActiveEdge)
                break
            case "left":
                this.edge = "left"
                this.html.refs["border-left"].setAttribute("fill", DEFAULTS.border.colorActiveEdge)
                break
            default:
               throw  new Error(`${edge} is no valid value. use "top", "right", "bottom", left" in general or null, "enable", "disable".`)
        }
    }
    resetEdge(){
        Array.from(this.html.refs["border-group"].childNodes).forEach(border => {
            border.removeAttribute("fill")
        })
        this.edge = ""
    }
    isEdgeSelected(){
        return this.edge !== ""
    }
}
