import React from 'react'
import { Progress } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import NodeFooter from './NodeFooter'

const ScriptNode = (props) => {
    return(
        <div className='graph-node'>
        <div className='graph-node-title'>
            <span className='graph-node-title-icon' ><FontAwesomeIcon icon={faDatabase} /></span>
            <span className='graph-node-title-text'>{props.title}</span>
        </div>
        <div className='graph-node-body'>
        </div>
        <NodeFooter footer={props.footer}/>
    </div>

    )
}

export default ScriptNode
