import { createColumnHelper } from '@tanstack/react-table'
import BaseModal from '../../../../../components/BaseModal'
import CoreDataTable from '../../../../../components/CoreDataTable'

const LoopModal = ({ id, loop, state, modalOpened, onClose }) => {
  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('taskName', {
      header: () => 'Attribute',
      cell: ({ row }) => {
        return <b>{`${row.original.key}:`}</b>
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
      key: 'Element ID',
      value: id,
    },
    {
      key: 'Loop ID',
      value: loop.id,
    },
    {
      key: 'Breakloop',
      value: String(loop.isBreakLoop),
    },
    {
      key: 'Iteration',
      value: loop.iteration,
    },
    {
      key: 'Max Iteration',
      value:
        typeof loop.maxIteration === 'number' && loop.maxIteration > -1
          ? loop.maxIteration
          : 'Infinity',
    },
    {
      key: 'Jump ID',
      value: loop.peJumpId,
    },
    {
      key: 'Status',
      value: state,
    },
  ]

  return (
    <BaseModal title="Loop Modal" isOpen={modalOpened} onClosed={onClose}>
      <CoreDataTable tableData={tData} columns={columns} usePagination={false} />
    </BaseModal>
  )
}

export default LoopModal
