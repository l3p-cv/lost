import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'
import { Point } from 'lost-sia'
import { SiaImageRequest } from '../../types/SiaTypes'
import { LegacyAnnotation } from '../../containers/Annotation/SIA/legacyHelper'

type ImageEditData = {
    imgId: number
    imgActions: string
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

export const useGetSiaAnnos = (annotationRequestData) => {
    return useQuery(
        ['getsiaannos', annotationRequestData],
        () =>
            axios
                .get(
                    `${API_URL}/sia?direction=${annotationRequestData.direction}&lastImgId=${annotationRequestData.imageId}`,
                )
                .then((res) => res.data),
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
        () => axios.get(`${API_URL}/sia/label`).then((res) => res.data.labels),
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
