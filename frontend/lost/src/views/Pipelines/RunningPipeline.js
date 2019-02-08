import React, { Component } from 'react'
import { connect } from 'react-redux'
import RunningPipeline from 'pipRoot/running/runningPipeline'
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

	}
	render(){
		return (
			<Row>
				<Col xs='12' sm='12' lg='12'>
                    <Card>
                        <CardBody>
							<RunningPipeline/>
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