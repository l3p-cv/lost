import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { CCol, CRow } from '@coreui/react'

import WorkingOnSIA from './AnnoTask/WorkingOnSIA'
import SiaWrapper from './SIA/SiaWrapper2'

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

    // method to get the available height of the page without scrolling
    const contentRootStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 375px)',
        overflow: 'hidden',
    }

    const middleStyle = {
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 'auto',
        minHeight: 0,
    }

    return (
        <>
            <WorkingOnSIA annoTask={props.workingOnAnnoTask} />

            <div style={contentRootStyle}>
                <div style={middleStyle}>
                    <SiaWrapper
                        exampleImg={exampleImg}
                        onGetAnnoExample={(exampleArgs) =>
                            handleGetAnnoExample(exampleArgs)
                        }
                    />
                </div>
                <h3>SIA2 Preview</h3>
            </div>
        </>
    )
}

function mapStateToProps(state) {
    return { workingOnAnnoTask: state.annoTask.workingOnAnnoTask }
}

export default connect(mapStateToProps, { getWorkingOnAnnoTask })(SingleImageAnnotation)
