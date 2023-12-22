import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'
import { uiConfig, SIA_INITIAL_UI_CONFIG } from '../../containers/Annotation/SIA/lost-sia/src/utils/uiConfig'

export const useReview = () => {
    return useMutation((requestArguments) => {

        // destructure arguments array (useMutation only accepts one data parameter)
        const [datasetId, data] = requestArguments
        return axios.post(`${API_URL}/datasets/${datasetId}/review`, data).then((res) => res.data)
    }
    )
}

export const useReviewOptions = () => {
    return useMutation((annotaskId) => {
        return axios.get(`${API_URL}/sia/reviewoptionsAnnotask/${annotaskId}`).then((res) => res.data)
    })
}

export const useGetImage = () => {
    return useMutation((imageId) => {
        const data = {
            type: 'imageBased',
            id: imageId
        }

        return axios.post(`${API_URL}/data/getImage`, data).then((res) => res.data)
    })
}

export const useGetAnnotations = () => {
    return useMutation((datasetId, annotationId) =>
        axios.post(`${API_URL}/datasets/${datasetId}/review`, annotationId).then((res) => res.data),
    )
}

export const useUpdateAnnotation = () => {
    return useMutation((requestData) => {
        // returns [isSuccessful (bool), data (Object)]
        return axios.post(`${API_URL}/sia/updateOneThing`, requestData)
            .then((res) => [true, res.data])
            .catch((error) => [false, error])
    })
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

    // insert default config if no config in storage (first run)
    if (localStorage.getItem('sia-ui-config') === null) {
        localStorage.setItem('sia-ui-config', JSON.stringify(SIA_INITIAL_UI_CONFIG))
    }

    return uiConfig
}
