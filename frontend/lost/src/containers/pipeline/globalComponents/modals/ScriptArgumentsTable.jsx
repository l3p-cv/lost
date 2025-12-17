import React from 'react'
import { CFormInput } from '@coreui/react'
import InfoText from '../../../../components/InfoText'
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../../../components/CoreDataTable'

const ArgumentsTable = ({ data, onInput }) => {
  const columnHelper = createColumnHelper()

  const tableData = React.useMemo(
    () =>
      Object.entries(data).map(([key, value]) => ({
        key,
        value: value.value,
        help: value.help,
      })),
    [data],
  )

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('key', {
        header: 'Key',
        cell: ({ row }) => (
          <InfoText
            id={row.original.key}
            text={row.original.key}
            toolTip={row.original.help}
          />
        ),
      }),

      columnHelper.accessor('value', {
        header: 'Value',
        cell: ({ row }) => (
          <CFormInput
            size="sm"
            defaultValue={row.original.value}
            data-ref={row.original.key}
            onInput={onInput} // or onBlur if you want even fewer events
          />
        ),
      }),
    ],
    [onInput],
  )

  return <CoreDataTable tableData={tableData} columns={columns} usePagination={false} />
}

export default ArgumentsTable
