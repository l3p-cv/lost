import React, { Component, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Col, Row } from 'reactstrap'

import WorkingOnSIA from './AnnoTask/WorkingOnSIA'
import SiaWrapper from './SIA/SiaWrapper'

import actions from '../../actions'
import * as exampleApi from '../../actions/annoExample/annoExample_api'
import * as dataApi from '../../actions/data/data_api'

const { getWorkingOnAnnoTask } = actions

const SingleImageAnnotation = (props) => {
    const [exampleImg, setExampleImg] = useState()
    const [prevExamples, setPrevExamples] = useState([])

    const { data: exampleAnno, mutate: getAnnoExample } = exampleApi.useGetAnnoExample({})
    const { data: requestedImg, mutate: getExampleImg } = dataApi.useGetImg({})

    useEffect(() => {
        props.getWorkingOnAnnoTask()
    }, [])

    useEffect(() => {
        setExampleImg({ anno: exampleAnno, img: requestedImg })
    }, [requestedImg])

    useEffect(() => {
        if (exampleAnno) {
            getExampleImg({
                id: exampleAnno.id,
                type: 'annoBased',
                drawAnno: true,
                addContext: 0.05,
            })
            setPrevExamples([...prevExamples, exampleAnno.id])
        } else {
            setExampleImg(undefined)
        }
    }, [exampleAnno])

    const handleGetAnnoExample = (exampleArgs) => {
        console.log('SingleImageAnnotation', exampleArgs)
        if (exampleArgs.lbl) {
            getAnnoExample({ llId: exampleArgs.lbl.id, prevExamples })
        }
    }
    return (
        <Row>
            <Col>
                <Row>
                    <Col xs="12">
                        <WorkingOnSIA annoTask={props.workingOnAnnoTask} />
                        <SiaWrapper
                            exampleImg={exampleImg}
                            onGetAnnoExample={(exampleArgs) =>
                                handleGetAnnoExample(exampleArgs)
                            }
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

function mapStateToProps(state) {
    return { workingOnAnnoTask: state.annoTask.workingOnAnnoTask }
}

export default connect(mapStateToProps, { getWorkingOnAnnoTask })(SingleImageAnnotation)
