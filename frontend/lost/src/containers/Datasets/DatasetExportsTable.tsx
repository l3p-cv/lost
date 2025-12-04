import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons'
import ReactTable from 'react-table'
import {
  useAvailableDatasetExports,
  useDeleteDatasetExport,
  useDownloadDatasetExport,
} from '../../actions/dataset/dataset-export-api'
import IconButton from '../../components/IconButton'
import * as Notification from '../../components/Notification'
import { CProgress } from '@coreui/react'

const getFilename = (filePath: string) => {
  return filePath.split('/').pop() || 'dataset_export'
}

interface DatasetExportsTableProps {
  datasetId: number
}

export const DatasetExportsTable = ({ datasetId }: DatasetExportsTableProps) => {
  const { data, isLoading, isError } = useAvailableDatasetExports(datasetId)
  const { mutate: downloadDatasetExport } = useDownloadDatasetExport()
  const { mutate: deleteDatasetExport } = useDeleteDatasetExport()

  const handleDatasetExportDelete = (exportId: number) => {
    Notification.showDecision({
      title: 'Are you sure you want to delete this export?',
      option1: {
        text: 'YES',
        callback: () => {
          deleteDatasetExport(exportId)
        },
      },
      option2: {
        text: 'NO!',
        callback: () => {},
      },
    })
  }

  return (
    <>
      <ReactTable
        loading={isLoading}
        noDataText={isError ? 'Failed to load data' : 'No exports available'}
        columns={[
          {
            Header: 'Name',
            accessor: 'filePath',
            Cell: (row) => {
              return (
                <>
                  <b>{getFilename(row.original.filePath)}</b>
                </>
              )
            },
          },
          {
            Header: 'Export progress',
            accessor: 'progress',
            Cell: (row) => {
              const progress = parseInt(row.original.progress)
              return (
                <>
                  <div className="clearfix">
                    <CProgress
                      className="progress-xs rt-progress"
                      color={progress < 100 ? 'info' : 'success'}
                      value={100}
                      animated={progress < 100}
                      // striped={progress < 100}
                    >
                      <strong>{progress < 100 ? 'In progress' : 'Completed'}</strong>
                    </CProgress>
                  </div>
                </>
              )
            },
          },
          {
            Header: 'Delete',
            accessor: 'id',
            Cell: (row) => {
              return (
                <IconButton
                  color="danger"
                  disabled={row.original.progress < 100}
                  icon={faTrash}
                  onClick={() => handleDatasetExportDelete(row.original.id)}
                ></IconButton>
              )
            },
          },
          {
            Header: 'Download',
            accessor: 'id',
            Cell: (row) => {
              return (
                <IconButton
                  color="primary"
                  isOutline={false}
                  disabled={row.original.progress < 100}
                  icon={faDownload}
                  onClick={() =>
                    downloadDatasetExport({
                      exportId: row.original.id,
                      fileName: getFilename(row.original.filePath),
                    })
                  }
                  text={'Download'}
                ></IconButton>
              )
            },
          },
        ]}
        data={data?.exports}
        defaultPageSize={5}
        className="-striped -highlight"
      />
    </>
  )
}
