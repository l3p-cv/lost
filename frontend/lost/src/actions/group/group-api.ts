import { useMutation, useQuery, useQueryClient } from 'react-query'
import { showError, showSuccess } from '../../components/Notification'
import { httpClient } from '../http-client'

export const useGroups = (select?) => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => httpClient.get(`/group`),
    refetchOnWindowFocus: false,
    select,
  })
}

export const useCreateGroup = () => {
  return useMutation({
    mutationFn: (payload) => httpClient.post(`/group`, payload),
    onSuccess: () => showSuccess('Group created successfully'),
    onError: () => showError('Failed to create group'),
  })
}

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => httpClient.delete(`/group/${payload}`),
    onSuccess: () => {
      queryClient.invalidateQueries('groups')
      showSuccess('Group deleted successfully')
    },
    onError: () => showError('Failed to delete group'),
  })
}
