import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons'
import {
  useAvailableDatasetExports,
  useDeleteDatasetExport,
  useDownloadDatasetExport,
} from '../../actions/dataset/dataset-export-api'
import * as Notification from '../../components/Notification'
import { CProgress } from '@coreui/react'
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../components/CoreDataTable'
import BaseContainer from '../../components/BaseContainer'
import CoreIconButton from '../../components/CoreIconButton'

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

  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('filePath', {
      header: 'Name',
      cell: (props) => {
        return (
          <>
            <b>{getFilename(props.row.original.filePath)}</b>
          </>
        )
      },
    }),
    columnHelper.accessor('progress', {
      header: 'Export progress',
      cell: (props) => {
        const progress = parseInt(props.row.original.progress)
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
    }),
    columnHelper.accessor('id', {
      header: 'Delete',
      cell: (props) => {
        return (
          <CoreIconButton
            color="danger"
            disabled={props.row.original.progress < 100}
            icon={faTrash}
            onClick={() => handleDatasetExportDelete(props.row.original.id)}
          />
        )
      },
    }),
    columnHelper.accessor('download', {
      header: 'Download',
      cell: (props) => {
        return (
          <CoreIconButton
            color="primary"
            disabled={props.row.original.progress < 100}
            icon={faDownload}
            onClick={() =>
              downloadDatasetExport({
                exportId: props.row.original.id,
                fileName: getFilename(props.row.original.filePath),
              })
            }
            text={'Download'}
          />
        )
      },
    }),
  ]

  return (
    <BaseContainer>
      <CoreDataTable tableData={data?.exports} columns={columns} />
    </BaseContainer>
  )
}
