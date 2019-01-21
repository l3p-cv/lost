import React, { Component } from "react"
import {connect} from 'react-redux'
import { 
    CardHeader,
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'

import WorkingOnSIA from '../../components/AnnoTask/WorkingOnSIA'

import actions from '../../actions'
const { getWorkingOnAnnoTask } = actions


class SingleImageAnnotation extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		this.props.getWorkingOnAnnoTask()
		const init = require("../../tools/sia/src/appPresenter").default
		init({
			mountPoint: this.mount.current,
			updateAnnotationStatus: getWorkingOnAnnoTask,
			props: this.props,
		})
	}
	render(){
		return (
			<Row>
			<Col>
				<Card>
					<CardHeader>
						Single Image Annotation
					</CardHeader>
					<CardBody>
						<Row>
							<Col xs='12'>
								<WorkingOnSIA annoTask={this.props.workingOnAnnoTask}></WorkingOnSIA>
								<div ref={this.mount}></div>
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

export default connect(mapStateToProps, {getWorkingOnAnnoTask})(SingleImageAnnotation)