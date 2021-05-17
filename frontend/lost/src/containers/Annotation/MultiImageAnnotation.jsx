import React, { Component } from "react"
import {connect} from 'react-redux'

import { 
	Col,
    Row
} from 'reactstrap'
import MIA from './MIA/MIA'
import WorkingOnMIA from './AnnoTask/WorkingOnMIA'


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
					<Row>
						<Col  xs='12' sm='12' lg='12'>
							<WorkingOnMIA annoTask={this.props.workingOnAnnoTask}></WorkingOnMIA>
							<MIA></MIA>
						</Col>
					</Row>
				</Col>
			</Row>
			
		)
	}
}

function mapStateToProps(state) {
    return ({workingOnAnnoTask: state.annoTask.workingOnAnnoTask})
}

export default connect(mapStateToProps, {getWorkingOnAnnoTask})(MultiImageAnnotation)