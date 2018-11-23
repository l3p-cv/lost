import React, {Component} from 'react'
import {Progress} from 'reactstrap'
import {getColor} from './utils'
import {Button} from 'reactstrap'


class WorkingOn extends Component {
    handleContinue(id){
        console.log('Handle Continue OnClick, ID: ', id)
    }
    render() {
        let progress = Math.floor((this.props.annoTask.finished / this.props.annoTask.size) * 100)
        return (
            <div>
                <div>
                    You are working on
                    <strong>{this.props.annoTask.name}</strong>
                </div>
                <br/>
                <div className='clearfix'>
                    <div className='float-left'>
                        <strong>{progress}%</strong>
                    </div>
                    <div className='float-right'>
                        <small className='text-muted'>Started at: {this.props.annoTask.createdAt}</small>
                    </div>
                </div>
                <Progress className='progress-xs' color={getColor(progress)} value={progress}/>
                <br/>
                <div>{this.props.annoTask.finished}/{this.props.annoTask.size}
                    &nbsp; annotations </div>
                    <br/>
                <Button onClick={()=>this.handleContinue(this.props.annoTask.id) }className='btn btn-info'>Continue</Button>
            </div>
        )
    }
}

export default WorkingOn