import { useMutation, useQuery } from 'react-query'
import { httpClient } from '../http-client'
import { PipelineResponse } from './types/pipeline-response'

export const useCreateAndStartPipeline = () => {
    return useMutation({
        mutationFn: (pipelineData) => {
            return httpClient.post('/pipeline/start', pipelineData)
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

export const usePipeline = (id) => {
    return useQuery({
        queryKey: ['pipeline', id],
        queryFn: () => httpClient.get<PipelineResponse>(`/pipeline/${id}`),
        refetchOnWindowFocus: false,
    })
}
