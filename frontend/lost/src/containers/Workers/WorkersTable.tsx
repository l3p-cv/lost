import { useWorkers } from '../../actions/worker/worker-api'
import { CenteredSpinner } from '../../components/CenteredSpinner'
import { createColumnHelper } from '@tanstack/react-table'
import BaseContainer from '../../components/BaseContainer'
import CoreDataTable from '../../components/CoreDataTable'
import { CBadge } from '@coreui/react'
import TableHeader from '../../components/TableHeader'
import ErrorBoundary from '../../components/ErrorBoundary'

const WorkersTable = () => {
  const { data, isLoading, isError } = useWorkers()
  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('worker_name', {
      header: 'Worker',
      cell: (props) => (
        <>
          <b>{props.row.original.worker_name}</b>
          <div className="small text-muted">{`ID: ${props.row.original.idx}`}</div>
        </>
      ),
    }),
    columnHelper.accessor('environment', {
      header: 'Environment',
      cell: (props) => {
        return (
          <>
            <b>{props.row.original.env_name}</b>
            <div className="small text-muted">
              {`Registered at: ${new Date(props.row.original.register_timestamp).toLocaleString()}`}
            </div>
          </>
        )
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (props) => {
        let statusColor = 'success'
        let statusText = 'Online'
        if (props.row.original.timestamp) {
          const someSecondsAgo = new Date(Date.now() - 15000)
          const lastActivityDate = new Date(props.row.original.timestamp)
          if (lastActivityDate < someSecondsAgo) {
            statusColor = 'danger'
            statusText = 'Offline'
          }
        }
        return (
          <>
            {/* <td className="text-center"> */}
            <CBadge color={statusColor}>{statusText}</CBadge>
            <div className="small text-muted">
              {`Last life sign: ${new Date(props.row.original.timestamp).toLocaleString()}`}
            </div>
            {/* </td> */}
          </>
        )
      },
    }),
    columnHelper.accessor('ressources', {
      header: 'Ressources',
      cell: (props) => {
        return [props.row.original.resources]
      },
    }),
    columnHelper.accessor('in_progress', {
      header: 'Jobs',
      cell: (props) => {
        return [props.row.original.in_progress]
      },
    }),
  ]

  if (isLoading) {
    return <CenteredSpinner />
  }

  if (isError) {
    return <div> {'An error occurred when loading workers'} </div>
  }

  return (
    <>
      <TableHeader
        headline={'Workers'}
        buttonStyle={{ marginTop: 15, marginBottom: 20, visibility: 'hidden' }}
      />
      {data && (
        <BaseContainer>
          <ErrorBoundary>
            <CoreDataTable
              columns={columns}
              tableData={data.workers}
              isLoading={isLoading}
            />
          </ErrorBoundary>
        </BaseContainer>
      )}
    </>
  )
}

export default WorkersTable
