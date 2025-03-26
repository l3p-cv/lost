import { Badge, Table } from 'reactstrap'
import { useWorkers } from '../../actions/worker/worker-api'
import { CenteredSpinner } from '../../components/CenteredSpinner'

const WorkersTable = () => {
    const { data, isLoading, isError } = useWorkers()

    if (isLoading) {
        return <CenteredSpinner />
    }

    if (isError) {
        return <div> {'An error occurred when loading workers'} </div>
    }

    return (
        data && (
            <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
                <thead className="thead-light">
                    <tr>
                        <th className="text-center">Name</th>
                        <th className="text-center">Environment</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Resources</th>
                        <th className="text-center">Jobs</th>
                    </tr>
                </thead>
                <tbody>
                    {data.workers.map((worker) => {
                        let statusColor = 'success'
                        let statusText = 'Online'

                        if (worker.timestamp) {
                            const someSecondsAgo = new Date(Date.now() - 15000)
                            const lastActivityDate = new Date(worker.timestamp)
                            if (lastActivityDate < someSecondsAgo) {
                                statusColor = 'danger'
                                statusText = 'Offline'
                            }
                        }

                        return (
                            <tr key={worker.idx}>
                                <td className="text-center">
                                    <div>{worker.worker_name}</div>
                                    <div className="small text-muted">
                                        ID: {worker.idx}
                                    </div>
                                </td>
                                <td>
                                    <div>{worker.env_name}</div>
                                    <div className="small text-muted">
                                        Registered at:{' '}
                                        {new Date(
                                            worker.register_timestamp,
                                        ).toLocaleString()}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div>
                                        <Badge color={statusColor}>{statusText}</Badge>
                                    </div>
                                    <div className="small text-muted">
                                        Last life sign:{' '}
                                        {new Date(worker.timestamp).toLocaleString()}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div>{worker.resources}</div>
                                </td>
                                <td className="text-center">
                                    <div>{worker.in_progress}</div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        )
    )
}

export default WorkersTable
