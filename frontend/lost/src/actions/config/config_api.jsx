import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'

export const useConfig = () => {
    return useQuery(
        ['config'],
        () => axios.get(`${API_URL}/config`).then((res) => res.data),
        {
            initialData: [],
        },
    )
}

export const useSaveConfig = () => {
    return useMutation((data) =>
        axios.post(`${API_URL}/config`, data).then((res) => res.data),
    )
}
