import React from "react"
import { Component } from "react"
import * as appView from "../tool-test/sia/src/appView"

export default class SIA extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		this.mount.current.appendChild(appView.html.fragment)
	}
	render(){
		return (
			<div ref={this.mount} id="sia-mount"></div>
		)
	}
}