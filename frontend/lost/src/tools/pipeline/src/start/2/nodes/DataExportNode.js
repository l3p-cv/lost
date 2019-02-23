import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'


const DataExportNode = (props) =>{
    return(
        <div className='graph-node'>
        <div className='bg-orange graph-node-title'>
            <span className='graph-node-title-icon' ><FontAwesomeIcon icon={faDatabase} /></span>
            <span className='graph-node-title-text'>{props.title}</span>
        </div>
        <div className='graph-node-body'>
        </div>
        <div className='graph-node-footer'></div>
    </div>
    )
}

export default DataExportNode
