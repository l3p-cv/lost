import React, { Component } from "react"
import {connect} from 'react-redux';

import {
	Row,
	Col,
} from 'reactstrap'


class SingleImageAnnotation extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		const init = require("../../tools/pipeline/src/apps/start/appPresenter.js").default
		init(this.props.token)
	}
	render(){
		return (
			<Row>
				<Col>
					<div ref={this.mount} id="start-pipeline"></div>
				</Col>
			</Row>
		)
	}
}

function mapStateToProps(state) {
    return {token: state.auth.token,};
}

export default connect(mapStateToProps)(SingleImageAnnotation);