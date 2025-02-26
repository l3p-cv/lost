import { useMutation, useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { showError, showSuccess } from '../../components/Notification'
import { httpClient } from '../http-client'
import { PipelineResponse } from './model/pipeline-response'
import { parseLiveElementsToReactFlow } from './pipeline-util'

export const useCreateAndStartPipeline = () => {
    const navigate = useNavigate()
    return useMutation({
        mutationFn: (pipelineData) => {
            return httpClient.post('/pipeline/start', pipelineData)
        },
        onError: () => {
            showError('An error occurred when creating and starting the pipeline')
        },
        onSuccess: () => {
            showSuccess('Pipeline created and started successfully')
            navigate('/pipelines')
        },
    })
}

export const usePipelines = () => {
    return useQuery({
        queryFn: () => httpClient.get(`pipeline`),
        queryKey: ['pipelines'],
        onError: () => {
            console.error('An error occurred when fetching pipeline data')
        },
        refetchInterval: 3000,
    })
}

export const useTemplates = (visLevel) => {
    return useQuery({
        queryKey: ['templates', visLevel],
        queryFn: () => httpClient.get(`/pipeline/template/${visLevel}`),
        refetchOnWindowFocus: false,
    })
}

const transformPipelineData = (pipelineData: PipelineResponse) => {
    const { nodes, edges } = parseLiveElementsToReactFlow(pipelineData.elements)
    return {
        ...pipelineData,
        graph: {
            nodes,
            edges,
        },
    }
}

export const usePipeline = (
    id,
    options: { refetchInterval?: number } = { refetchInterval: 5000 },
) => {
    return useQuery({
        queryKey: ['pipeline', id],
        queryFn: () => httpClient.get<PipelineResponse>(`/pipeline/${id}`),
        refetchOnWindowFocus: false,
        select: transformPipelineData,
        refetchInterval: options.refetchInterval,
    })
}

export const useUpdatePipelineArguments = () => {
    return useMutation({
        mutationFn: (data: { elementId: string; updatedArguments: unknown }) => {
            const { elementId, updatedArguments } = data
            return httpClient.post(`/pipeline/updateArguments`, {
                elementId,
                updatedArguments,
            })
        },
        onError: () => {
            showError('An error occurred when updating pipeline arguments')
        },
        onSuccess: () => {
            showSuccess('Pipeline arguments updated successfully')
        },
    })
}
