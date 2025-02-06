import { useParams } from 'react-router-dom'
import { usePipeline } from '../../../actions/pipeline/pipeline_api'

export const PipelineView = () => {
    const { pipelineId } = useParams()

    const { data, isLoading, isError } = usePipeline(pipelineId)

    return <p>Testing...</p>
}
