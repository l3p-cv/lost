import axios from 'axios'
import { API_URL } from '../../lost_settings'
import { useMutation } from 'react-query'

export const usePersonalStatistics = () => {
    return useMutation(() =>
        axios.get(`${API_URL}/statistics/personal`).then((res) => res.data),
    )
}

export const useDesignerStatistics = () => {
    return useMutation(() =>
        axios.get(`${API_URL}/statistics/designer`).then((res) => res.data),
    )
}
