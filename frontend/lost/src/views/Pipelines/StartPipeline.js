import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
	Row,
	Col,
	Card,
	CardBody,
} from 'reactstrap'
import StartPipeline from '../../components/pipeline/src/start/StartPipeline'

class StartPipe extends Component {
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