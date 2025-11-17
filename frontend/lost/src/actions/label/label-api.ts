import { AxiosError } from 'axios'
import { saveAs } from 'file-saver'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { showError, showSuccess } from '../../components/Notification'
import { httpClient } from '../http-client'
import { LabelTreesResponse } from './label-trees-response'

export const useUpdateLabel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data, visLevel }: { data: unknown; visLevel: string }) => {
      return httpClient.patch(`/label/${visLevel}`, data)
    },
    onSuccess: () => {
      showSuccess('Label updated successfully')
      queryClient.invalidateQueries('labelTrees') // to refetch label trees
    },
    onError: () => {
      showError('Failed to update label')
    },
  })
}

export interface CreateLabelResponse {
  message: string
  labelId: number
}

export const useCreateLabel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data, visLevel }: { data: unknown; visLevel: string }) => {
      return httpClient.post<CreateLabelResponse>(`/label/${visLevel}`, data)
    },
    onSuccess: (response, variables, context) => {
      showSuccess(`Label id ${response.labelId} created successfully`)
      queryClient.invalidateQueries('labelTrees') // to refetch label trees
      localStorage.setItem('newlyCreatedLabelTreeId', response.labelId.toString())

      // if a custom success handler exists, call it
      // @ts-expect-error this ts error can be ignored
      context?.onSuccess?.(response)
    },
    onError: () => {
      showError('Failed to create label')
    },
  })
}

export const useImportLabelTree = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, visLevel }: { file: Blob; visLevel: string }) => {
      const formData = new FormData()
      formData.append('file', file)

      return httpClient.post(`/label/tree/${visLevel}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    onSuccess: () => {
      showSuccess('Label tree created successfully')
      queryClient.invalidateQueries('labelTrees') // to refetch label trees
    },
    onError: (err: AxiosError) => {
      if (
        err.response &&
        typeof err.response.data === 'object' &&
        (err.response.data as { error?: string })?.error
      ) {
        showError((err.response.data as { error: string }).error)
      } else {
        showError('Failed to create label tree')
      }
    },
  })
}

export const useDeleteLabel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (labelId: string) => {
      return httpClient.delete(`/label/${labelId}`)
    },
    onSuccess: (response, variables, context) => {
      showSuccess('Label deleted successfully')
      queryClient.invalidateQueries('labelTrees') // to refetch label trees

      // @ts-expect-error this ts error can be ignored
      context?.onSuccess?.(response)
    },
    onError: () => {
      showError('Failed to delete label')
    },
  })
}

export const useGetLabelTrees = (visLevel: string) => {
  return useQuery({
    queryFn: () => {
      return httpClient.get<LabelTreesResponse>(`/label/tree/${visLevel}`)
    },
    queryKey: ['labelTrees', visLevel],
  })
}

export interface ExportLabelResponse {
  blob: Blob
  labelLeafId: number
}

export const useExportLabelTree = () => {
  return useMutation({
    mutationFn: async (labelLeafId: number) => {
      const blobData = await httpClient.get<Blob>(`/label/${labelLeafId}/export`, {
        responseType: 'blob',
      })

      return { blob: blobData, labelLeafId }
    },
    onSuccess: ({ blob, labelLeafId }) => {
      const labelName = `label_tree_${labelLeafId}`
      saveAs(blob, `${labelName}.csv`)
    },
    onError: (error) => {
      showError('Failed to export label tree')
      console.error('Error exporting label tree:', error)
    },
  })
}
