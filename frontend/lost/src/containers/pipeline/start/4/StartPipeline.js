import React, { useEffect } from 'react'
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from 'reactstrap'
import { alertLoading, alertClose, alertError } from '../../globalComponents/Sweetalert'
import { connect } from 'react-redux'
import * as pipelineApi from '../../../../actions/pipeline/pipeline_api'

const StartPipeline = ({ step0Data, step1Data, step2Data }) => {
    const { data: postPipelineResponse, mutate: postPipeline } = pipelineApi.useCreateAndStartPipeline()

    useEffect(() => {
        if (postPipelineResponse === undefined) return

        alertClose()

        if (postPipelineResponse.status === 200 && postPipelineResponse.data === "success") {
            if (typeof window !== 'undefined') {
                window.location.href = `${window.location.origin}/pipelines`
            }
        } else {
            alertError(
                `(${postPipelineResponse.status}) ${postPipelineResponse.data}`,
            )
        }
    }, [postPipelineResponse])


    const startPipe = () => {
        const json = {
            name: step2Data.name,
            description: step2Data.description,
            elements: step1Data.elements.map((el) => {
                if ('loop' in el.exportData) {
                    if (el.exportData.loop.maxIteration === -1) {
                        el.exportData.loop.maxIteration = null
                    }
                }
                return el.exportData
            }),
            templateId: step0Data.templateId,
        }

        postPipeline(json)
        alertLoading()
    }

    return (
        <div className="pipeline-start-4">
            <h3>Complete</h3>
            <p>You have successfully completed all steps.</p>
            <Button onClick={() => startPipe()} color="primary" size="lg">
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

export default connect(mapStateToProps)(StartPipeline)
