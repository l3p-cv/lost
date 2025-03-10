import { CAlert, CContainer } from '@coreui/react'
import { Node, ReactFlowProvider } from '@xyflow/react'
import { useState } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { useToggle } from 'react-use'
import { PipelineTemplateElement } from '../../../actions/pipeline/model/pipeline-template-response'
import { useTemplate } from '../../../actions/pipeline/pipeline_api'
import BaseContainer from '../../../components/BaseContainer'
import { CenteredSpinner } from '../../../components/CenteredSpinner'
import { NavRibbon } from './NavRibbon'
import { PipelineTemplate } from './PipelineTemplate'
import { NodeConfigModal } from './modals/NodeConfigModal'
import { SubmitPipelineModal } from './modals/SubmitPipelineModal'

export const TemplateView = () => {
    const navigate = useNavigate()
    const { templateId } = useParams()

    const { data, isLoading, isError } = useTemplate(templateId)
    const [modalData, setModalData] = useState<PipelineTemplateElement | null>(null)
    const [isModalOpen, toggleModal] = useToggle(false)

    const [isSubmitModalOpen, toggleSubmitModal] = useToggle(false)

    if (isLoading) {
        return <CenteredSpinner />
    }

    if (isError) {
        return <p>An error occurred when getting pipeline data!</p>
    }

    const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
        if (node.type === 'dataExportNode') {
            return
        }

        const clickedModalData = data?.elements.find(
            (el) => el.peN.toString() === node.id,
        )

        if (clickedModalData) {
            setModalData(clickedModalData)
            toggleModal()
        }
    }

    return (
        data && (
            <CContainer style={{ marginTop: '15px' }}>
                <NavRibbon
                    onBack={() => navigate('/pipeline-templates')}
                    onNext={toggleSubmitModal}
                ></NavRibbon>
                <BaseContainer>
                    <CAlert color="secondary" dismissible>
                        <div className="d-flex align-items-center">
                            <FaInfoCircle className="me-2" size={20} />
                            <p className="mb-0">
                                Configure your pipeline by setting up the{' '}
                                <span style={{ fontWeight: 'bolder', color: 'orange' }}>
                                    orange
                                </span>{' '}
                                elements. Click each node to complete its setup. Once all
                                are{' '}
                                <span style={{ fontWeight: 'bolder', color: 'green' }}>
                                    green
                                </span>
                                , you can name and describe your pipeline in the next
                                step.
                            </p>
                        </div>
                    </CAlert>

                    <div className="pipeline-start-2">
                        <ReactFlowProvider>
                            <PipelineTemplate
                                name={data.name}
                                initialNodes={data.graph.nodes}
                                initialEdges={data.graph.edges}
                                onNodeClick={handleNodeClick}
                            />
                            <NodeConfigModal
                                modalData={modalData}
                                modalOpened={isModalOpen}
                                toggleModal={toggleModal}
                                availableGroups={data.availableGroups}
                                availableLabelTrees={data.availableLabelTrees}
                            />
                            <SubmitPipelineModal
                                isOpen={isSubmitModalOpen}
                                toggle={toggleSubmitModal}
                            />
                        </ReactFlowProvider>
                    </div>
                </BaseContainer>
            </CContainer>
        )
    )
}
