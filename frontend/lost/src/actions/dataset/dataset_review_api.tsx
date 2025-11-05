import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'

import { uiConfig, SIA_INITIAL_UI_CONFIG } from 'lost-sia/utils'

import {
    EditAnnotationData,
    EditAnnotationResponse,
    ImageData,
    ImageLabelData,
} from '../sia/sia_api'
import { LegacyAnnotationResponse } from '../../containers/Annotation/SIA/legacyHelper'
import { Label } from 'lost-sia'

export type SiaDatasetResponse = {
    image: ImageData
    annotations: LegacyAnnotationResponse
    current_annotask_idx: number
}

type DatasetImageSwitchData = {
    direction: 'first' | 'next' | 'prev' | 'specificImage' | 'current'
    imageAnnoId: number | null
    iteration: number | null | undefined
}

export type ReviewData = {
    isAnnotaskReview: boolean
    taskId: number
    data: DatasetImageSwitchData
}

export const useReview = (annotationRequestData: ReviewData) => {
    return useQuery(
        ['getsiareviewannos', annotationRequestData],
        () => {
            const { isAnnotaskReview, taskId, data } = annotationRequestData
            const reviewType: string = isAnnotaskReview ? 'annotasks' : 'datasets'

            return axios
                .post(`${API_URL}/${reviewType}/${taskId}/review`, data)
                .then((res): SiaDatasetResponse => res.data)
        },
        {
            // only fetch when annotationRequestData is available
            // request will automatically refetch when value changes
            enabled: !!annotationRequestData,
            refetchOnWindowFocus: false,
            cacheTime: 0,
            staleTime: 0,
        },
    )
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

export const useCreateAnnotation = () => {
    return useMutation(
        ({ annoTaskId, annotation, imageEditData }: EditAnnotationData) => {
            const requestData = {
                action: 'annoCreated',
                anno: annotation,
                img: imageEditData,
            }

            return axios
                .patch(API_URL + `/annotasks/${annoTaskId}/annotation`, requestData)
                .then((res): EditAnnotationResponse => res.data)
        },
    )
}

export const useEditAnnotation = () => {
    return useMutation(
        ({ annoTaskId, annotation, imageEditData }: EditAnnotationData) => {
            const requestData = {
                action: 'annoEdited',
                anno: annotation,
                img: imageEditData,
            }

            return axios
                .patch(API_URL + `/annotasks/${annoTaskId}/annotation`, requestData)
                .then((res): EditAnnotationResponse => res.data)
        },
    )
}

export const useDeleteAnnotation = () => {
    return useMutation(
        ({ annoTaskId, annotation, imageEditData }: EditAnnotationData) => {
            const requestData = {
                action: 'annoDeleted',
                anno: annotation,
                img: imageEditData,
            }

            return axios
                .patch(API_URL + `/annotasks/${annoTaskId}/annotation`, requestData)
                .then((res): EditAnnotationResponse => res.data)
        },
    )
}

export const useGetUIConfig = () => {
    // insert default config if no config in storage (first run)
    if (localStorage.getItem('sia-ui-config') === null) {
        localStorage.setItem('sia-ui-config', JSON.stringify(SIA_INITIAL_UI_CONFIG))
    }

    return uiConfig
}

export type ImageSearchRequestData = {
    id: number
    query: string
    selectedFilterLabels: number[]
}

export const useImageSearch = (isAnnotaskReview) => {
    const reviewType = isAnnotaskReview ? 'annotasks' : 'datasets'

    return useMutation((requestData: ImageSearchRequestData) => {
        // annotaskId task or datasetId (depends on review mode)
        const { id, query, selectedFilterLabels } = requestData

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

const useGetPossibleLabels = (annoTaskId: number) => {
    return useQuery(
        ['getsiaReviewPossibleLabels', annoTaskId],
        () =>
            axios
                .get(`${API_URL}/annotasks/${annoTaskId}/review/labels`)
                .then((res): Label[] => res.data.labels),
        {
            refetchOnWindowFocus: false,
            enabled: !!annoTaskId && annoTaskId > 0,
        },
    )
}

export const useGetDatasetPossibleLabels = (datasetId) => {
    return useQuery(
        ['useGetPossibleLabels'],
        () =>
            axios
                .get(`${API_URL}/datasets/${datasetId}/review/possibleLabels`)
                .then((res): Label[] => res.data),
        {
            refetchOnWindowFocus: false,
            enabled: false,
        },
    )
}

export const useUpdateImageLabel = () => {
    return useMutation((imageEditData: ImageLabelData) => {
        const requestData = {
            action: 'imgLabelUpdate',
            img: imageEditData,
        }

        return axios.patch(API_URL + `/sia`, requestData).then((res) => res.data)
    })
}

export default {
    useCreateAnnotation,
    useEditAnnotation,
    useDeleteAnnotation,
    useGetPossibleLabels,
    useUpdateImageLabel,
}
