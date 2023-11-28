import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'

export const useReview = () => {
    return useMutation((requestArguments) => {

        // destructure arguments array (useMutation only accepts one data parameter)
        const [datasetId, data] = requestArguments
        return axios.post(`${API_URL}/datasets/${datasetId}/review`, data).then((res) => res.data)
    }
    )
}

export const useReviewOptions = () => {
    return useQuery(
        ['datasets'],
        () => axios.get(`${API_URL}/datasets/1/reviewOptions`).then((res) => res.data),
        {
            initialData: [],
        },
    )
}

export const useGetImage = () => {
    return useMutation((imageId) => {
        const data = {
            type: 'imageBased',
            id: imageId
        }

        return axios.post(`${API_URL}/data/getImage`, data).then((res) => res.data)
    }
    )
}

export const useGetAnnotations = () => {
    return useMutation((datasetId, annotationId) =>
        axios.post(`${API_URL}/datasets/${datasetId}/review`, annotationId).then((res) => res.data),
    )
}

export const useUpdateAnnotations = () => {
    return useMutation((requestData) => {
        const [datasetId, annotaskId, annotations] = requestData

        const parameters = {
            annotaskId,
            annotations
        }

        return axios.post(`${API_URL}/datasets/${datasetId}/review/updateAnnotations`, parameters)
            .then((res) => res.data)
            .catch((error) => error)
    })
}

export const useGetUIConfig = () => {

    const uiConfigJson = localStorage.getItem('sia-ui-config')
    const uiConfig = JSON.parse(uiConfigJson)

    return uiConfig
}
