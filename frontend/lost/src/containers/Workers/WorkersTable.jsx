import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Badge, Table } from 'reactstrap'
import actions from '../../actions'

const { getWorkers, getWorkerLogFile } = actions

const WorkersTable = ({ workers, getWorkers }) => {
    const [modalsIsOpen, setModalsIsOpen] = useState([])

    useEffect(() => {
        getWorkers()
        const workertimer = setInterval(() => getWorkers(), 5000)

        return () => clearInterval(workertimer)
    }, [getWorkers])

    useEffect(() => {
        if (modalsIsOpen.length !== workers.length) {
            setModalsIsOpen(
                workers.map((worker) => ({
                    idx: worker.idx,
                    isOpen: false,
                })),
            )
        }
    }, [workers, modalsIsOpen.length])

    const renderTableBody = () => {
        return (
            <tbody>
                {workers.map((worker) => {
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
                                <div className="small text-muted">ID: {worker.idx}</div>
                            </td>
                            <td>
                                <div>{worker.env_name}</div>
                                <div className="small text-muted">
                                    Registered at:{' '}
                                    {new Date(worker.register_timestamp).toLocaleString()}
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
        )
    }

    return (
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
            {renderTableBody()}
        </Table>
    )
}

const mapStateToProps = (state) => ({ workers: state.worker.workers })

export default connect(mapStateToProps, { getWorkers, getWorkerLogFile })(WorkersTable)
