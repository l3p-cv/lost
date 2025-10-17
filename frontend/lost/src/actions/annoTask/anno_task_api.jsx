import axios from 'axios'
import { API_URL } from '../../lost_settings'
import { useMutation, useQuery } from 'react-query'
import { showError, showSuccess } from '../../components/Notification'

export const useUpdateConfig = () => {
    return useMutation((data) =>
        axios
            .put(`${API_URL}/annotasks/${data.annotaskId}/config`, {
                configuration: data.configuration,
            })
            .then((res) => res.data),
    )
}

export const useGetStorageSettings = (annoTaskId) => {
    return useQuery(['annoDataStorageSettings'], () =>
        axios
            .get(`${API_URL}/annotasks/${annoTaskId}/storage_settings`)
            .then((res) => res.data),
    )
}

export const useUpdateStorageSettings = () => {
    return useMutation((data) =>
        axios
            .patch(`${API_URL}/annotasks/${data.annotaskId}/storage_settings`, data)
            .then((res) => res),
    )
}

export const useUpdateInstruction = () => {
    return useMutation(
        (data) =>
            axios
                .patch(`${API_URL}/annotasks/${data.annotaskId}/instruction`, data)
                .then((res) => res.data.message),
        {
            onSuccess: (message) => {
                showSuccess('Instruction successfully saved!')
            },
            onError: (error) => {
                showError('An error occurred while saving the instruction.')
            },
        },
    )
}

export const useGetCurrentAnnotask = () => {
    return useQuery(
        ['getcurrentannotask'],
        () => axios.get(`${API_URL}/annotasks/working`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
            cacheTime: 0,
            staleTime: 0,
        },
    )
}

export const useGetCurrentInstruction = (annotaskId) => {
    return useQuery(
        ['getCurrentInstruction', annotaskId],
        () =>
            axios
                .get(`${API_URL}/annotasks/${annotaskId}/instruction`)
                .then((res) => res.data),
        {
            enabled: !!annotaskId,
        },
    )
}

export const useGenerateExport = () => {
    return useMutation((data) =>
        axios
            .post(`${API_URL}/annotasks/${data.annotaskId}/exports`, data.exportConfig)
            .then((res) => res.data),
    )
}

export const useGetDataexports = (annoTaskId) => {
    return useQuery(
        ['annoDataExports'],
        () =>
            axios
                .get(`${API_URL}/annotasks/${annoTaskId}/exports`)
                .then((res) => res.data.annoTasksExports),
        {
            initialData: null,
        },
    )
}

export const useDeleteExport = () => {
    return useMutation((annoTaskExportId) =>
        axios
            .delete(`${API_URL}/annotasks/exports/${annoTaskExportId}`)
            .then((res) => res.data),
    )
}

export const useAnnotask = () => {
    return useMutation((annoTaskId) =>
        axios
            .get(`${API_URL}/annotasks/${annoTaskId}?config=true`)
            .then((res) => res.data),
    )
}

export const useChooseAnnotask = () => {
    return useMutation((annoTaskId) =>
        axios.post(`${API_URL}/annotasks?id=${annoTaskId}`).then((res) => res.data),
    )
}

// export const useAnnotaskListFiltered = () => {
//     return useMutation((datatableInfo) =>
//         axios
//             .post(`${API_URL}/annotask/annotask_list_filter`, datatableInfo)
//             .then((res) => res.data),
//     )
// }

export const useAnnotaskListFiltered = () => {
    return useMutation((datatableInfo) =>
        axios
            .get(
                `${API_URL}/annotasks?page=${datatableInfo.page}&pageSize=${datatableInfo.pageSize}&filteredName=${datatableInfo.filterOptions.filteredName}&filteredStates=${datatableInfo.filterOptions.filteredStates}`,
                datatableInfo,
            )
            .then((res) => res.data),
    )
}

export const useFilterLabels = () => {
    return useQuery(
        ['useFilterLabels'],
        () => axios.get(`${API_URL}/annotasks/filterLabels`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
            enabled: false,
        },
    )
}
