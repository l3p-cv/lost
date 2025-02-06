import { ReactFlowProvider } from '@xyflow/react'
import { PipelineDemo } from './PipelineDemo'

export const PipelineDemoWrapper = () => {
    return (
        <ReactFlowProvider>
            <PipelineDemo />
        </ReactFlowProvider>
    )
}
