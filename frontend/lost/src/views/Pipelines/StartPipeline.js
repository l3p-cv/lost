import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
	Row,
	Col,
	Card,
	CardBody,
} from 'reactstrap'
import StartPipeline from '../../tools/pipeline/src/start/startPipeline'

class StartPipe extends Component {
	constructor(props){
		super(props)
	}

	render(){
		return (
			<Row>
				<Col xs='12' sm='12' lg='12'>
                    <Card>
                        <CardBody>
							<StartPipeline />
                        </CardBody>
                    </Card>
                </Col>
			</Row>
		)
	}
}



export default connect(null)(StartPipe);