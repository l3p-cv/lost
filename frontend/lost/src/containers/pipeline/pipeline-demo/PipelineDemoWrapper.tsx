import { ReactFlowProvider } from '@xyflow/react'
import { LivePipeline } from '../running/LivePipeline'

export const PipelineDemoWrapper = () => {
    return (
        <ReactFlowProvider>
            <LivePipeline />
        </ReactFlowProvider>
    )
}
