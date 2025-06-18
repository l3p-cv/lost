import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'

import { uiConfig, SIA_INITIAL_UI_CONFIG } from 'lost-sia/utils'

export const useReview = (isAnnotaskReview) => {
    return useMutation((requestArguments) => {
        const reviewType = isAnnotaskReview ? 'annotasks' : 'datasets'

        // destructure arguments array (useMutation only accepts one data parameter)
        // annotaskId task or datasetId (depends on review mode)
        const [id, data] = requestArguments
        return axios
            .post(`${API_URL}/${reviewType}/${id}/review`, data)
            .then((res) => res.data)
    })
}

export const useReviewOptions = () => {
    return useMutation((annotaskId) => {
        return axios
            .get(`${API_URL}/annotasks/${annotaskId}/review/options`)
            .then((res) => res.data)
    })
}

export const useGetImage = () => {
    return useMutation((imageId) => {
        const data = {
            type: 'imageBased',
            id: imageId,
        }

        return axios
            .get(
                `${API_URL}/data/image/${data['id']}?addContext=${data['addContext']}&drawAnno=${data['drawAnno']}&type=${data['type']}`,
            )
            .then((res) => res.data)
    })
}

export const useGetAnnotations = () => {
    return useMutation((datasetId, annotationId) =>
        axios
            .post(`${API_URL}/datasets/${datasetId}/review`, annotationId)
            .then((res) => res.data),
    )
}

export const useUpdateAnnotation = () => {
    return useMutation((requestData) => {
        const [annotaskId, annotationData] = requestData

        return axios
            .patch(`${API_URL}/annotasks/${annotaskId}/annotation`, annotationData)
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
        const [id, query, selectedFilterLabels] = requestData
        return axios
            .get(
                `${API_URL}/${reviewType}/${id}/review/images?filter=${query}&labels=${selectedFilterLabels}`,
            )
            .then((res) => {
                if (res.status !== 200 || res.data === undefined) return []
                return res.data.images
            })
    })
}

export const useGetPossibleLabels = (datasetId) => {
    return useQuery(
        ['useGetPossibleLabels'],
        () =>
            axios
                .get(`${API_URL}/datasets/${datasetId}/review/possibleLabels`)
                .then((res) => res.data),
        {
            refetchOnWindowFocus: false,
            enabled: false,
        },
    )
}
