import { AxiosError } from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { showError, showSuccess } from '../../components/Notification'
import { httpClient } from '../http-client'

export const INFERENCE_MODEL_TASK_TYPE = {
  DETECTION: 0,
  SEGMENTATION: 1,
}

export const INFERENCE_MODEL_TYPE = {
  YOLO: 'YOLO',
  SAM: 'SAM',
}

export interface ModelsResponse {
  models: Model[]
}

export interface Model {
  id: number
  name: string
  displayName: string
  serverUrl: string
  taskType: number
  modelType: string
  description: null | string
  lastUpdated: Date
}

export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: () => httpClient.get<ModelsResponse>(`/models`),
    refetchOnWindowFocus: false,
  })
}

export interface TritonModelsResponse {
  models: string[]
}

export const useTritonModels = (serverUrl: string) => {
  return useQuery({
    queryKey: ['triton-models', serverUrl],
    queryFn: () =>
      httpClient.get<TritonModelsResponse>(`/triton/models?serverUrl=${serverUrl}`),
    refetchOnWindowFocus: false,
    enabled: false,
    onError: () => {
      showError('An error occurred while fetching models from Triton server')
    },
  })
}

export interface ServerLivenessResponse {
  isLive: boolean
}

export const useServerLiveness = (serverUrl: string) => {
  return useQuery({
    queryKey: ['triton-server-liveness', serverUrl],
    queryFn: () =>
      httpClient.get<ServerLivenessResponse>(`/triton/liveness?serverUrl=${serverUrl}`),
    refetchOnWindowFocus: false,
    enabled: false,
  })
}

export interface CreateInferenceModelRequest {
  name: string
  displayName: string
  serverUrl: string
  taskType: number
  modelType: string
  description: string
}

export const useCreateInferenceModel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInferenceModelRequest) => {
      return httpClient.post('/models', data)
    },
    onError: (err: AxiosError) => {
      if (
        err.response &&
        typeof err.response.data === 'object' &&
        (err.response.data as { message?: string })?.message
      ) {
        showError((err.response.data as { message: string }).message)
      } else {
        showError('An error occurred while creating the model entry')
      }
    },
    onSuccess: () => {
      showSuccess('Model entry created successfully')
      queryClient.invalidateQueries('models') // to refetch models
    },
  })
}

export const useDeleteInferenceModel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (modelId: number) => {
      return httpClient.delete(`/models/${modelId}`)
    },
    onError: (err: AxiosError) => {
      if (
        err.response &&
        typeof err.response.data === 'object' &&
        (err.response.data as { message?: string })?.message
      ) {
        showError((err.response.data as { message: string }).message)
      } else {
        showError('An error occurred while deleting the model entry')
      }
    },
    onSuccess: () => {
      showSuccess('Model entry deleted successfully')
      queryClient.invalidateQueries('models') // to refetch models
    },
  })
}

export const useInferenceModel = (modelId: number, enabled: boolean) => {
  return useQuery({
    queryKey: ['model', modelId],
    queryFn: () => httpClient.get<Model>(`/models/${modelId}`),
    refetchOnWindowFocus: false,
    enabled: enabled,
  })
}

export interface UpdateInferenceModelRequest {
  id: number
  name: string
  displayName: string
  serverUrl: string
  taskType: number
  modelType: string
  description: string
}

export const useUpdateInferenceModel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateInferenceModelRequest) => {
      return httpClient.put(`/models/${data.id}`, data)
    },
    onError: (err: AxiosError) => {
      if (
        err.response &&
        typeof err.response.data === 'object' &&
        (err.response.data as { message?: string })?.message
      ) {
        showError((err.response.data as { message: string }).message)
      } else {
        showError('An error occurred while updating the model entry')
      }
    },
    onSuccess: () => {
      showSuccess('Model entry updated successfully')
      queryClient.invalidateQueries('models') // to refetch models
    },
  })
}

export type PointPrompt = {
  x: number
  y: number
  label: 'positive' | 'negative'
}

export type BoxPrompt = {
  xMin: number
  yMin: number
  xMax: number
  yMax: number
}

export interface Prompts {
  points?: PointPrompt[] // optional list of points
  bbox?: BoxPrompt // optional list of boxes
}

export interface TritonInferenceRequest {
  imageId: number
  modelId: number
  prompts?: Prompts // optional prompts
}

export const useTritonInference = () => {
  return useMutation({
    mutationFn: (data: TritonInferenceRequest) => {
      return httpClient.post(`/triton/infer`, data)
    },
  })
}
