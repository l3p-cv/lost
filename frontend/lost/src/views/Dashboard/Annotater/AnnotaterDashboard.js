import React, {Component} from 'react'
import {Card, CardBody, CardHeader, Col, Row} from 'reactstrap'
import Facts from '../../../containers/Dashboard/Annotater/Facts'
import ImagesPerDay from '../../../containers/Dashboard/Annotater/ImagesPerDay'
import AmountPerLabel from '../../../components/AnnoTask/AmountPerLabel'
import MyAnnoTasks from '../../../components/AnnoTask/MyAnnoTasks'
import WorkingOn from '../../../components/AnnoTask/WorkingOn'

const annoTasks = [
    {
        'name': 'TestTask',
        'id': 1,
        'pipelineName': 'FirstTestPipe',
        'pipelineCreator': 'admin',
        'group': 'dieDollenAnnotierer',
        'createdAt': 'datetime',
        'type': 'MIA',
        'lastActivity': 'datetime',
        'lastAnnotater': 'jochen',
        'finished': 430,
        'size': 450
    },
    {
        'name': 'TestTask',
        'id': 2,
        'pipelineName': 'FirstTestPipe',
        'pipelineCreator': 'admin',
        'group': 'dieDollenAnnotierer',
        'createdAt': 'datetime',
        'type': 'MIA',
        'lastActivity': 'datetime',
        'lastAnnotater': 'jochen',
        'finished': 150,
        'size': 450
    },
    {
        'name': 'TestTask',
        'id': 3,
        'pipelineName': 'FirstTestPipe',
        'pipelineCreator': 'admin',
        'group': 'dieDollenAnnotierer',
        'createdAt': 'datetime',
        'type': 'MIA',
        'lastActivity': 'datetime',
        'lastAnnotater': 'jochen',
        'finished': 300,
        'size': 450
    }, {
        'name': 'TestTask',
        'id': 4,
        'pipelineName': 'FirstTestPipe',
        'pipelineCreator': 'admin',
        'group': 'dieDollenAnnotierer',
        'createdAt': 'datetime',
        'type': 'SIA',
        'lastActivity': 'datetime',
        'lastAnnotater': 'jochen',
        'finished': 405,
        'size': 450
    }
]

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
                                        <WorkingOn annoTask={annoTasks[0]}></WorkingOn>
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
                
                                <MyAnnoTasks annoTasks={annoTasks}></MyAnnoTasks>

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
