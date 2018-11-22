import React, {Component} from 'react'
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Progress,
    Row,
    Table
} from 'reactstrap'
import Facts from '../../../containers/Dashboard/Annotater/Facts';
import ImagesPerDay from '../../../containers/Dashboard/Annotater/ImagesPerDay';
import AmountPerLabel from '../../../containers/Dashboard/Annotater/AmountPerLabel';
import MyAnnoTasks from '../../../containers/Dashboard/Annotater/MyAnnoTasks';

class AnnotaterDashboard extends Component {
    render() {

        return (
            <div className='animated fadeIn'>
            <Row>
                <Col>
                    <Card>
                        <CardHeader>
                            Annotation Tasks
                        </CardHeader>
                        <CardBody>
                            <Facts></Facts>
                            <br/>
                            <Row>
                                <Col xs='4' md='4' xl='4'>
                                    <Card>
                                        <AmountPerLabel></AmountPerLabel>
                                    </Card>
                                </Col>
                                <Col xs='4' md='4' xl='4'>
                                    <Card>
                                        <ImagesPerDay></ImagesPerDay>

                                    </Card>
                                </Col>
                                <Col xs='4' md='4' xl='4'>
                                    <Card>
                                        <AmountPerLabel></AmountPerLabel>
                                    </Card>
                                </Col>
                            </Row>
                            <br/>
                            <Card>
                                <MyAnnoTasks></MyAnnoTasks>
                            </Card>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            </div>
        )

    }
}

export default AnnotaterDashboard
