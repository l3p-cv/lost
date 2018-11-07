import React, { Component } from "react"
import ReactDOM from "react-dom"

import * as appView from "../tool-test/sia/src/appView"
import * as controlsView from "../tool-test/sia/src/components/controls/controlsView"

import LabelSelect from "./LabelSelect"

export default class SingleImageAnnotation extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		require("../tool-test/sia/src/appPresenter")
		this.mount.current.appendChild(appView.html.fragment)
		this.mount.current.appendChild(controlsView.html.fragment)
		// ReactDOM.render(<LabelSelect/>, document.getElementById("sia-propview-label-select-mountpoint"))
	}
	render(){
		return (
			<div ref={this.mount} id="sia-mount"></div>
		)
	}
}