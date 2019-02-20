import React from 'react'
import { Progress, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'


class node1 extends React.Component{
    constructor(){
        super()
    }
    render(){
        return(
            <div className='graph-node'>
            <div className='graph-node-title'>
            <span className='graph-node-title-icon' ><FontAwesomeIcon icon={faDatabase}/></span>
            <span className='graph-node-title-text'>{this.props.title}</span>
            </div>
            <div className='graph-node-body'>
                <div className="text-center">50%</div>
                <Progress value={50} />
            </div>
            <div className='graph-node-footer'>{this.props.footer}</div>
        </div>

        )
    }
}
export default node1
