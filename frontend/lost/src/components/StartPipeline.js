import React, { Component } from "react"
import ReactDOM from "react-dom"

export default class SingleImageAnnotation extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		const init = require("../tool-test/pipeline/src/apps/start/init.js").default
		init({ debugMode: false })
	}
	render(){
		return (
			<div ref={this.mount} id="start-pipeline-mount">bar</div>
		)
	}
}