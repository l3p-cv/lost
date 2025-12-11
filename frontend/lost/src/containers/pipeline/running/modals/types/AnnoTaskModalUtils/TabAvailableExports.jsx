import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { saveAs } from 'file-saver'
import { useEffect } from 'react'
import * as annoTaskApi from '../../../../../../actions/annoTask/anno_task_api'
import * as Notification from '../../../../../../components/Notification'
import { getColor } from '../../../../../../containers/Annotation/AnnoTask/utils'
import { API_URL } from '../../../../../../lost_settings'
import { CProgress } from '@coreui/react'
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../../../../../components/CoreDataTable'
import CoreIconButton from '../../../../../../components/CoreIconButton'
import BaseContainer from '../../../../../../components/BaseContainer'

const TabAvailableExports = (props) => {
  const {
    data: deleteExportData,
    mutate: deleteExport,
    status: deleteExportStatus,
  } = annoTaskApi.useDeleteExport()

  const downloadFile = (dataExportId, dataExportType, dataExportName) => {
    axios
      .get(`${API_URL}/annotasks/exports/${dataExportId}`, {
        responseType: 'blob', // will make sure, that response is interpreted as blob
      })
      .then((res) => {
        const blob = new Blob([res.data], { type: 'application/octet-stream' })
        saveAs(blob, `${dataExportName}.${dataExportType}`)
      })
      .catch((error) => {
        console.error('Download fehlgeschlagen:', error)
      })
  }

  const handleAnnotaskExportDelete = (annoTaskExportId) => {
    Notification.showDecision({
      title: 'Do you really want to delete your annotation export ?',
      option1: {
        text: 'YES',
        callback: () => {
          deleteExport(annoTaskExportId)
        },
      },
      option2: {
        text: 'NO!',
        callback: () => {},
      },
    })
  }

  useEffect(() => {
    if (deleteExportStatus === 'success') {
      Notification.showSuccess('Your annotation export will be deleted.')
    }
    if (deleteExportStatus === 'error') {
      Notification.showError('Error while deleting your export.')
    }
  }, [deleteExportStatus])

  const getFileSize = (fileSize) => {
    if (fileSize < 1024) {
      return <>{Number(fileSize.toFixed(2))} Bytes</>
    }
    if (fileSize < 1048576) {
      return <>{Number((fileSize / 1024).toFixed(2))} kBytes</>
    }
    if (fileSize < 1073741824) {
      return <>{Number((fileSize / 1024 / 1024).toFixed(2))} MBytes</>
    }
    return <>{Number((fileSize / 1024 / 1024 / 1024).toFixed(2))} GBytes</>
  }

  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name / Date',
      cell: (props) => {
        return (
          <>
            <b>{props.row.original.name}</b>
            <div className="small text-muted">
              {new Date(props.row.original.timestamp).toLocaleString()}
            </div>
          </>
        )
      },
    }),
    columnHelper.accessor('annotaskProgress', {
      header: 'Annotask Progress',
      cell: (props) => {
        return (
          <>
            <b>{`${props.row.original.annotaskProgress} %`}</b>
            <div className="small text-muted">{`${props.row.original.imgCount} Images`}</div>
          </>
        )
      },
    }),
    columnHelper.accessor('progress', {
      header: 'Export progress',
      cell: (props) => {
        const progress = parseInt(props.row.original.progress)
        return (
          <div className="clearfix">
            {/* <div className="float-left"> */}
            <strong>{progress}%</strong>
            {/* </div> */}
            <CProgress
              className="progress-xs rt-progress"
              color={getColor(progress)}
              value={progress}
            />
            {progress < 100 ? (
              ''
            ) : (
              <div className="small text-muted">
                {getFileSize(props.row.original.fileSize)}
              </div>
            )}
          </div>
        )
      },
    }),
    columnHelper.accessor('delete', {
      header: 'Delete',
      cell: (props) => {
        return (
          <CoreIconButton
            color="danger"
            disabled={props.row.original.progress < 100}
            icon={faTrash}
            onClick={() => handleAnnotaskExportDelete(props.row.original.id)}
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
              downloadFile(
                props.row.original.id,
                props.row.original.fileType,
                props.row.original.name,
              )
            }
            text={'Download'}
          />
        )
      },
    }),
  ]

  return (
    <BaseContainer>
      <CoreDataTable tableData={props.dataExports} columns={columns} />
    </BaseContainer>
  )
}

export default TabAvailableExports
