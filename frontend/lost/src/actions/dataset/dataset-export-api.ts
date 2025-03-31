import { saveAs } from 'file-saver'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { showError, showSuccess } from '../../components/Notification'
import { httpClient } from '../http-client'
import { AvailableDatasetExportsResponse } from './model'

export const useExportDataset = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            datasetId,
            annotatedOnly,
        }: {
            datasetId: number
            annotatedOnly: boolean
        }) => {
            return httpClient.post(`datasets/export_ds_parquet/${datasetId}`, {
                annotatedOnly,
            })
        },
        onSuccess: () => {
            showSuccess('Dataset export started successfully')
            queryClient.invalidateQueries('availableDatasetExports')
        },
        onError: () => {
            showError('Failed to start dataset export')
        },
    })
}

export const useAvailableDatasetExports = (datasetId: number) => {
    return useQuery({
        queryKey: ['availableDatasetExports', datasetId],
        queryFn: () => {
            return httpClient.get<AvailableDatasetExportsResponse>(
                `datasets/${datasetId}/ds_exports`,
            )
        },
        refetchInterval: 4000,
    })
}

export const useDownloadDatasetExport = () => {
    return useMutation({
        mutationFn: async (exportId: number) => {
            const blobData = await httpClient.get<Blob>(
                `datasets/ds_exports/${exportId}`,
                {
                    responseType: 'blob',
                },
            )

            return { blob: blobData, exportId }
        },
        onSuccess: ({ blob, exportId }) => {
            saveAs(blob, `dataset_export_${exportId}.parquet`)
        },
        onError: () => {
            showError('Failed to start download')
        },
    })
}

export const useDeleteDatasetExport = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (exportId: number) => {
            return httpClient.delete(`datasets/ds_exports/${exportId}`)
        },
        onSuccess: () => {
            showSuccess('Export deleted successfully')
            queryClient.invalidateQueries('availableDatasetExports')
        },
        onError: () => {
            showError('Failed to delete export')
        },
    })
}
