import axios from 'axios'
import { useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'

export const useDatasets = () => {
    return useQuery(
        ['datasets'],
        () => axios.get(`${API_URL}/datasets`).then((res) => res.data),
        {
            initialData: [],
        },
    )
}

export const useDatastoreKeys = () => {
    return useQuery(
        ['datastoresKey'],
        () => axios.get(`${API_URL}/data/datastoresKey`).then((res) => res.data),
        {
            initialData: [],
        },
    )
}
