import React, { Component } from "react"
import ReactDOM from "react-dom"
import {connect} from 'react-redux';

class SingleImageAnnotation extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		const init = require("../tools/pipeline/src/apps/start/appPresenter.js").default
		init(this.props.token)
	}
	render(){
		return (
			<div ref={this.mount} id="start-pipeline-mount"></div>
		)
	}
}

function mapStateToProps(state) {
    return {token: state.auth.token,};
}

export default connect(mapStateToProps)(SingleImageAnnotation);