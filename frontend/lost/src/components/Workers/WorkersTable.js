import React, {Component} from 'react'

import {connect} from 'react-redux'
import {Badge, Table} from 'reactstrap'

import actions from '../../actions'


const {getWorkers} = actions

class WorkersTable extends Component {
    componentDidMount() {
        this
            .props
            .getWorkers()
    }

    handleRowClick(worker){
        const {id,type,status} = worker
        console.log(id)
        
    }

    renderTableBody() {
        console.log(this.props.workers)
        return (
            <tbody>
                {this.props.workers.map((worker) => {
                    let statusColor = 'success'
                    let statusText = 'Online'

                    if (worker.timestamp){
                        const someSecondsAgo = new Date(Date.now() - 3615000) // fix this to correct timestamp
                        const lastActivityDate = new Date(worker.timestamp)
                        if(lastActivityDate < someSecondsAgo){
                            statusColor = 'danger'
                            statusText = 'Offline'
                        }
                    }
                    return (
                        <tr key={worker.idx} onClick={() => this.handleRowClick(worker)}>
                            <td className='text-center'>
                                <div>{worker.worker_name}</div>
                                <div className='small text-muted'>ID: {worker.idx}</div>
                            </td>
                            <td>
                                <div>{worker.env_name}</div>
                                <div className='small text-muted'>
                                    Registered at: {worker.register_timestamp}
                                </div>
                            </td>
                            <td className='text-center'>
                                <div><Badge color={statusColor}>{statusText}</Badge></div>
                            </td>
                            <td className='text-center'>
                                <div>{worker.resources}</div>
                            </td>
                            <td className='text-center'>
                                <div>{worker.jobs}</div>
                            </td>
                        </tr>
                    )
                })}
            </tbody>

        )
    }
    render() {

        return (
            <Table hover responsive className='table-outline mb-0 d-none d-sm-table'>
                <thead className='thead-light'>
                    <tr>
                        <th className='text-center'>Name</th>
                        <th className='text-center'>Environment</th>
                        <th className='text-center'>Status</th>
                        <th className='text-center'>Resources</th>
                        <th className='text-center'>Jobs</th>
                    </tr>
                </thead>
                {this.renderTableBody()}
            </Table>
        )

    }
}
function mapStateToProps(state) {
    return ({workers: state.worker.workers})
}

export default connect(mapStateToProps, {getWorkers})(WorkersTable)
