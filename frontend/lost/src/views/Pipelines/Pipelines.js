import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
	Row,
	Col,
	Card,
	CardBody,
} from 'reactstrap'


class Pipelines extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	
	componentDidMount(){
		// the app will get mounted when requiring it.
		// theirfore we use a page reload quickfix below.
		// mounting via method did not work.
		const init = require('../../tools/pipeline/src/apps/running/appPresenter.js').default
		init({
			token: this.props.token,
			polling: {
				enabled: true,
				rate: 1000,
			},
		})
		
		// re-render quick fix.
		if(this.mount.current.childNodes.length === 0){
			window.location.reload()
		}
	}
	render(){
		return (
			<Row>
				<Col xs='12' sm='12' lg='12'>
                    <Card>
                        <CardBody>
							<div ref={this.mount} id='mount-point-running-pipelines'></div>
                        </CardBody>
                    </Card>
                </Col>
			</Row>
		)
	}
}

function mapStateToProps(state) {
    return { token: state.auth.token, }
}

export default connect(mapStateToProps)(Pipelines);