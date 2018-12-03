import React, { Component } from "react"
import {connect} from 'react-redux'

import { 
    CardHeader,
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'
import MIA from '../../containers/MIA/MIA'
import WorkingOnMIA from '../../components/AnnoTask/WorkingOnMIA'


import actions from '../../actions'
const {getWorkingOnAnnoTask} = actions

class MultiImageAnnotation extends Component {

	componentDidMount(){
		this.props.getWorkingOnAnnoTask()
	
	}
	render(){
		return (
			<Row>
			<Col>
				<Card>
				<CardHeader>
					Multi Image Annotation
				</CardHeader>
					<CardBody>
					<Row>
						<Col  xs='12' sm='12' lg='12'>
							<WorkingOnMIA annoTask={this.props.workingOnAnnoTask}></WorkingOnMIA>
							<MIA></MIA>
					</Col>
					</Row>
					  </CardBody> 
				</Card>
			</Col>
		</Row>
			
		)
	}
}

function mapStateToProps(state) {
    return ({workingOnAnnoTask: state.annoTask.workingOnAnnoTask})
}

export default connect(mapStateToProps, {getWorkingOnAnnoTask})(MultiImageAnnotation)