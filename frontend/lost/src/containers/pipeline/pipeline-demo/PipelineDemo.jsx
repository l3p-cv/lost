import { ReactFlow, Controls, Background } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

export const PipelineDemo = () => {
    return (
        <div style={{ height: '90vh', width: '100%' }}>
            <ReactFlow>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    )
}
