import { CAlert, CCol, CRow,
    CModal, CModalBody, CModalFooter, CModalHeader,
    CForm, CFormInput, CInputGroup, CFormLabel
 } from '@coreui/react'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { Node, useNodes } from '@xyflow/react'
import { useState } from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'
import { PipelineTemplateResponse } from '../../../../actions/pipeline/model/pipeline-template-response'
import { getFormattedPipelineRequestElements } from '../../../../actions/pipeline/pipeline-util'
import { useCreateAndStartPipeline } from '../../../../actions/pipeline/pipeline_api'
import IconButton from '../../../../components/IconButton'

interface SubmitPipelineModalProps {
    isOpen: boolean
    toggle: () => void
    templateData: PipelineTemplateResponse
}

export const PipelineStartModal = ({
    isOpen,
    toggle,
    templateData,
}: SubmitPipelineModalProps) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const nodes = useNodes()
    const { mutate: startPipeline } = useCreateAndStartPipeline()

    const isPipelineValid = nodes.every((node) => node.data.verified === true)

    const handleSubmitPipeline = (
        name: string,
        description: string,
        nodes: Node[],
        templateData: PipelineTemplateResponse,
    ) => {
        const pipeline = {
            name: name,
            description: description,
            templateId: templateData.id,
            elements: getFormattedPipelineRequestElements(nodes, templateData),
        }
        const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true';
        if (joyrideRunning) {
            window.dispatchEvent(
                new CustomEvent('joyride-next-step', { detail: { step: 'last-step-done' } })
            );
        }

        startPipeline(pipeline)
        toggle()
    }

    return (
        <CModal visible={isOpen} onClose={() => {
                    if (isOpen){
                        toggle();
                    }
            }}>
            <CModalHeader>Start Pipeline</CModalHeader>
            {!isPipelineValid && (
                <CModalBody>
                    <CAlert color="warning">
                        <div className="d-flex align-items-center">
                            <FaExclamationTriangle className="me-2" size={40} />
                            <p className="mb-0">
                                Your pipeline is not fully configured. Ensure all nodes
                                are green before proceeding to the next step and starting
                                the pipeline.
                            </p>
                        </div>
                    </CAlert>
                </CModalBody>
            )}

            {isPipelineValid && (
                <CForm
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmitPipeline(name, description, nodes, templateData)
                    }}
                >
                    <CModalBody>
                        <div>
                            <CRow className="justify-content-center">
                                <CCol sm="10">
                                        <CFormLabel>Name</CFormLabel>
                                        <CInputGroup className="mb-3">
                                        <CFormInput
                                            required
                                            defaultValue={name}
                                            onChange={(e) => setName(e.target.value)}
                                            type="text"
                                            name="name"
                                            placeholder='Name your pipeline for identification'
                                            className='start-pipeline-modal'
                                            id="name"
                                        >
                                        </CFormInput>
                                        </CInputGroup>
                                         <CFormLabel>Description</CFormLabel>
                                        <CInputGroup className="mb-3">
                                        <CFormInput
                                            defaultValue={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                            type="text"
                                            name="description"
                                            id="description"
                                            placeholder='Describe your pipeline'
                                            required
                                        />
                                        </CInputGroup>
                                </CCol>
                            </CRow>
                        </div>
                    </CModalBody>
                    <CModalFooter>
                        <IconButton
                            icon={faPlay}
                            type="submit"
                            text="Start Pipeline"
                            color="primary"
                            isOutline={false}
                            isTextLeft={false}
                            style={{ marginBottom: 20 }}
                            className="start-pipeline-btn"
                        />
                    </CModalFooter>
                </CForm>
            )}
        </CModal>
    )
}
