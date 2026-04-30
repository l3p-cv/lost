import axios, { AxiosError } from 'axios'
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from 'react-query'
import { API_URL } from '../lost_settings'
import { showError } from '../components/Notification'
import {
  LegacyAnnotation,
  LegacyAnnotationResponse,
} from '../containers/Annotation/SIA/legacyHelper'
import { useQueryClient } from 'react-query'
import { UpdateMiaPayload, GoBackPayload } from '../types/MiaTypes'

export type MiaApi = {
  useGetPossibleLabels: (annoTaskId: number) => UseQueryResult
  useCreateAnnotation: () => UseMutationResult<
    EditAnnotationResponse,
    AxiosError,
    EditAnnotationData
  >
  useEditAnnotation: () => UseMutationResult<
    EditAnnotationResponse,
    AxiosError,
    EditAnnotationData
  >
  useDeleteAnnotation: () => UseMutationResult<
    EditAnnotationResponse,
    AxiosError,
    EditAnnotationData
  >
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

export type MiaAnnotationChangeRequest = {
  direction: 'next' | 'prev' | 'current'
  imageId: number
}

export type MiaImageRequest = {
  imageId: number
  addContext: number
  drawAnno: boolean
  type: string
}

export type MiaAnnosResponse = {
  images: ImageData[]
  proposedLabel?: number
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

export const useGetMiaAnnos = (maxAmount: number) => {
  return useQuery(
    ['miaAnnos', maxAmount],
    async () => {
      const { data } = await axios.get(`${API_URL}/mia/next/${maxAmount}`)
      return data
    },
    {
      enabled: !!maxAmount,
      refetchOnWindowFocus: false,
    },
  )
}

export const useGetSpecialMiaAnnos = (miaIds) => {
  return useQuery(
    ['miaSpecialAnnos', miaIds],
    async () => {
      const { data } = await axios.get(`${API_URL}/mia/special/${miaIds}`)
      return data
    },
    {
      enabled: !!miaIds,
      refetchOnWindowFocus: false,
    },
  )
}

export const useGetMiaImage = (imageRequestData) => {
  return useQuery(
    ['miaimage', imageRequestData],
    () =>
      axios
        .get(`${API_URL}/data/image/${imageRequestData.imageId}`, {
          params: {
            addContext: imageRequestData.addContext,
            drawAnno: imageRequestData.drawAnno,
            type: imageRequestData.type,
          },
        })
        .then((res) => res.data),
    {
      enabled: imageRequestData?.imageId != null && imageRequestData.imageId !== -1,
      staleTime: 0,
    },
  )
}

export const useGetMiaLabel = () => {
  return useQuery({
    queryKey: ['miaLabel'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/mia/label`)
      return data
    },
    refetchOnWindowFocus: false,
  })
}

export const useFinishMia = () => {
  return useMutation({
    mutationFn: async () => {
      return axios.get(`${API_URL}/mia/finish`)
    },
  })
}

export const useUpdateMia = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, UpdateMiaPayload>({
    mutationFn: async (data) => {
      await axios.patch(`${API_URL}/mia`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['miaAnnos'])
      queryClient.invalidateQueries(['currentannotask'])
      queryClient.invalidateQueries(['miaimage'])
    },
    onError: () => showError('Failed to save annotation.'),
  })
}

export const useGoBackMia = () => {
  const queryClient = useQueryClient()

  return useMutation<MiaAnnosResponse, Error, GoBackPayload>({
    mutationFn: async (payload: GoBackPayload) => {
      const url = new URL(`${API_URL}/mia/prev`)
      url.searchParams.append('currentChunkId', String(payload.currentChunkId))
      payload.currentUpdateIds?.forEach((id) => {
        url.searchParams.append('currentUpdateIds', String(id))
      })
      const { data } = await axios.get(url.toString())
      return data
    },
    onSuccess: (data, payload) => {
      queryClient.setQueryData(['miaAnnos', payload.maxAmount], data)
    },
  })
}

export const useGoToFirstMIA = () => {
  const queryClient = useQueryClient()

  return useMutation<MiaAnnosResponse, Error, number>({
    mutationFn: async () => {
      const { data } = await axios.get(`${API_URL}/mia/first`, {
        headers: { 'Content-Type': 'application/json' },
      })
      return data
    },
    onSuccess: (data, maxAmount) => {
      queryClient.setQueryData(['miaAnnos', maxAmount], data)
    },
  })
}

export const useGoToLatestMIA = () => {
  const queryClient = useQueryClient()

  return useMutation<MiaAnnosResponse, Error, number>({
    mutationFn: async () => {
      const { data } = await axios.get(`${API_URL}/mia/latest`, {
        headers: { 'Content-Type': 'application/json' },
      })
      return data
    },
    onSuccess: (data, maxAmount) => {
      queryClient.setQueryData(['miaAnnos', maxAmount], data)
    },
  })
}
