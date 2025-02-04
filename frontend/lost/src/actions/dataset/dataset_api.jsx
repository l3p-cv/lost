import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
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

export const useFlatDatasets = () => {
    return useQuery(
        ['datasetsFlat'],
        () => axios.get(`${API_URL}/datasets/flat`).then((res) => res.data),
        {
            initialData: [],
        },
    )
}

export const useDatastoreKeys = () => {
    return useQuery(
        ['datastoresKey'],
        () => axios.get(`${API_URL}/data/storeKeys`).then((res) => res.data),
        {
            initialData: [],
        },
    )
}

export const useCreateDataset = () => {
    return useMutation((data) =>
        axios
            .post(`${API_URL}/datasets`, data)
            .then((res) => [true, res.data])
            .catch((error) => [false, error.response]),
    )
}

export const useUpdateDataset = () => {
    return useMutation((data) =>
        axios
            .patch(`${API_URL}/datasets`, data)
            .then((res) => [true, res.data])
            .catch((error) => [false, error.response]),
    )
}

export const useDeleteDataset = () => {
    return useMutation((datasetId) =>
        axios
            .delete(`${API_URL}/datasets/${datasetId}`)
            .then((res) => [true, res.data])
            .catch((error) => [false, error.response]),
    )
}
