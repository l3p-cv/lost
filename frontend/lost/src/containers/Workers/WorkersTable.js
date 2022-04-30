import React, { Component } from 'react'

import { connect } from 'react-redux'
import { Badge, Button, Card, CardHeader, CardBody, Table } from 'reactstrap'
// import Modal from 'react-modal'
import LogModal from '../../components/LogModal'
import actions from '../../actions'
import * as Notification from '../../components/Notification'
import BaseContainer from '../../components/BaseContainer'

const { getWorkers, getWorkerLogFile } = actions

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '85%',
        height: '85%',
        maxWidth: '75rem',
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.75)',
    },
}

class WorkersTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            logBlobUrl: '',
            modalsIsOpen: [],
        }
    }

    componentDidMount() {
        this.props.getWorkers()
        this.workertimer = setInterval(() => this.props.getWorkers(), 5000)
    }

    handleLogfileButtonClick(worker) {
        this.setState({
            modalsIsOpen: this.state.modalsIsOpen.map((el) => ({
                idx: el.idx,
                isOpen: el.idx === worker.idx ? true : false,
            })),
        })
    }

    componentWillUnmount() {
        clearInterval(this.workertimer)
        this.workertimer = null
    }

    componentWillReceiveProps() {
        if (this.state.modalsIsOpen.length != this.props.workers.length) {
            this.setState({
                modalsIsOpen: this.props.workers.map((el) => ({
                    idx: el.idx,
                    isOpen: false,
                })),
            })
        }
    }

    renderLogFileModal(worker) {
        if (this.state.modalsIsOpen.length) {
            const isOpen = this.state.modalsIsOpen.filter(
                (el) => el.idx === worker.idx,
            )[0].isOpen
            return (
                <LogModal
                    actionType={LogModal.TYPES.WORKERS}
                    isDownloadable
                    wiLogId={worker.idx}
                    isOpen={isOpen}
                    toggle={() => {
                        this.setState({
                            modalsIsOpen: this.state.modalsIsOpen.map((el) => {
                                if (el.idx === worker.idx) {
                                    return {
                                        ...el,
                                        isOpen: !el.isOpen,
                                    }
                                }
                                return el
                            }),
                        })
                    }}
                    logPath={isOpen ? `${worker.worker_name}.log` : null}
                />
            )
        }
        return null
    }

    renderTableBody() {
        return (
            <tbody>
                {this.props.workers.map((worker) => {
                    let statusColor = 'success'
                    let statusText = 'Online'

                    if (worker.timestamp) {
                        const someSecondsAgo = new Date(Date.now() - 15000) // fix this to correct timestamp
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
                            {/* <td className="text-center">
                                <Button
                                    onClick={() => this.handleLogfileButtonClick(worker)}
                                >
                                    Logs
                                </Button>
                                {this.renderLogFileModal(worker)}
                            </td> */}
                        </tr>
                    )
                })}
            </tbody>
        )
    }
    render() {
        return (
            <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
                <thead className="thead-light">
                    <tr>
                        <th className="text-center">Name</th>
                        <th className="text-center">Environment</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Resources</th>
                        <th className="text-center">Jobs</th>
                        {/* <th className="text-center">Logs</th> */}
                    </tr>
                </thead>
                {this.renderTableBody()}
            </Table>
        )
    }
}
function mapStateToProps(state) {
    return { workers: state.worker.workers }
}

export default connect(mapStateToProps, { getWorkers, getWorkerLogFile })(WorkersTable)
