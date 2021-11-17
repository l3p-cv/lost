import React, { useEffect, useState } from 'react'
import { CRow, CCol } from '@coreui/react'
import { Card, CardHeader, CardBody, Progress } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

import * as annotask_api from '../../actions/annoTask/annotask_api'

const HeaderRow = () => {
    const [workingAnnoTask, setWorkingAnnoTask] = useState({
        isWorkinOnAnno: false,
        id: 0,
        pipelineName: "loading...",
        finished: 0,
        linkToAnno: ''
    })

    const { mutate: getWorkingOnAnnoTask, data: workingAnnoTaskResult } =
        annotask_api.useWorkingAnnotask()
        useEffect(() => {
            getWorkingOnAnnoTask()
    }, [])

    useEffect(()=> {
        /// only when data from request is available
        if(workingAnnoTaskResult !== undefined) setWorkingAnnoTask({
            isWorkinOnAnno: true,
            pipelineName: workingAnnoTaskResult.pipelineName,
            id: workingAnnoTaskResult.id,
            finished: workingAnnoTaskResult.finished * 10,
            link: workingAnnoTaskResult.type.toLowerCase()
        })
    }, [workingAnnoTaskResult])

    return (
        <Card>
            <CardHeader>Continue annotating</CardHeader>
            <CardBody>
                {workingAnnoTask.isWorkinOnAnno ? (
                    <CRow>
                        <div className="col-sm-6 col-xl-3">
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
                    <h3>Currently there are no active annotation tasks</h3>
                )}
            </CardBody>
        </Card>
    )
}

export default HeaderRow