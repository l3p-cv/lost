import React, { useEffect } from 'react'
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from 'reactstrap'
import { connect } from 'react-redux'
// import actions from "actions/pipeline/pipelineStart";
import actions from '../../../../actions/pipeline/pipelineStart'

import { alertLoading, alertClose, alertError } from '../../globalComponents/Sweetalert'
const { postPipeline } = actions

const StartPipeline = (props) => {
    useEffect(() => {

        if (props.step3Data === undefined) return

        alertClose()
        if (props.step3Data.response.status === 200) {
            if (typeof window !== 'undefined') {
                window.location.href = `${window.location.origin}/pipelines`
            }
        } else {
            alertError(
                `(${props.step3Data.response.response.status}) ${props.step3Data.response.response.statusText}`,
            )
        }
    }, [props.step3Data])

    const startPipe = () => {
        const json = {
            name: props.step2Data.name,
            description: props.step2Data.description,
            elements: props.step1Data.elements.map((el) => {
                if ('loop' in el.exportData) {
                    if (el.exportData.loop.maxIteration === -1) {
                        el.exportData.loop.maxIteration = null
                    }
                }
                return el.exportData
            }),
            templateId: props.step0Data.templateId,
        }
        props.postPipeline(json)
        alertLoading()
    }

    return (
        <div className="pipeline-start-4">
            <h3>Complete</h3>
            <p>You have successfully completed all steps.</p>
            <Button onClick={startPipe} color="primary" size="lg">
                <FontAwesomeIcon icon={faPlayCircle} size="5x" />
                Start Pipe
            </Button>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        step0Data: state.pipelineStart.step0Data,
        step1Data: state.pipelineStart.step1Data,
        step2Data: state.pipelineStart.step2Data,
        step3Data: state.pipelineStart.step3Data,
    }
}

export default connect(mapStateToProps, { postPipeline })(StartPipeline)
