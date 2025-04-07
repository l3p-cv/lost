import { useMutation, useQuery, useQueryClient } from 'react-query'
import { showError, showSuccess } from '../../components/Notification'
import { httpClient } from '../http-client'

export const useAnnoTaskUser = (select) => {
    return useQuery({
        queryKey: ['annoTaskUser'],
        queryFn: () => httpClient.get(`/user/anno_task_user`),
        select,
    })
}

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => httpClient.get(`/user`),
    })
}

export const useCreateUser = () => {
    return useMutation({
        mutationFn: (payload) => httpClient.post(`/user`, payload),
        onSuccess: () => showSuccess('User created successfully'),
        onError: () => showError('Failed to create user'),
    })
}

export const useDeleteUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload) => httpClient.delete(`/user/${payload}`),
        onSuccess: (response, _, context) => {
            showSuccess('User deleted successfully')
            queryClient.invalidateQueries('users')
            // if a custom success handler exists, call it
            // @ts-expect-error this ts error can be ignored
            context?.onSuccess?.(response)
        },
        onError: () => showError('Failed to delete user'),
    })
}

export const useUpdateUser = () => {
    return useMutation({
        // @ts-expect-error add proper types later
        mutationFn: (payload) => httpClient.patch(`/user/${payload.idx}`, payload),
        onSuccess: (response, _, context) => {
            showSuccess('User updated successfully')

            // if a custom success handler exists, call it
            // @ts-expect-error this ts error can be ignored
            context?.onSuccess?.(response)
        },
        onError: () => showError('Failed to update user'),
    })
}

export const useOwnUser = () => {
    return useQuery({
        queryKey: ['ownUser'],
        queryFn: () => httpClient.get(`/user/self`),
    })
}

export const useUpdateOwnUser = () => {
    return useMutation({
        mutationFn: (payload: object) => httpClient.patch(`/user/self`, payload),
        onSuccess: () => showSuccess('User updated successfully'),
        onError: () => showError('Failed to update user'),
    })
}
