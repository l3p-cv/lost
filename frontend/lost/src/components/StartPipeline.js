import React, { Component } from "react"
import ReactDOM from "react-dom"

// import * as appView from "../tool-test/pipeline/src/"

export default class SingleImageAnnotation extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		// require("../tool-test/pipeline/src/")
		// this.mount.current.appendChild(appView.html.fragment)
	}
	render(){
		return (
			<div ref={this.mount} id="start-pipeline-mount">bar</div>
		)
	}
}