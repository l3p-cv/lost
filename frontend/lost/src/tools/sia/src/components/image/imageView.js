import $ from "cash-dom"

import "./image.styles.scss"
import { NodeTemplate } from "l3p-frontend"

import PointPresenter from "drawables/point/PointPresenter"


/**
 * The image-view component has:
 * - a container
 * - a notification if no more images are available
 * - a svg for the drawing area
 */
export const html = new NodeTemplate(`
    <div id="sia-imgview">
        <div id="sia-imgview-container">
            <div id="sia-imgview-svg-padding"> // overflow: hidden
                <div id="sia-imgview-svg-container"> // overflow: visible
                    <svg id="sia-imgview-svg">
                        <image id="sia-imgview-svg-image" href=""/>
                        <g data-ref="drawables"></g>
                    </svg>
                </div>
            </div>
            <div id="sia-image-info">
                <button data-ref="sia-delete-junk-btn" class="btn btn-default">
                    <i class="fa fa-trash"></i>
                </button>
                <span data-ref="image-name"></span>
                <span data-ref="image-id"></span>
                <div data-ref="space"></div>
                <span data-ref="image-progress"></span>
            </div>
        </div>
        <div id="sia-imgview-no-more-images">
            <h3>No more images.</h3>
        </div>
    </div>
`)
// @todo: make dependend on menubar height (variable)
export const padding = {
    top: 40,
    side: 20,
    bottom: 10,
}
html.ids["sia-imgview-svg-padding"].style.padding = `${padding.top}px ${padding.side}px ${padding.bottom}px ${padding.side}px`
html.ids["sia-image-info"].style.paddingLeft = `${padding.side}px`

export const image = new Image()
export const container = html.ids["sia-imgview-svg-container"]

export function updateImage(imgPath: String){
    html.ids["sia-imgview-svg-image"].setAttribute("href", imgPath)
    image.src = imgPath
}
export function updateInfo(info: any){
    const { name, id, number, amount } = info
    if(name){
        html.refs["image-name"].textContent = name
    }
    if(id){
        html.refs["image-id"].textContent = `( id: ${id} )`
    }
    if(number && amount){
        html.refs["image-progress"].textContent = `${number}/${amount}`
    }
}

export function addDrawable(drawable: DrawablePresenter){
    // console.log("adding drawable:", drawable)
    html.refs.drawables.appendChild(drawable.view.html.fragment)
    // QUICKFIX: PointPresenter not showing label background.
    if(drawable instanceof PointPresenter){
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

export function showNoMoreImages(){
    html.ids["sia-imgview-no-more-images"].style.display = "block"
    html.ids["sia-imgview-container"].style.display = "none"
}
export function hideNoMoreImages(){
    html.ids["sia-imgview-no-more-images"].style.display = "none"
    html.ids["sia-imgview-container"].style.display = "block"
}

export function hide(){
    html.root.style.display = "none"
}
export function show(){
    html.root.style.display = "grid"
    html.ids["sia-imgview-svg-container"].style.display = "block"
    html.ids["sia-image-info"].style.display = "flex"
}

export function resize(width: Number, height: Number){
    // resize image info
    $(html.ids["sia-image-info"]).width(width)

    // resize image
	html.ids["sia-imgview-svg-image"].setAttribute("width", width)
    html.ids["sia-imgview-svg-image"].setAttribute("height", height)

    // resize svg
    html.ids["sia-imgview-svg"].setAttribute("width", width)
    html.ids["sia-imgview-svg"].setAttribute("height", height)
    html.ids["sia-imgview-svg"].setAttribute("viewBox", `0 0 ${width} ${height}`)
}
