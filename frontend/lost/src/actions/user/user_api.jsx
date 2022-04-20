import axios from 'axios'
import { API_URL } from '../../lost_settings'
import { useQuery } from 'react-query'

export const useAnnotaskUser = () => {
    return useQuery(
        ['annoTaskUser'],
        () => axios.get(`${API_URL}/user/anno_task_user`).then((res) => res.data.users),
        {
            initialData: [],
        },
    )
}
