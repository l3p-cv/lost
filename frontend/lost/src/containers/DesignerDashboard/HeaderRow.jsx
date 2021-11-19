import React, { useEffect, useState } from 'react'
import { CRow, CCol } from '@coreui/react'
import { Card, CardHeader, CardBody, Col, Progress } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPlayCircle } from '@fortawesome/free-solid-svg-icons'

import * as annotask_api from '../../actions/annoTask/annotask_api'
import * as user_api from '../../actions/user/user_api'

/* import LOSTPipelines from '../Pipelines/LOSTPipelines' */
import AmountPerLabel from '../Annotation/AnnoTask/AmountPerLabel'

// for Start pipeline
import vanStripes from '../../assets/img/background.svg'
import proSquares from '../../assets/img/protruding-squares.svg'

const HeaderRow = () => {
    const [workingAnnoTask, setWorkingAnnoTask] = useState({
        isWorkinOnAnno: false,
        id: 0,
        pipelineName: "loading...",
        finished: 0,
        linkToAnno: '',
        amountPerLabel: []
    })

    const [canCreatePipelines, setCanCreatePipelines] = useState(false)

    const { mutate: getWorkingOnAnnoTask, data: workingAnnoTaskResult } = annotask_api.useWorkingAnnotask()
    const { mutate: getSelfUserInformation, data: selfUserInformation } = user_api.useSelfUserInformation()
    useEffect(() => {
        getWorkingOnAnnoTask()
        getSelfUserInformation()
    }, [])

    useEffect(()=> {
        /// only when data from request is available
        if(workingAnnoTaskResult === undefined) return

        // we got the request, but there are no current annotation tasks
        if(workingAnnoTaskResult === null) {
            setWorkingAnnoTask({
                isWorkinOnAnno: false,
                pipelineName: "",
                id: 0,
                finished: 0,
                link: '',
                amountPerLabel: []
            })
        } else {
            setWorkingAnnoTask({
                isWorkinOnAnno: true,
                pipelineName: workingAnnoTaskResult.pipelineName,
                id: workingAnnoTaskResult.id,
                finished: workingAnnoTaskResult.finished * 10,
                link: workingAnnoTaskResult.type.toLowerCase(),
                amountPerLabel: workingAnnoTaskResult.statistic.amountPerLabel 
            })
        }
    }, [workingAnnoTaskResult])

    useEffect(()=> {
        /// only when data from request is available
        if(selfUserInformation === undefined) return

        /// get through all roles of user. if user has matching role set canCreatePipelines to true
        for(var k in selfUserInformation.roles) if(["Designer", "Administrator"].includes(selfUserInformation.roles[k].name)) setCanCreatePipelines(true)
    }, [selfUserInformation])

    return (
        <CRow>
            <div className="col-sm-12 col-md-6">
                <Card style={{height:'90%'}}>
                    <CardHeader>Continue annotating</CardHeader>
                    <CardBody>
                        {workingAnnoTask.isWorkinOnAnno ? (
                            <CRow>
                                <div className="col-sm-6 col-xl-6">
                                    <a href={workingAnnoTask.link} style={{ 'color': '#10515f' }}>
                                        <Card>
                                            <CardBody>
                                                <CRow>
                                                    <CCol xs="9">
                                                        <div className="text-value-lg">{workingAnnoTask.pipelineName}</div></CCol>
                                                    <CCol xs="3">
                                                        <FontAwesomeIcon
                                                            className="mr-3"
                                                            size={'2x'}
                                                            icon={faPlay}
                                                        />
                                                    </CCol>
                                                </CRow>
                                                <p>ID: {workingAnnoTask.id}</p>

                                                
                                                <Progress value={workingAnnoTask.finished} color="primary"></Progress>
                                            </CardBody>
                                        </Card>
                                    </a>
                                </div>
                            </CRow>
                        ) : (
                                
                            <CRow>
                                <Col xs="12" sm="6" lg="6">
                                    <a href="/annotation">
                                        <Card className="text-white" style={{backgroundImage: `url(${vanStripes})`, marginBottom: '0px'}}>
                                            <CardBody className="pb-0">
                                                <h3>Go to annotation tasks</h3>
                                                <div style= {{display:'flex', fontSize: '5em', justifyContent: 'center', paddingBottom: '15px'}}>
                                                    <FontAwesomeIcon size='sm' icon={faPlayCircle} />
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </a>
                                </Col>
                            </CRow>
                        )}
                    </CardBody>
                </Card>
            </div>
            <div className="col-sm-12 col-md-6">
                {canCreatePipelines ? (
                    <Card style={{height:'90%'}}>
                        <CardHeader>Create a new Pipeline</CardHeader>
                        <CardBody>
                        
                                <CRow>
                                    <Col xs="12" sm="6" lg="6">
                                        <Card className="text-white" style={{backgroundImage: `url(${vanStripes})`, marginBottom: '0px'}}>
                                            <CardBody className="pb-0">
                                                <h3>Single Image Annotation</h3>
                                                <div style= {{display:'flex', fontSize: '5em', justifyContent: 'center', paddingBottom: '15px'}}>
                                                    <FontAwesomeIcon size='sm' icon={faPlayCircle} />
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col xs="12" sm="6" lg="6">
                                        <Card className="text-white" style={{backgroundImage: `url(${proSquares})`, marginBottom: '0px'}}>
                                            <CardBody className="pb-0">
                                                <h3>Multi Image Annotation</h3>
                                                <div style= {{display:'flex', fontSize: '5em', justifyContent: 'center', paddingBottom: '15px'}}>
                                                    <FontAwesomeIcon size='sm' icon={faPlayCircle} />
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </CRow>
                        </CardBody>
                    </Card>
                ) : (
                    <Card style={{height:'90%'}}>
                        <CardHeader>Labels on current annotation task</CardHeader>
                        <CardBody>
                            {
                                workingAnnoTask.isWorkinOnAnno ? (
                                    <AmountPerLabel
                                        stats={workingAnnoTask.amountPerLabel}
                                        options={{maintainAspectRatio: false}}
                                    ></AmountPerLabel>
                                ) : (
                                    <h3>You are currently not working on a task</h3>
                                )
                            }
                        </CardBody>
                    </Card>
                )}
            </div>
        </CRow>
    )
}

export default HeaderRow