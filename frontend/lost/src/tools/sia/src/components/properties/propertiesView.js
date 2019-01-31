import $ from "cash-dom"

import "./properties.styles.scss"
import { NodeTemplate, keyboard } from "l3p-frontend"
import appModel from "../../appModel"

export const html = new NodeTemplate(/*html*/`
    <div id="sia-propview-container">

        <!-- canvas -->
        <div data-ref="canvas-area" class="sia-propview-canvas-border">
            <canvas data-ref="canvas"></canvas>
        </div>

        <!-- labelselect, description -->
        <div data-ref="label-area">
			<div data-ref="label-select"></div>
            <textarea data-ref="label-description" class="form-control" rows="3" placeholder="Description" disabled></textarea>
        </div>

        <!-- bounds and buttons -->
        <div data-ref="properties-area">
            <div data-ref="attr-1">
                <strong data-ref="attr-text-1"></strong>
                <span data-ref="attr-value-1"></span>
            </div>
            <div data-ref="attr-2">
                <strong data-ref="attr-text-2"></strong>
                <span data-ref="attr-value-2"></span>
            </div>
            <div data-ref="attr-3">
                <strong data-ref="attr-text-3"></strong>
                <span data-ref="attr-value-3"></span>
            </div>
            <div data-ref="attr-4">
                <strong data-ref="attr-text-4"></strong>
                <span data-ref="attr-value-4"></span>
            </div>
            <button data-ref="btn-first" class="btn btn-default"
                title="got to first edited image">
                <i class="fa fa-arrow-circle-o-left" aria-hidden="true"></i>
            </button>
            <button data-ref="btn-latest" class="btn btn-default"
                title="go to latest edited image">
                <i class="fa fa-arrow-circle-o-right" aria-hidden="true"></i>
            </button>
            <button data-ref="btn-prev" class="btn btn-default">
                <i class="fa fa-arrow-left" aria-hidden="true"></i>
            </button>
            <button data-ref="btn-next" class="btn btn-default">
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </button>
        </div>
    </div>
`)

// create a react component that embedds a react auto complete component.
// this will get rendered each time updateLabels() gets called. 
import React, { Component } from "react"
import ReactDOM from "react-dom"
import Autocomplete from "react-autocomplete"
import { enableChange, disableChange } from "../image/change-global"
import { enableDelete, disableDelete } from "../image/change-delete"
class LabelSelect extends Component {
	constructor(props){
		super(props)
		this.state = {
			labels: appModel.data.labelList.value,
			previousLabel: appModel.state.selectedLabel.value,
			selectedLabel: appModel.state.selectedLabel.value,
			displayedValue: appModel.state.selectedLabel.value.name,
			enabled: appModel.config.value.actions.labeling,
		}
		this.root = React.createRef()
	}
	componentDidMount(){
		appModel.data.labelList.on("update", labels => this.setState({ labels }))
		appModel.state.selectedLabel.on("update", label => this.setState({
			previousLabel: label,
			selectedLabel: label,
			displayedValue: label.name,
		}))
		appModel.state.selectedLabel.on("update", label => this.setState({
			previousLabel: label,
			selectedLabel: label,
			displayedValue: label.name,
		}))
		appModel.config.on("update", config => {
			this.setState({ enabled: config.actions.labeling })
		})
	}
	render(){
		return (
			<Autocomplete
				ref={this.root}
				items={this.state.labels}
				value={this.state.displayedValue}
				getItemValue={label => label.name}
				renderInput={props => {
					return (
						<input {...props} className='form-control' disabled={!this.state.enabled}/>
					)
				}} 
				renderItem={(item, highlighted) => {
					return (
						<div
							key={item.id}
							style={{ backgroundColor: highlighted ? '#eee' : 'transparent' }}
						>
							{item.name}
						</div>
					)
				}}
				shouldItemRender={(item, value) => {
					if(appModel.state.selectedLabel.value.name === this.state.displayedValue){
						return true
					} else {
						return item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
					}
				}}
				onChange={(e, value) => {
						const displayedValue = value
						const selectedLabel = this.state.labels.find(label => label.name === displayedValue)
						// can lead to undefined selectedLabel
						this.setState({
							selectedLabel,
							displayedValue,
						})
					}
				}
				onSelect={displayedValue => {
						const selectedLabel = this.state.labels.find(label => label.name === displayedValue)
						appModel.state.selectedLabel.update(selectedLabel)
						this.setState({
							previousLabel: selectedLabel,
							selectedLabel,
							displayedValue,
						})
						this.root.current.blur()
					}
				}
				inputProps={{
					onKeyDown: e => {
						// stop propagation, so drawable selection event handlers do not get triggered.
						e.stopPropagation()
						if(keyboard.isKeyHit(e, ["Escape", "Tab"])){
							this.root.current.blur()
						}
						if(keyboard.isKeyHit(e, ["Enter"])){
							// if entered text was not valid select last label
							if(this.state.selectedLabel === undefined){
								this.setState(state => {
									return { 
										selectedLabel: state.previousLabel,
										displayedValue: state.previousLabel.name,
									}
								})
							}
						}
					},
					onKeyUp: e => {
						// stop propagation, so drawable selection event handlers do not get triggered.
						e.stopPropagation()
						// its important that removing element focus happens on key up,
						// else the component wont select a label that you 
						// navigated to and want to select with enter key.
						if(keyboard.isKeyHit(e, "Enter")){
							// only leave if you entered a valid label
							if(this.state.selectedLabel !== undefined){
								this.root.current.blur()
							}
						}
					},
					onFocus: e => {
						this.setState(state => {
							return {
								previousLabel: state.selectedLabel,
								selectedLabel: undefined,
								displayedValue: "" ,
							}
						})
						disableChange()
						disableDelete()
					},
					onBlur: e => {
						enableChange()
						enableDelete()
					},
				}}
			/>
		)
	}
}
const LabelSelectInstance = <LabelSelect />
ReactDOM.render(LabelSelectInstance, html.refs["label-select"])

export const image = new Image()


export function updateTable(drawable: DrawablePresenter){
    switch(drawable.getClassName()){
        case "PointPresenter":
            // show x and y
            html.refs["attr-text-1"].textContent = ""
            html.refs["attr-text-2"].textContent = ""
            html.refs["attr-text-3"].textContent = "X"
            html.refs["attr-text-4"].textContent = "Y"
            html.refs["attr-value-1"].textContent = ""
            html.refs["attr-value-2"].textContent = ""
            html.refs["attr-value-3"].textContent = Math.round(drawable.getX())
            html.refs["attr-value-4"].textContent = Math.round(drawable.getY())
            break
        case "BoxPresenter":
            // show x, y, w, h
            html.refs["attr-text-1"].textContent = "W"
            html.refs["attr-text-2"].textContent = "H"
            html.refs["attr-text-3"].textContent = "X"
            html.refs["attr-text-4"].textContent = "Y"
            html.refs["attr-value-1"].textContent = Math.round(drawable.getW())
            html.refs["attr-value-2"].textContent = Math.round(drawable.getH())
            html.refs["attr-value-3"].textContent = Math.round(drawable.getX())
            html.refs["attr-value-4"].textContent = Math.round(drawable.getY())
            break
        case "MultipointPresenter":
            // show left, right, top, bottom
            const { left, right, top, bottom } = drawable.getBounds()
            html.refs["attr-text-1"].textContent = "Left"
            html.refs["attr-text-2"].textContent = "Right"
            html.refs["attr-text-3"].textContent = "Top"
            html.refs["attr-text-4"].textContent = "Bottom"
            html.refs["attr-value-1"].textContent = Math.round(left)
            html.refs["attr-value-2"].textContent = Math.round(right)
            html.refs["attr-value-3"].textContent = Math.round(top)
            html.refs["attr-value-4"].textContent = Math.round(bottom)
            break
        default: 
            throw new Error(`Selected drawable has invalid class name: ${drawable.getClassName()}`)
    }    
}
export function updateCanvas(values: any){
    // reset canvas
    const ctx = html.refs["canvas"].getContext("2d")
    ctx.clearRect(0, 0, values.canvas.width, values.canvas.height)
    ctx.save()

    // draw clipped and centered image
    ctx.drawImage(
        image,
        values.drawable.source.x, values.drawable.source.y,
        values.canvas.width / values.canvas.zoomFactor, values.canvas.height / values.canvas.zoomFactor,
        0, 0,
        values.canvas.width, values.canvas.height
    )
    // draw paddings
    ctx.globalAlpha = 0.3
    ctx.fillStyle = "#000"
    if(values.drawable.ratio >= values.canvas.ratio) {
        // show height padding
        ctx.fillRect(0, 0, values.canvas.width, values.padding)
        ctx.fillRect(0, (values.drawable.height * values.drawable.zoomFactor) + values.padding, values.canvas.width, values.padding)
    } else {
        // show width padding
        ctx.fillRect(0, 0, values.padding, values.canvas.height)
        ctx.fillRect((values.drawable.width * values.drawable.zoomFactor) + values.padding, 0, values.padding, values.canvas.height)
    }

    ctx.restore()
}

export function setLayout(layout: String){
    switch(layout){
        case "landscape":
            $(html.root).toggleClass("propview-layout-portrait", false)
            $(html.root).toggleClass("propview-layout-landscape", true)
            break
        case "portrait":
            $(html.root).toggleClass("propview-layout-landscape", false)
            $(html.root).toggleClass("propview-layout-portrait", true)
            break
    }
}
export function setDescription(description: String){
    html.refs["label-description"].textContent = description
}
export function setNextButtonState(state: String){
    switch(state){
        case "finish":
            enableNextButton()
            $(html.refs["btn-next"]).toggleClass("btn-default", false)
            $(html.refs["btn-next"]).toggleClass("btn-primary", true)
            html.refs["btn-next"].innerHTML = ""
            html.refs["btn-next"].innerText = "finish"
            break
        case "default":
            enableNextButton()
            $(html.refs["btn-next"]).toggleClass("btn-default", true)
            $(html.refs["btn-next"]).toggleClass("btn-primary", false)
            html.refs["btn-next"].innerText = ""
            html.refs["btn-next"].innerHTML = `<i class="fa fa-arrow-right" aria-hidden="true"></i>`
            break
        case "disable":
            disableNextButton()
            break
        case "enable":
            enableNextButton()
            break
        default:
            throw new Error(`unknown state '${state}'. use 'finish', 'disable', 'enable' or 'default' instead.`)
    }
}

export function resize(){
    html.refs["canvas"].width = $(html.refs["canvas"].parentNode).width()
    html.refs["canvas"].height = $(html.refs["canvas"].parentNode).height()
    // force width for hiearchy select. css not working as it should.
    $(html.refs["label-area"].firstChild).width($(html.refs["label-area"]).width())
}

export function resetCanvas(){
    const ctx = html.refs["canvas"].getContext("2d")
    ctx.clearRect(0, 0, html.refs["canvas"].width, html.refs["canvas"].height)
    showCanvasBorder()
}
export function resetTable(){
    html.refs["attr-text-1"].textContent = ""
    html.refs["attr-text-2"].textContent = ""
    html.refs["attr-text-3"].textContent = ""
    html.refs["attr-text-4"].textContent = ""
    html.refs["attr-value-1"].textContent = ""
    html.refs["attr-value-2"].textContent = ""
    html.refs["attr-value-3"].textContent = ""
    html.refs["attr-value-4"].textContent = ""
}

export function resetDescription(){
    html.refs["label-description"].textContent = "Select or create a Drawable to edit it."
}

export function enableNextButton(){
    html.refs["btn-next"].disabled = false
}
export function enablePrevButton(){
    html.refs["btn-prev"].disabled = false
}
export function enableFirstButton(){
    html.refs["btn-first"].disabled = false
}
export function enableLastButton(){
    html.refs["btn-latest"].disabled = false
}
// appModel.data.image.isFirst
export function disableNavigationButtons(){
    disableFirstButton()    
    disableLastButton()    
    disableNextButton()    
    disablePrevButton()    
}
export function disableNextButton(){
    html.refs["btn-next"].disabled = true
}
export function disablePrevButton(){
    html.refs["btn-prev"].disabled = true
}
export function disableFirstButton(){
    html.refs["btn-first"].disabled = true
}
export function disableLastButton(){
    html.refs["btn-latest"].disabled = true
}

export function showCanvasBorder(){
    $(html.refs["canvas-area"]).toggleClass("sia-propview-canvas-border", true)
}
export function hideCanvasBorder(){
    $(html.refs["canvas.area"]).toggleClass("sia-propview-canvas-border", false)
}

export function hide(){
    html.ids["sia-propview-container"].style.display = "none"
}
export function show(){
    html.ids["sia-propview-container"].style.display = "grid"
}

export function getBounds(){
    return html.root.getBoundingClientRect()
}
export function getWidth(){
    return html.root.clientWidth
}
export function getHeight(){
    return html.root.clientHeight
}

