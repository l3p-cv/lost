import React from "react"
import { Component } from "react"
import * as appView from "../tool-test/sia/src/appView"
import * as controlsView from "../tool-test/sia/src/components/controls/controlsView"

export default class SIA extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		require("../tool-test/sia/src/appPresenter")
		this.mount.current.appendChild(appView.html.fragment)
		this.mount.current.appendChild(controlsView.html.fragment)
	}
	render(){
		return (
			<div ref={this.mount} id="sia-mount"></div>
		)
	}
}