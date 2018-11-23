import React, { Component } from "react"
import {connect} from 'react-redux'
import ReactDOM from "react-dom"

import * as appView from "../../tools/sia/src/appView"
import * as controlsView from "../../tools/sia/src/components/controls/controlsView"

import LabelSelect from "../../components/LabelSelect/LabelSelect"
import { 
    CardHeader,
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'
import WorkingOnSIA from '../../components/AnnoTask/WorkingOnSIA'


import actions from '../../actions'
const {getWorkingOnAnnoTask} = actions

class SingleImageAnnotation extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		this.props.getWorkingOnAnnoTask()
		require("../../tools/sia/src/appPresenter")
		this.mount.current.appendChild(appView.html.fragment)
		this.mount.current.appendChild(controlsView.html.fragment)
		// ReactDOM.render(<LabelSelect/>, document.getElementById("sia-propview-label-select-mountpoint"))
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
						<Col  xs='12' sm='12' lg='12'>
							<WorkingOnSIA annoTask={this.props.workingOnAnnoTask}></WorkingOnSIA>
					<div ref={this.mount} id="sia-mount"></div>
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