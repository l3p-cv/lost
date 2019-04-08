import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar } from '@fortawesome/free-solid-svg-icons'
import NodeFooter from './NodeFooter'

const VisualOutputNode = (props) => {
    return(
        <div className='graph-node'>
        <div className='graph-node-title'>
            <span className='graph-node-title-icon' ><FontAwesomeIcon icon={faChartBar} /></span>
            <span className='graph-node-title-text'>{props.title}</span>
        </div>
        <div className='graph-node-body'>
        <span><FontAwesomeIcon icon={faChartBar}  size='3x'/></span>
        </div>
        <NodeFooter footer={props.footer}/>
    </div>

    )
}

export default VisualOutputNode
