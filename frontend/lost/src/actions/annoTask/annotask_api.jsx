import axios from 'axios'
import { API_URL } from '../../lost_settings'
import { useMutation } from 'react-query'

export const useWorkingAnnotask = () => {
    return useMutation(() =>
        axios.get(`${API_URL}/annotask/working`).then((res) => res.data),
    )
}
