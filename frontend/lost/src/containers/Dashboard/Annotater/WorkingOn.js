import React, {Component} from 'react'
import {Progress} from 'reactstrap'
import {getColor} from './utils'
import {Button} from 'reactstrap'

const annoTask = {
    'name': 'TestTask',
    'id': 1,
    'pipelineName': 'FirstTestPipe',
    'pipelineCreator': 'admin',
    'group': 'dieDollenAnnotierer',
    'createdAt': 'datetime',
    'type': 'MIA',
    'lastActivity': 'datetime',
    'lastAnnotater': 'jochen',
    'finished': 405,
    'size': 450
}

class WorkingOn extends Component {

    render() {
        let progress = Math.floor((annoTask.finished / annoTask.size) * 100)
        return (
            <div>
                <div>
                    You are working on
                    <strong>{annoTask.name}</strong>
                </div>
                <br/>
                <div className='clearfix'>
                    <div className='float-left'>
                        <strong>{progress}%</strong>
                    </div>
                    <div className='float-right'>
                        <small className='text-muted'>Started at: {annoTask.createdAt}</small>
                    </div>
                </div>
                <Progress className='progress-xs' color={getColor(progress)} value={progress}/>
                <br/>
                <div>{annoTask.finished}/{annoTask.size}
                    &nbsp; annotations </div>
                    <br/>
                <Button className='btn btn-info'>Continue</Button>
            </div>
        )
    }
}

export default WorkingOn