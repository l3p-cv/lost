import axios from 'axios'
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from 'react-query'
import { API_URL } from '../../lost_settings'
import { Label } from 'lost-sia'
import { SiaImageRequest } from '../../types/SiaTypes'
import {
  LegacyAnnotation,
  LegacyAnnotationResponse,
} from '../../containers/Annotation/SIA/legacyHelper'

export type SiaApi = {
  useGetPossibleLabels: (annoTaskId: number) => UseQueryResult
  useCreateAnnotation: () => UseMutationResult
  useEditAnnotation: () => UseMutationResult
  useDeleteAnnotation: () => UseMutationResult
  useUpdateImageLabel: () => UseMutationResult
}

export type ImageData = {
  id: number
  number: number
  amount: number
  annoTime: number
  isFirst: boolean
  isLast: boolean
  labelIds: number[]
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

export type ImageEditData = {
  imgId: number
  imgActions: string[]
  annoTime: number
}

export type ImageLabelData = {
  imgId: number
  imgActions: string[]
  annoTime: number
  imgLabelChanged: boolean
  imgLabelIds: number[]
}

type ImageJunkData = {
  imgId: number
  annoTime: number
  isJunk: boolean
}

export type EditAnnotationData = {
  annoTaskId: number // annotaskId or datasetId
  annotation: LegacyAnnotation
  imageEditData: ImageEditData
}

export type EditAnnotationResponse = {
  tempId: string
  dbId: number
  newStatus: string
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

// current backend does not use the annotaskId
// keep it here for compliance reasons (the dataset review api needs it)
export const useGetPossibleLabels = (annoTaskId: number) => {
  return useQuery(
    ['getsiaPossibleLabels', annoTaskId],
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

    return axios
      .patch(API_URL + `/sia`, requestData)
      .then((res): EditAnnotationResponse => res.data)
  })
}

export const useEditAnnotation = () => {
  return useMutation(({ annotation, imageEditData }: EditAnnotationData) => {
    const requestData = {
      action: 'annoEdited',
      anno: annotation,
      img: imageEditData,
    }

    return axios
      .patch(API_URL + `/sia`, requestData)
      .then((res): EditAnnotationResponse => res.data)
  })
}

export const useDeleteAnnotation = () => {
  return useMutation(({ annotation, imageEditData }: EditAnnotationData) => {
    const requestData = {
      action: 'annoDeleted',
      anno: annotation,
      img: imageEditData,
    }

    return axios
      .patch(API_URL + `/sia`, requestData)
      .then((res): EditAnnotationResponse => res.data)
  })
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

// default export that is compliant with the various SIA types (annotation, annotask review, dataset review)
export default {
  useCreateAnnotation,
  useEditAnnotation,
  useDeleteAnnotation,
  useGetPossibleLabels,
  useUpdateImageLabel,
}
