import $ from "cash-dom"

import { mouse } from "l3p-frontend"
import "./drawable.styles.scss"
import * as SVG from "./svg"

import imageInterface from "components/image/imageInterface"


export default class DrawableView {
    constructor(html: String){
        // @notice: not used atm.
        this.html = html
    }
    // @refactor: move to box or pass special values.
    // @description: sets the position of a svg group node (position-node).
    setPosition(bounds: any, mode: String = "corner", cb: Function){
        // check and complete coord.
        let { x, y } = bounds
        if(y === undefined && x === undefined){
            return
        }
        if(y === undefined && x !== undefined){
            y = SVG.getTranslationY(this.positionNode)
        }
        if(y !== undefined && x === undefined){
            x = SVG.getTranslationX(this.positionNode)
        }

        // execute update.
        switch(mode){
            case "corner":
                this.positionNode.setAttribute("transform", `translate(${x}, ${y})`)
                break
            case "center":
                let { w, h } = bounds
                if(w === undefined || h === undefined){
                    throw new Error("bounds.w or bounds.h is undefined.")
                }
                this.positionNode.setAttribute("transform", `translate(${x-(w/2)}, ${y-(h/2)})`)
                break
            case "corners":
                throw new Error("not implemented.")
            default:
                throw new Error("mode parameter is invalid.")
        }

        // execute extension
        if(typeof cb === "function") cb()
    }
    
    // @extensible
    delete(cbs: any){
        // @thesis:
        // i use:       if(cbs.before !== undefined) cbs.before() 
        // instead of:  if(typeof cbs.before === "function") cbs.before() 
        // to make sure cbs.before() wont abort if its not a function
        cbs = cbs || {}
        if(cbs.before !== undefined) cbs.before()
        $(this.html.root).remove()
        if(cbs.after !== undefined) cbs.before()
    }

    setCursor(eventType: any){
        this.currentCursor = eventType
        this.ccss.cursorNode.cursor = eventType.value
    }
    resetCursor(){
        this.ccss.cursorNode.cursor = mouse.CURSORS.SELECT.value
    }

    show(){
        this.ccss.rootNode.display = "block"
    }
    hide(){
        this.ccss.rootNode.display = "none"
    }

    bringToFront(){
        // Append this view again to the container it belongs to, to make it appear above all other drawables. (default from DrawableView.js)
        imageInterface.getDrawableContainer().appendChild(this.html.root)
    }
}
