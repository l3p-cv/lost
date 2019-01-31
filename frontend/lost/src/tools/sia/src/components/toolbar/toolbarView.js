import $ from "cash-dom"

import { NodeTemplate } from "l3p-frontend"


export const html = new NodeTemplate(/*html*/`
    <div id="sia-toolbar-container">
        <button class="btn btn-default" data-ref="point" id="sia-tool-point">
            <img src="/assets/icons/l3p-vector-dot.svg"/>
        </button>
        <button class="btn btn-default" data-ref="line" id="sia-tool-line">
            <img src="/assets/icons/l3p-vector-line.svg"/>
        </button>
        <button class="btn btn-default" data-ref="polygon" id="sia-tool-polygon">
            <img src="/assets/icons/l3p-vector-polygon.svg"/>
        </button>
        <button class="btn btn-default" data-ref="bbox" id="sia-tool-bbox">
            <img src="/assets/icons/l3p-vector-box.svg"/>
        </button>
    </div>
`)

export function show(){
    html.root.style.display = "grid"
}
export function hide(){
    html.root.style.display = "none"
}

export function initTools(tools: any){
	// enable or disable tool buttons
    Object.keys(tools).forEach(name => {
        html.refs[name].style.display = (tools[name] === true) ? "block" : "none"
		// html.refs[name].
    })
}

export function deactivateTool(prevId: String){
    if(prevId !== ""){
        $(html.ids[prevId]).toggleClass("sia-tool-selected", false)
    }
}
export function activateTool(id: String){
	$(html.ids[id]).off("blur")
    $(html.ids[id]).toggleClass("sia-tool-selected", true)
}

export function setLayout(layout: String){
    switch(layout){
        case "row":
            $(html.root).toggleClass("toolbar-layout-column", false)
            $(html.root).toggleClass("toolbar-layout-row", true)
            break
        case "column":
            $(html.root).toggleClass("toolbar-layout-row", false)
            $(html.root).toggleClass("toolbar-layout-column", true)
            break
    }
}
export function getWidth(){
    return html.root.clientWidth
}
export function getHeight(){
    return html.root.clientHeight
}
