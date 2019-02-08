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
	}
	componentDidMount(){
	}
	componentWillUnmount(){
	}
	render(){
		return (
			<Row>
				<Col xs='12' sm='12' lg='12'>
                    <Card>
                        <CardBody>
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