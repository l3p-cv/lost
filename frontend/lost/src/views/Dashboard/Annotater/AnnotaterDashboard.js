import React, {Component} from 'react'
import {Card, CardBody, CardHeader, Col, Row} from 'reactstrap'
import Facts from '../../../containers/Dashboard/Annotater/Facts';
import ImagesPerDay from '../../../containers/Dashboard/Annotater/ImagesPerDay';
import AmountPerLabel from '../../../containers/Dashboard/Annotater/AmountPerLabel';
import MyAnnoTasks from '../../../containers/Dashboard/Annotater/MyAnnoTasks';
import WorkingOn from '../../../containers/Dashboard/Annotater/WorkingOn';

class AnnotaterDashboard extends Component {
    renderWorkingOn() {
        if (true) {
            return (
                <Row>
                    <Col>
                        <Card>
                            <CardHeader>
                                Working on
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xs='8' md='8' xl='8'>
                                        <WorkingOn></WorkingOn>
                                    </Col>
                                    <Col xs='4' md='4' xl='4'>
                                        <AmountPerLabel></AmountPerLabel>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            )
        }
        return (
            <React.Fragment></React.Fragment>
        )
    }
    render() {

        return (
            <div className='animated fadeIn'>
                {this.renderWorkingOn()}
                <Row>
                    <Col>
                        <Card>
                            <CardHeader>
                                My Annotation Tasks
                            </CardHeader>
                            <CardBody>
                              
                                <br/>
                
                                <MyAnnoTasks></MyAnnoTasks>

                            </CardBody>
                        </Card>
                        <Card>
                            <CardHeader>
                                Statistics
                            </CardHeader>
                            <CardBody>
                            <Facts></Facts>
                            <ImagesPerDay></ImagesPerDay>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}

export default AnnotaterDashboard
