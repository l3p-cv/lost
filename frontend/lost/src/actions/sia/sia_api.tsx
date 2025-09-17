import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'
import { Annotation } from 'lost-sia/models'

type ImageEditData = {
    imgId: number
    imgActions: string
    annoTime: number
}

type editAnnotationData = {
    annotation: Annotation
    imageEditData: ImageEditData
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

export const useGetSiaImage = (imageId) => {
    return useQuery(
        ['getsiaimage', imageId],
        () =>
            axios
                .get(`${API_URL}/data/image/${imageId}?type=imageBased`)
                .then((res) => res.data),
        {
            // only fetch when imageId is available
            // request will automatically refetch when value changes
            enabled: !!imageId,
            refetchOnWindowFocus: false,
        },
    )
}

export const useCreateAnnotation = () => {
    return useMutation(({ annotation, imageEditData }: editAnnotationData) => {
        const requestData = {
            action: 'annoCreated',
            anno: annotation,
            img: imageEditData,
        }

        return axios.patch(API_URL + `/sia`, requestData).then((res) => res.data)
    })
}

export const useEditAnnotation = () => {
    return useMutation(({ annotation, imageEditData }: editAnnotationData) => {
        const requestData = {
            action: 'annoEdited',
            anno: annotation,
            img: imageEditData,
        }

        return axios.patch(API_URL + `/sia`, requestData).then((res) => res.data)
    })
}
