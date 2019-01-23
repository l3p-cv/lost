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
		this.siaMount = React.createRef()
		this.actionsMount = React.createRef()
	}
	componentDidMount(){
		this.props.getWorkingOnAnnoTask()
		const init = require("../../tools/sia/src/appPresenter").default
		init({
			siaMount: this.siaMount.current,
			actionsMount: this.actionsMount.current,
			updateAnnotationStatus: getWorkingOnAnnoTask,
			props: this.props,
			token: this.props.token,
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
									{/* the mount point needs to stay positioned relative (see sia hide plane) */}
									<div ref={this.siaMount} style={{position: "relative"}}></div>
								</Col>
							</Row>
						</CardBody> 
					</Card>
					<Card>
						<CardHeader>
							Action Reference
						</CardHeader>
						<CardBody>
							<Row>
								<Col xs='12'>
									<div ref={this.actionsMount}></div>
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
    return ({ workingOnAnnoTask: state.annoTask.workingOnAnnoTask, token: state.auth.token })
}

export default connect(mapStateToProps, {getWorkingOnAnnoTask})(SingleImageAnnotation)