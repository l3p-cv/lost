import axios from 'axios'
import { useMutation } from 'react-query'
import { API_URL } from '../../lost_settings'
import { uiConfig, SIA_INITIAL_UI_CONFIG } from '../../containers/Annotation/SIA/lost-sia/src/utils/uiConfig'

export const useReview = (isAnnotaskReview) => {
    return useMutation((requestArguments) => {

        const reviewType = isAnnotaskReview ? 'annotasks' : 'datasets'

        // destructure arguments array (useMutation only accepts one data parameter)
        // annotaskId task or datasetId (depends on review mode)
        const [id, data] = requestArguments
        return axios.post(`${API_URL}/${reviewType}/${id}/review`, data).then((res) => res.data)
    })
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
        const [annotaskId, annotationData] = requestData

        return axios.post(`${API_URL}/annotasks/${annotaskId}/updateAnnotation`, annotationData)
            .then((res) => [true, res.data])
            .catch((error) => [false, error])
    })
}

export const useGetUIConfig = () => {

    // insert default config if no config in storage (first run)
    if (localStorage.getItem('sia-ui-config') === null) {
        localStorage.setItem('sia-ui-config', JSON.stringify(SIA_INITIAL_UI_CONFIG))
    }

    return uiConfig
}

export const useImageSearch = (isAnnotaskReview) => {
    const reviewType = isAnnotaskReview ? 'annotasks' : 'datasets'

    return useMutation((requestData) => {
        // annotaskId task or datasetId (depends on review mode)
        const [id, query] = requestData
        const payload = {
            filter: query
        }
        return axios.post(`${API_URL}/${reviewType}/${id}/review/searchImage`, payload)
    })
}
