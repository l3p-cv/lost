import React, { Component } from "react"
import { 
    CardHeader,
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'



class SiaReview extends Component {
	constructor(props){
		super(props)
	}


	render(){
		return (
			<Row >
				<Col>
					<Card>
						<CardHeader>
							Single Image Annotation - Review !
						</CardHeader>
						<CardBody >
							<Row>
								<Col xs='12'>
								Review here ...
								</Col>
							</Row>
						</CardBody> 
					</Card>
				</Col>
			</Row>
		)
	}
}

export default SiaReview