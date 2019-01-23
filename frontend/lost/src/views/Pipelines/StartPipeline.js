import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
	Row,
	Col,
	Card,
	CardBody,
} from 'reactstrap'


class SingleImageAnnotation extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		// the app will get mounted when requiring it.
		// theirfore we use a page reload quickfix below.
		// mounting via method did not work.
		const init = require('../../tools/pipeline/src/apps/start/appPresenter.js').default
		init({
			token: this.props.token,
		})

		// re-render quick fix.
		if(this.mount.current.childNodes.length === 0){
			window.location.reload()
		}
	}
	componentWillUnmount(){
	}
	render(){
		return (
			<Row>
				<Col xs='12' sm='12' lg='12'>
                    <Card>
                        <CardBody>
							<div ref={this.mount} id="mount-point-start-pipeline"></div>
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

export default connect(mapStateToProps)(SingleImageAnnotation);