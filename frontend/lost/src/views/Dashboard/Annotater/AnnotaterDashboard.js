import React, {Component} from 'react'
import {connect } from 'react-redux'
import {Card, CardBody, CardHeader, Col, Row} from 'reactstrap'
import Facts from '../../../containers/Dashboard/Annotater/Facts'
import ImagesPerDay from '../../../containers/Dashboard/Annotater/ImagesPerDay'
import AmountPerLabel from '../../../components/AnnoTask/AmountPerLabel'
import MyAnnoTasks from '../../../components/AnnoTask/MyAnnoTasks'
import WorkingOn from '../../../components/AnnoTask/WorkingOn'
import actions from '../../../actions'

const {getAnnoTasks, getWorkingOnAnnoTask} = actions

class AnnotaterDashboard extends Component {
    componentDidMount(){
        this.props.getAnnoTasks()
        this.props.getWorkingOnAnnoTask()
    }
    renderWorkingOn() {
        if (this.props.workingOnAnnoTask !== null) {
            return (
                <Row>
                    <Col>
                        <Card>
                            <CardHeader>
                                Working on
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xs='7' md='7' xl='7'>
                                        <WorkingOn annoTask={this.props.workingOnAnnoTask}></WorkingOn>
                                    </Col>
                                    <Col xs='5' md='5' xl='5'>
                                        <AmountPerLabel data={this.props.workingOnAnnoTask.statistic.amountPerLabel}></AmountPerLabel>
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
        console.log(this.props)
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
                                <MyAnnoTasks annoTasks={this.props.annoTasks}></MyAnnoTasks>

                            </CardBody>
                        </Card>
                        <Card>
                            <CardHeader>
                                Statistics
                            </CardHeader>
                            <CardBody>
                            <Facts></Facts>
                            <br/>
                            <div>Images/Day</div>
                            <br/>
                            <ImagesPerDay></ImagesPerDay>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}

function mapStateToProps(state){
    return({workingOnAnnoTask: state.annoTask.workingOnAnnoTask, annoTasks: state.annoTask.annoTasks})
}
export default connect(mapStateToProps, {getAnnoTasks, getWorkingOnAnnoTask})(AnnotaterDashboard)
