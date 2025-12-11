import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { saveAs } from 'file-saver'

import { API_URL } from '../../../../../lost_settings'
import { CModalBody, CModalHeader } from '@coreui/react'
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../../../../components/CoreDataTable'
import CoreIconButton from '../../../../../components/CoreIconButton'

const DataExportModal = ({ dataExport }) => {
  const downloadFile = (de_id, fileName) => {
    fetch(`${API_URL}/data/export/${de_id}`, {
      method: 'GET',
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
    })
      .then((res) => res.blob())
      .then((blob) => saveAs(blob, fileName))
  }

  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('file_name', {
      header: 'Name',
      cell: (props) => {
        return String(props.row.original.file_path.split('/').pop())
      },
    }),
    columnHelper.accessor('file_name', {
      header: 'Download',
      cell: (props) => {
        return (
          <CoreIconButton
            color="primary"
            // isOutline={false}
            icon={faDownload}
            onClick={() =>
              downloadFile(
                props.row.original.id,
                String(props.row.original.file_path.split('/').pop()),
              )
            }
            text={'Download'}
          />
        )
      },
    }),
  ]

  return (
    <>
      <CModalHeader>Data Export</CModalHeader>
      <CModalBody>
        <CoreDataTable tableData={dataExport} columns={columns} />
      </CModalBody>
    </>
  )
}

export default DataExportModal
