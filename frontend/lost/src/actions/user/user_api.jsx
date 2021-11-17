import axios from 'axios'
import { API_URL } from '../../lost_settings'
import { useMutation } from 'react-query'

export const useSelfUserInformation = () => {
    return useMutation(() =>
        axios.get(`${API_URL}/user/self`).then((res) => res.data),
    )
}
