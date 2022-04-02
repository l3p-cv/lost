import React, { Component, useEffect, useState } from "react"
import {connect} from 'react-redux'
import { 
	Col,
    Row
} from 'reactstrap'

import WorkingOnSIA from './AnnoTask/WorkingOnSIA'
import SIA from './SIA/SIA'

import actions from '../../actions'
import * as exampleApi from '../../actions/annoExample/annoExample_api'
import * as dataApi from '../../actions/data/data_api'

const { getWorkingOnAnnoTask } = actions


// class SingleImageAnnotation extends Component {
const SingleImageAnnotation = (props) => {
	// constructor(props){
	// 	super(props)
	// 	this.state = {
	// 		image: undefined
	// 	}
	// }
	const [exampleImg, setExampleImg] = useState()

    const { data: exampleAnnoId, mutate: getAnnoExample } = exampleApi.useGetAnnoExample({})
    const { data: requestedImg, mutate: getExampleImg } = dataApi.useGetImg({})

	useEffect(() => {
		props.getWorkingOnAnnoTask()
	}, [])

	useEffect(() => {
		setExampleImg(requestedImg)
		
	}, [requestedImg])

	useEffect(() => {
		if (exampleAnnoId){
			getExampleImg({
				id:exampleAnnoId, type:'annoBased', 
				drawAnno: true, addContext:0.05}
			)
		} else {
			setExampleImg(undefined)
		}
		
	}, [exampleAnnoId])

	const handleGetAnnoExample = (exampleArgs) => {
		console.log('SingleImageAnnotation', exampleArgs)
		if (exampleArgs.lbl){
			getAnnoExample({llId:exampleArgs.lbl.id})
		}

	}
	// componentDidMount(){
	// 	this.props.getWorkingOnAnnoTask()
	// }

	// render(){
	// 	console.log(this.props.annos)
		return (
			<Row>
				<Col>
					<Row>
						<Col xs='12'>
							<WorkingOnSIA annoTask={props.workingOnAnnoTask}
							/>
							<SIA
								exampleImg={exampleImg}
								onGetAnnoExample={(exampleArgs) => handleGetAnnoExample(exampleArgs)}
							/>
						</Col>
					</Row>
				</Col>
			</Row>
		)
	// }
}

function mapStateToProps(state) {
    return ({ workingOnAnnoTask: state.annoTask.workingOnAnnoTask})
}

export default connect(mapStateToProps, {getWorkingOnAnnoTask})(SingleImageAnnotation)