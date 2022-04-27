import axios from 'axios'
import { API_URL } from '../../lost_settings'
import { useMutation } from 'react-query'

export const useUpdateConfig = () => {
    return useMutation((data) =>
        axios
            .post(`${API_URL}/annotask/update_config/${data.annotaskId}`, {
                configuration: data.configuration,
            })
            .then((res) => res.data),
    )
}
