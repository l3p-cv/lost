import axios from 'axios'
import { useMutation } from 'react-query'
import { API_URL } from '../../lost_settings'

export const useCreateAndStartPipeline = () => {
    return useMutation((pipelineData) => {
        return axios.post(`${API_URL}/pipeline/start`, pipelineData)
    })
}
