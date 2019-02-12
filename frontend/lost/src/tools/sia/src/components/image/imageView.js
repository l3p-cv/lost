import $ from "cash-dom"

import "./image.styles.scss"
import { NodeTemplate } from "l3p-frontend"


export const image = new Image()

/**
 * The image-view component has:
 * - a container
 * - a notification if no more images are available
 * - a svg for the drawing area
 */
export const html = new NodeTemplate(/*html*/`
    <div id="sia-imgview">		
		<div id="sia-imgview-svg-container">
			<svg id="sia-imgview-svg">
				<image id="sia-imgview-svg-image" href=""/>
				<g data-ref="drawables"></g>
			</svg>
		</div>
		<div data-ref="image-info">
			<button data-ref="sia-delete-junk-btn" class="btn btn-default"><i class="fa fa-trash"></i></button>
			<span data-ref="image-name"></span>
			<span data-ref="image-progress"></span>
		</div>
    </div>
`)

export function updateImage(imgPath: String){
    html.ids["sia-imgview-svg-image"].setAttribute("href", imgPath)
    image.src = imgPath
}
export function updateInfo(info: any){
    const { name, id, number, amount } = info
    if(name && id){
        html.refs["image-name"].textContent = `${name}  ( id:${id} )`
    }
    if(number && amount){
        html.refs["image-progress"].textContent = `${number}/${amount}`
    }
}

export function addDrawable(drawable: DrawablePresenter){
    // console.log("adding drawable:", drawable)
    html.refs.drawables.appendChild(drawable.view.html.fragment)
    // QUICKFIX: PointPresenter not showing label background.
    if(drawable.getClassName() === "PointPresenter"){
        drawable.setLabel(drawable.model.label)
    }
    drawable.resize()
}
/**
 * Add Drawables from Array.
 * @todo: Improve performance by using docurment fragments if needed.
 * @param {*} drawables 
 */
export function addDrawables(drawables: Array<any>){
    drawables.forEach(d => addDrawable(d))
}
export function removeDrawable(view: DrawableView){
    view.html.root.remove()
}

export function getWidth(){
    return html.ids["sia-imgview-svg-image"].getAttribute("width")
}
export function getHeight(){
    return html.ids["sia-imgview-svg-image"].getAttribute("height")
}

export function hide(){
    html.root.style.display = "none"
}
export function show(){
    html.root.style.display = "grid"
}

export function resize(width: Number, height: Number){
    // resize image info
    $(html.refs["image-info"]).width(width)

    // resize image
	html.ids["sia-imgview-svg-image"].setAttribute("width", width)
    html.ids["sia-imgview-svg-image"].setAttribute("height", height)

    // resize svg
    html.ids["sia-imgview-svg"].setAttribute("width", width)
    html.ids["sia-imgview-svg"].setAttribute("height", height)
    html.ids["sia-imgview-svg"].setAttribute("viewBox", `0 0 ${width} ${height}`)
}
