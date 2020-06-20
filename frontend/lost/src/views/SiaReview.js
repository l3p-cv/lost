import React, { Component } from "react"
import { 
    CardHeader,
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'

import SIAReview from '../components/SIAReview/SIAReview.js'

class SiaReview extends Component {
	render(){
		return (<SIAReview/>
			// <Row >
			// 	<Col>
			// 		<Card>
			// 			<CardHeader>
			// 				Single Image Annotation - Review !
			// 			</CardHeader>
			// 			<CardBody >
			// 				{/* <Row> */}
			// 					{/* <Col xs='12'> */}
			// 					<SIAReview></SIAReview>
			// 					{/* </Col> */}
			// 				{/* </Row> */}
			// 			</CardBody> 
			// 		</Card>
			// 	</Col>
			// </Row>
		)
	}
}

export default SiaReview