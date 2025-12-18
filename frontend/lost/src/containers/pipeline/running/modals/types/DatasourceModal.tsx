import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../../../../components/CoreDataTable'
import BaseModal from '../../../../../components/BaseModal'

type DatasourceModalProps = {
  id: number | string
  state: string
  modalOpened: boolean
  onClose: () => void
  datasource: { rawFilePath: string; id: number | string }
}

const DatasourceModal = ({
  datasource,
  state,
  id,
  modalOpened,
  onClose,
}: DatasourceModalProps) => {
  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('taskName', {
      header: () => 'Attribute',
      cell: ({ row }) => {
        return <b>{row.original.key}</b>
      },
    }),
    columnHelper.accessor('taskName', {
      header: () => 'Value',
      cell: ({ row }) => {
        return <>{row.original.value}</>
      },
    }),
  ]
  const tData = [
    {
      key: 'Path:',
      value: datasource.rawFilePath,
    },
    {
      key: 'Element ID:',
      value: id,
    },
    {
      key: 'Datasource ID:',
      value: datasource.id,
    },
    {
      key: 'Status:',
      value: state,
    },
  ]
  console.log('Should be true', modalOpened)
  return (
    <BaseModal isOpen={modalOpened} title="Datasource" onClosed={onClose}>
      <CoreDataTable
        tableData={tData}
        rowHeight="35px"
        usePagination={false}
        columns={columns}
      />
    </BaseModal>
  )
}

export default DatasourceModal
