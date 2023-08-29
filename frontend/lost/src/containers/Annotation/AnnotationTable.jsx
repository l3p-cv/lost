import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
// import Facts from '../../../components/Dashboard/Annotator/Facts'
// import ImagesPerDay from '../../../components/Dashboard/Annotator/ImagesPerDay'
import AmountPerLabel from './AnnoTask/AmountPerLabel'
import MyAnnoTasks from './AnnoTask/MyAnnoTasks'
import WorkingOn from './AnnoTask/WorkingOn'
import actions from '../../actions'
import { useNavigate } from 'react-router-dom'

const { getAnnoTasks, getWorkingOnAnnoTask, chooseAnnoTask } = actions

const AnnotatorDashboard = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const annoTasks = useSelector((state) => state.annoTask.annoTasks)
    const workingOnAnnoTask = useSelector((state) => state.annoTask.workingOnAnnoTask)

    useEffect(() => {
        dispatch(getAnnoTasks())
        dispatch(getWorkingOnAnnoTask())

        // const intervalAction = () => dispatch(getAnnoTasks())
        // const interval = setInterval(intervalAction, 1000)

        // return () => {
        //     clearInterval(interval)
        // }
    }, [])

    const gotoAnnoTask = (id, type) => {
        if (type === 'MIA') {
            dispatch(chooseAnnoTask(id, () => navigate('/mia')))
        } else if (type === 'SIA') {
            dispatch(chooseAnnoTask(id, () => navigate('/sia')))
        }
    }

    const renderWorkingOn = () => {
        if (workingOnAnnoTask !== null) {
            return (
                <Row>
                    <Col>
                        <Card>
                            <CardHeader>Working on</CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xs="6" md="6" xl="6">
                                        <WorkingOn
                                            annoTask={workingOnAnnoTask}
                                        ></WorkingOn>
                                    </Col>
                                    <Col xs="6" md="6" xl="6">
                                        <AmountPerLabel
                                            stats={
                                                workingOnAnnoTask.statistic.amountPerLabel
                                            }
                                        ></AmountPerLabel>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            )
        }
        return <React.Fragment></React.Fragment>
    }

    return (
        <div className="animated fadeIn">
            {renderWorkingOn()}
            <Row>
                <Col>
                    <Card>
                        <CardHeader>My Annotation Tasks</CardHeader>
                        <CardBody>
                            <br />
                            <MyAnnoTasks
                                annoTasks={annoTasks}
                                callBack={(id, type) => gotoAnnoTask(id, type)}
                            ></MyAnnoTasks>
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

export default AnnotatorDashboard
