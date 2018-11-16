import React, { Component } from "react"
import ReactDOM from "react-dom"

// import * as appView from "../tools/pipeline/src/"

export default class SingleImageAnnotation extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		// require("../tools/pipeline/src/")
		// this.mount.current.appendChild(appView.html.fragment)
	}
	render(){
		return (
			<div ref={this.mount} id="start-pipeline-mount">foo</div>
		)
	}
}