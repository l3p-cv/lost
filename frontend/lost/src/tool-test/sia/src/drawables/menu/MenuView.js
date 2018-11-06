// @todo: add white background rect to the small label
import { NodeTemplate } from "l3p-core"
import * as svg from "../svg"

import "./menu.styles.scss"
import DRAWABLE_DEFAULTS from "drawables/drawable.defaults"
import * as MENU_DEFAULTS from "./menu.defaults"


export default class MenuView {
    /**
     * @param label: test
     * @param bounds; test
     */
    constructor(config: any, mountPoint: SVGElement, drawableActions: any){
        const { display, label, bar } = config
        // @QUICKFIXES APPLYED: refactor model.onUpdate VERSUS adding label.setWidth(width, padding) or alike...
        this.labelPadding = label.padding
        this.display = display
        const position = display.bar ? bar.relativePosition : { x: 0, y: 0 }
        console.log(config)
        console.log(position)
        this.html = new NodeTemplate(`
            <svg class="drawable-menubar drawable-menubar-not-selected drawable-menubar-locked" 
                transform="translate(${position.x},${position.y})">
                ${
                    !this.display.label ? `` : `
                        <svg data-ref="label"
                            class="drawable-label"
                            x="${label.relativePosition.x}" 
                            y="${label.relativePosition.y}"
                            height="${label.fontSize + 2 * label.padding}"
                            >
                            <rect data-ref="label-background"
                                rx="3"
                                ry="3"
                                height="100%"
                                width="0"  // width must be set using getBBox() on label-text.
                                />
                            <text data-ref="label-text" 
                                x="${label.padding}"
                                y="50%"
                                dominant-baseline="central"
                                style="
                                    font-size: ${label.fontSize}px;
                                ">
                                ${label.text}
                            </text>
                        </svg>
                    `
                }
                ${
                    !this.display.bar ? `` : `
                        <svg data-ref="menubar" class="drawable-menubar-bar"
                            width="${bar.width}"
                            height="${bar.height}"
                            >
                            <rect data-ref="menubar-background" class="drawable-menubar-background" width="100%" height="100%"/>
                            <svg data-ref="menubar-label" class="drawable-menubar-label" width="${bar.width - drawableActions.deletable ? bar.iconSize : -bar.borderWidth -label.padding}">
                                <text data-ref="menubar-label-text" 
                                    y="50%"
                                    dominant-baseline="central"
                                    x="${bar.label.padding}" 
                                    style="
                                        font-size: ${bar.label.fontSize}
                                    "
                                    >${bar.label.text}</text>
                            </svg>
                            ${
                                drawableActions.deletable
                                    ? `
                                        <svg data-ref="menubar-close-button" class="drawable-menubar-close-button" 
                                            x="${bar.width - bar.height}"
                                            y="${0}"
                                            width="${bar.height}" 
                                            height="${bar.height}">
                                            <line x1="20%" y1="20%" x2="80%" y2="80%"/>
                                            <line x1="20%" y1="80%" x2="80%" y2="20%"/>
                                            <rect width="100%" height="100%" fill="transparent"/>
                                        </svg>
                                    `
                                    : ""
                            }
                        </svg>
                    `
                }
            </svg>
        `)
        // cache node styles for best performance
        this.ccss = {
            labelNode : this.display.label ? this.html.refs["label"].style : undefined,
            menuBarNode : this.display.bar ? this.html.refs["menubar"].style : undefined,
            menuBarLabelNode : this.display.bar ? this.html.refs["menubar-label-text"].style : undefined,
        }

        mountPoint.appendChild(this.html.fragment)
        // if(this.display.label){
        //     // @QUICKFIX: see imageView.addDrawable.
        //     this.updateLabelBackground()
        // }
    }
    

    // EVENT RELATED
    hover(){
        this.html.root.classList.toggle("drawable-menubar-on-hover", true)
    }
    unhover(){
        this.html.root.classList.toggle("drawable-menubar-on-hover", false)
    }
    select(changeable: boolean){
        if(!changeable){
            this.html.root.classList.toggle("drawable-locked", true)
        }
        this.html.root.classList.toggle("drawable-menubar-selected", true)
        this.html.root.classList.toggle("drawable-menubar-not-selected", false)
        this.html.root.classList.toggle("drawable-menubar-on-hover", false)
    }
    unselect(){
        this.html.root.classList.toggle("drawable-locked", false)
        this.html.root.classList.toggle("drawable-menubar-not-selected", true)
        this.html.root.classList.toggle("drawable-menubar-selected", false)
        this.html.root.classList.toggle("drawable-menubar-on-hover", false)
    }

    // ACTIONS
    switchToSmallLabel(){
        if(this.display.label){
            this.ccss.labelNode.display = "block"
        }
        if(this.display.bar){
            this.ccss.menuBarLabelNode.display = "none"
        }
    }
    switchToMenuLabel(){
        if(this.display.label){
            this.ccss.labelNode.display = "none"
        }
        if(this.display.bar){
            this.ccss.menuBarLabelNode.display = "block"
        }
    }
    // @MVP: needs: x, (bar.minWidth)?, bar.iconSize
    // @renaming?
    undockMenuBar(x: Number, width: Number, iconSize: Number){
        svg.setTranslation(this.html.root, { x })
        if(this.display.bar){
            this.html.refs["menubar"].setAttribute("width", `${width}`)
            if(this.html.refs["menubar-close-button"]){
                this.html.refs["menubar-close-button"].setAttribute("x", `${width / 2 - iconSize / 2}`)
            }
        }
    }
    // @MVP: needs: width
    dockMenuBar(width: Number){
        if(this.display.bar){
            svg.setTranslation(this.html.root, { x: 0 })
            this.html.refs["menubar"].setAttribute("width", `${width}`)
        }
    }

    // INTERFACE, REACTIONS
    setLabel(label: String){
        if(this.display.label){
            this.html.refs["label-text"].textContent = label 
            this.updateLabelBackground()
        }
        if(this.display.bar){
            this.html.refs["menubar-label-text"].textContent = label
        }
    }
    setWidth(width: Number, iconSize: width){
        if(this.display.bar){
            this.html.refs["menubar"].setAttribute("width", `${width}`)
            this.html.refs["menubar-label"].setAttribute("width", `${width - iconSize}`)
            if(this.html.refs["menubar-close-button"]){
                this.html.refs["menubar-close-button"].setAttribute("x", `${width - iconSize}`)
            }
        }
        if(this.display.label){
            this.updateLabelBackground()
        }
    }


    // // @feature
    // // @move: to presenter?
    // setMinWidth(width: Number){
    //     this.minWidth = width
    // }
    // // @feature
    // // @move: to presenter?
    // setHeight(height: Number){
    //     this.height = height
    // }

    // @private
    // @QUICKFIX: needed labelPadding but is private to this class!
    updateLabelBackground(){
        const width = svg.getBBox(this.html.refs["label-text"]).width + 2 * this.labelPadding
        this.html.refs["label-background"].setAttribute("width", width) 
    }
}
