import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import NodeFooter from './NodeFooter'


const LoopNode = (props) =>{
    return(
        <div className='graph-node'>
        <div className='graph-node-title'>
            <span className='graph-node-title-icon' ><FontAwesomeIcon icon={faSync} /></span>
            <span className='graph-node-title-text'>{props.title}</span>
        </div>
        <div className='graph-node-body'>
        <div className='graph-node-body-row'>
        <span className='graph-node-body-left-text'>Max Iteration: </span>
         <span>{typeof props.loop.maxIteration === 'number' && (props.loop.maxIteration > -1)?props.loop.maxIteration:'Infinity'}</span> 
        </div>


        
        </div>
        <NodeFooter footer={props.footer}/>
    </div>

    )
}

export default LoopNode
