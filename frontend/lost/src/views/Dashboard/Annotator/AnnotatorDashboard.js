import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Card, CardBody, CardHeader, Col, Row} from 'reactstrap'
import Facts from '../../../containers/Dashboard/Annotator/Facts'
import ImagesPerDay from '../../../containers/Dashboard/Annotator/ImagesPerDay'
import AmountPerLabel from '../../../components/AnnoTask/AmountPerLabel'
import MyAnnoTasks from '../../../components/AnnoTask/MyAnnoTasks'
import WorkingOn from '../../../components/AnnoTask/WorkingOn'
import actions from '../../../actions'

const {getAnnoTasks, getWorkingOnAnnoTask, chooseAnnoTask} = actions

class AnnotatorDashboard extends Component {
    componentDidMount() {
        this
            .props
            .getAnnoTasks()
        this
            .props
            .getWorkingOnAnnoTask()
        this.timer = setInterval(()=>  this.props.getAnnoTasks(), 1000)
    }
    componentWillUnmount() {
        clearInterval(this.timer)
        this.timer = null
      }

    chooseAnnoTask(id, type) {
        if (type === "MIA") {
            this
                .props
                .chooseAnnoTask(id, this.props.history.push('/mia'))

        } else if (type === "SIA") {

            this
                .props
                .chooseAnnoTask(id, this.props.history.push('/sia'))
        }
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
                                <MyAnnoTasks
                                    annoTasks={this.props.annoTasks}
                                    callBack={(id, type) => this.chooseAnnoTask(id, type)}></MyAnnoTasks>
                            </CardBody>
                        </Card>
                        {/* <Card>
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
                        </Card> */}
                    </Col>
                </Row>
            </div>
        )

    }
}

function mapStateToProps(state) {
    return ({workingOnAnnoTask: state.annoTask.workingOnAnnoTask, annoTasks: state.annoTask.annoTasks})
}
export default connect(mapStateToProps, {getAnnoTasks, getWorkingOnAnnoTask, chooseAnnoTask})(AnnotatorDashboard)
