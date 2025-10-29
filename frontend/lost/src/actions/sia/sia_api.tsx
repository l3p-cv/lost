import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'
import { Label, Point } from 'lost-sia'
import { SiaImageRequest } from '../../types/SiaTypes'
import {
    LegacyAnnotation,
    LegacyAnnotationResponse,
} from '../../containers/Annotation/SIA/legacyHelper'

export type ImageData = {
    id: number
    number: number
    amount: number
    annoTime: number
    isFirst: boolean
    isLast: boolean
    labelIds: Label[]
    isJunk: boolean
    description: string | undefined
    imgActions: string[]
}

export type ImageSwitchData = {
    // sia api uses previous while dataset api uses prev
    direction: 'first' | 'next' | 'prev' | 'specificImage' | 'current'
    imageId: number | null
    iteration?: number | null
}

export type SiaAnnotationChangeRequest = {
    direction: 'next' | 'prev' | 'current'
    imageId: number
}

export type SiaResponse = {
    image: ImageData
    annotations: LegacyAnnotationResponse
}

type ImageEditData = {
    imgId: number
    imgActions: string[]
    annoTime: number
}

type ImageJunkData = {
    imgId: number
    annoTime: number
    isJunk: boolean
}

export type EditAnnotationData = {
    annotation: LegacyAnnotation
    imageEditData: ImageEditData
}

type PolygonData = {
    firstPolygon: LegacyAnnotation
    secondPolygon: LegacyAnnotation
}

export const useGetSiaAnnos = (annotationRequestData: SiaAnnotationChangeRequest) => {
    return useQuery(
        ['getsiaannos', annotationRequestData],
        () =>
            axios
                .get(
                    `${API_URL}/sia?direction=${annotationRequestData.direction}&lastImgId=${annotationRequestData.imageId}`,
                )
                .then((res): SiaResponse => res.data),
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

export const useGetSiaImage = (imageRequestData: SiaImageRequest) => {
    return useQuery(
        ['getsiaimage', imageRequestData],
        () =>
            axios
                .post(`${API_URL}/sia/image/${imageRequestData!.imageId}/filters`, {
                    filters: imageRequestData.appliedFilters,
                })
                .then((res) => res.data)
                .catch((error) => error.response.data),
        // @TODO fiters are skipped for now. Wait for backend implementation
        {
            // only fetch when imageId is available
            // request will automatically refetch when value changes
            enabled: !!imageRequestData?.imageId && imageRequestData?.imageId != -1,
            refetchOnWindowFocus: false,
        },
    )
}

export const useGetSiaPossibleLabels = () => {
    return useQuery(
        'getsiaPossibleLabels',
        () => axios.get(`${API_URL}/sia/label`).then((res): Label[] => res.data.labels),
        {
            refetchOnWindowFocus: false,
        },
    )
}

export const useGetSiaConfiguration = () => {
    return useQuery(
        'getsiaConfiguration',
        () => axios.get(`${API_URL}/sia/configuration`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
        },
    )
}

export const useCreateAnnotation = () => {
    return useMutation(({ annotation, imageEditData }: EditAnnotationData) => {
        const requestData = {
            action: 'annoCreated',
            anno: annotation,
            img: imageEditData,
        }

        return axios.patch(API_URL + `/sia`, requestData).then((res) => res.data)
    })
}

export const useEditAnnotation = () => {
    return useMutation(({ annotation, imageEditData }: EditAnnotationData) => {
        const requestData = {
            action: 'annoEdited',
            anno: annotation,
            img: imageEditData,
        }

        return axios.patch(API_URL + `/sia`, requestData).then((res) => res.data)
    })
}

export const useDeleteAnnotation = () => {
    return useMutation(({ annotation, imageEditData }: EditAnnotationData) => {
        const requestData = {
            action: 'annoDeleted',
            anno: annotation,
            img: imageEditData,
        }

        return axios.patch(API_URL + `/sia`, requestData).then((res) => res.data)
    })
}

export const useImageJunk = () => {
    return useMutation((imageJunkData: ImageJunkData) => {
        const requestData = {
            action: 'imgJunkUpdate',
            img: imageJunkData,
        }

        return axios.patch(API_URL + `/sia`, requestData).then((res) => res.data)
    })
}

export const useFinishAnnotask = () => {
    return useMutation(() => axios.post(API_URL + `/sia/finish`).then((res) => res.data))
}

export const usePolygonDifference = () => {
    return useMutation((polygonData: PolygonData) => {
        const requestData = {
            selectedPolygon: polygonData.firstPolygon,
            polygonModifiers: [polygonData.secondPolygon],
        }

        return axios
            .post(API_URL + `/sia/polygonOperations/difference`, requestData)
            .then((res) => res.data)
            .catch((error) => error.response.data)
    })
}

export const usePolygonIntersection = () => {
    return useMutation((polygonData: PolygonData) => {
        const requestData = {
            annotations: [polygonData.firstPolygon, polygonData.secondPolygon],
        }

        return axios
            .post(API_URL + `/sia/polygonOperations/intersection`, requestData)
            .then((res) => res.data)
            .catch((error) => error.response.data)
    })
}

export const usePolygonUnion = () => {
    return useMutation((polygonData: PolygonData) => {
        const requestData = {
            annotations: [polygonData.firstPolygon, polygonData.secondPolygon],
        }

        return axios
            .post(API_URL + `/sia/polygonOperations/union`, requestData)
            .then((res) => res.data)
            .catch((error) => error.response.data)
    })
}

export const useBBoxCreation = () => {
    return useMutation((points: Point[]) => {
        const requestData = {
            data: [points],
        }

        return axios
            .post(API_URL + `/sia/bboxFromPoints`, requestData)
            .then((res) => res.data)
            .catch((error) => error.response.data)
    })
}
