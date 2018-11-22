import React, {Component} from 'react'
import {Progress, Table} from 'reactstrap'
import AmountPerLabel from './AmountPerLabel'
import {getColor} from './utils'
const annoTasks = [
    {
        'name': 'TestTask',
        'id': 1,
        'pipelineName': 'FirstTestPipe',
        'pipelineCreator': 'admin',
        'group': 'dieDollenAnnotierer',
        'createdAt': 'datetime',
        'type': 'MIA',
        'lastActivity': 'datetime',
        'lastAnnotater': 'jochen',
        'finished': 20,
        'size': 450
    },
    {
        'name': 'TestTask',
        'id': 2,
        'pipelineName': 'FirstTestPipe',
        'pipelineCreator': 'admin',
        'group': 'dieDollenAnnotierer',
        'createdAt': 'datetime',
        'type': 'MIA',
        'lastActivity': 'datetime',
        'lastAnnotater': 'jochen',
        'finished': 150,
        'size': 450
    },
    {
        'name': 'TestTask',
        'id': 3,
        'pipelineName': 'FirstTestPipe',
        'pipelineCreator': 'admin',
        'group': 'dieDollenAnnotierer',
        'createdAt': 'datetime',
        'type': 'MIA',
        'lastActivity': 'datetime',
        'lastAnnotater': 'jochen',
        'finished': 300,
        'size': 450
    }, {
        'name': 'TestTask',
        'id': 4,
        'pipelineName': 'FirstTestPipe',
        'pipelineCreator': 'admin',
        'group': 'dieDollenAnnotierer',
        'createdAt': 'datetime',
        'type': 'SIA',
        'lastActivity': 'datetime',
        'lastAnnotater': 'jochen',
        'finished': 405,
        'size': 450
    }
]

class MyAnnoTasks extends Component {
    handleRowClick(id){
        console.log('Clicked on AnnoTask with ID: ' + id)
    }

    renderTableBody() {
        return (
            <tbody>
                {annoTasks.map((annoTask) => {
                    let progress = Math.floor((annoTask.finished/annoTask.size)*100)
                    return (
                        <tr key={annoTask.id} style={{'cursor': 'pointer'}} onClick={() => this.handleRowClick(annoTask.id)}>
                            <td className='text-center'>
                                <div>{annoTask.name}</div>
                                <div className='small text-muted'>ID: {annoTask.id}
                                </div>
                            </td>
                            <td>
                                <div>{annoTask.pipelineName}</div>
                                <div className='small text-muted'>
                                    Created by: {annoTask.pipelineCreator}
                                </div>
                            </td>
                            <td className='text-center'>
                                <div>{annoTask.group}</div>
                            </td>
                            <td>
                                <div className='clearfix'>
                                    <div className='float-left'>
                                        <strong>{progress}%</strong>
                                    </div>
                                    <div className='float-right'>
                                        <small className='text-muted'>Started at: {annoTask.createdAt}</small>
                                    </div>
                                </div>
                                <Progress className='progress-xs' color={getColor(progress)} value={progress}/>
                                <div className='small text-muted'>
                                    {annoTask.finished}/{annoTask.size}
                                </div>
                            </td>
                            <td className='text-center'>
                                <strong>{annoTask.type}</strong>
                            </td>
                            <td>
                                <strong>{annoTask.lastActivity}</strong>
                                <div className='small text-muted'>by {annoTask.lastAnnotater}</div>
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
                        <th className='text-center'>Pipeline</th>
                        <th className='text-center'>Group/User</th>
                        <th>Progress</th>
                        <th className='text-center'>Annotation Type</th>
                        <th className='text-center'>Activity</th>
                    </tr>
                </thead>
                {this.renderTableBody()}
            </Table>
        )

    }
}

export default MyAnnoTasks
