import { CContainer } from '@coreui/react'
import { Node, ReactFlowProvider } from '@xyflow/react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToggle } from 'react-use'
import { PipelineResponseElement } from '../../../actions/pipeline/model/pipeline-response'
import { usePipeline } from '../../../actions/pipeline/pipeline_api'
import BaseContainer from '../../../components/BaseContainer'
import { CenteredSpinner } from '../../../components/CenteredSpinner'
import { LivePipeline } from './LivePipeline'
import Modal from './modals'
import Toolbar from './Toolbar'

export const PipelineView = () => {
    const { pipelineId } = useParams()

    const { data, isLoading, isError } = usePipeline(pipelineId)
    const [modalData, setModalData] = useState<PipelineResponseElement | null>(null)
    const [isModalOpen, toggleModal] = useToggle(false)

    if (isLoading) {
        return <CenteredSpinner />
    }

    if (isError) {
        return <p>An error occurred when getting pipeline data!</p>
    }

    const handleNodeClick = (event, node: Node) => {
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
                <BaseContainer>
                    <div className="pipeline-running-2">
                        <Toolbar data={data} />
                        <ReactFlowProvider>
                            <LivePipeline
                                name={data.name}
                                initialNodes={data.graph.nodes}
                                initialEdges={data.graph.edges}
                                onNodeClick={handleNodeClick}
                            />
                            <Modal
                                data={modalData}
                                modalOpened={isModalOpen}
                                toggleModal={toggleModal}
                            />
                        </ReactFlowProvider>
                    </div>
                </BaseContainer>
            </CContainer>
        )
    )
}
