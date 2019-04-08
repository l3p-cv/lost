import React, { Component } from 'react'
import { connect } from 'react-redux'
import RunningPipeline from 'pipRoot/running/RunningPipeline'
import {
	Row,
	Col,
	Card,
	CardBody,
} from 'reactstrap'


class RunningPipe extends Component {
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
                        <CardBody >
							<RunningPipeline />
                        </CardBody>
                    </Card>
                </Col>
			</Row>
		)
	}
}


export default connect(null)(RunningPipe);