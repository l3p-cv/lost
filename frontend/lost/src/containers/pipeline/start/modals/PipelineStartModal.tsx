import { CAlert, CCol, CRow } from '@coreui/react'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { Node, useNodes } from '@xyflow/react'
import { useState } from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'
import {
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap'
import { PipelineTemplateResponse } from '../../../../actions/pipeline/model/pipeline-template-response'
import { getFormattedPipelineRequestElements } from '../../../../actions/pipeline/pipeline-util'
import { useCreateAndStartPipeline } from '../../../../actions/pipeline/pipeline_api'
import HelpButton from '../../../../components/HelpButton'
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

        startPipeline(pipeline)
        toggle()
    }

    return (
        <Modal size="md" isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Start Pipeline</ModalHeader>
            {!isPipelineValid && (
                <ModalBody>
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
                </ModalBody>
            )}

            {isPipelineValid && (
                <Form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmitPipeline(name, description, nodes, templateData)
                    }}
                >
                    <ModalBody>
                        <div>
                            <CRow className="justify-content-center">
                                <CCol sm="10">
                                    <FormGroup>
                                        <Label for="name" className="text-start">
                                            Name
                                        </Label>
                                        <HelpButton
                                            id={'pipeline-start-name'}
                                            text={
                                                'Give your pipeline a name so that you can identify it later.'
                                            }
                                        />
                                        <Input
                                            required
                                            defaultValue={name}
                                            onChange={(e) => setName(e.target.value)}
                                            type="text"
                                            name="name"
                                            id="name"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="description" className="text-start">
                                            Description
                                        </Label>
                                        <HelpButton
                                            id={'pipeline-start-desc'}
                                            text={
                                                'Give your pipeline a description so that you still know later what you started it for.'
                                            }
                                        />
                                        <Input
                                            defaultValue={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                            type="textarea"
                                            name="description"
                                            id="description"
                                            required
                                        />
                                    </FormGroup>
                                </CCol>
                            </CRow>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <IconButton
                            icon={faPlay}
                            type="submit"
                            text="Start Pipeline"
                            color="primary"
                            isTextLeft={false}
                            style={{ marginBottom: 20 }}
                        />
                    </ModalFooter>
                </Form>
            )}
        </Modal>
    )
}
