import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'

export const useCreateAndStartPipeline = () => {
    return useMutation((pipelineData) => {
        return axios.post(`${API_URL}/pipeline/start`, pipelineData)
    })
}

export const usePipelines = (isPolling = true) => {
    return useQuery({
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/pipeline`)
            return data
        },
        queryKey: ['pipelines'],
        onError: () => {
            console.error('An error occurred when fetching pipeline data')
        },
        refetchInterval: isPolling ? 2000 : false, // Poll every 2 seconds if isPolling is true
    })
}

const fetchTemplates = async (visLevel) => {
    const response = await axios.get(`${API_URL}/pipeline/template/${visLevel}`)
    return response.data
}

export const useTemplates = (visLevel) => {
    return useQuery({
        queryKey: ['templates', visLevel],
        queryFn: () => fetchTemplates(visLevel),
        refetchOnWindowFocus: false,
    })
}
