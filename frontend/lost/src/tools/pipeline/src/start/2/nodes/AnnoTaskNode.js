import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'


const AnnoTaskNode = (props) =>{
    return(
        <div className='graph-node'>
        <div className={`${props.verified?'bg-green':'bg-orange'} graph-node-title`}>
            <span className='graph-node-title-icon' ><FontAwesomeIcon icon={faDatabase} /></span>
            <span className='graph-node-title-text'>{props.title}</span>
        </div>
        <div className='graph-node-body'>
            <div className='graph-node-body-row'>
                <span className='graph-node-body-left-text'>Name: </span>
                <span>{props.data.name}</span>
            </div>
        </div>
        <div className='graph-node-footer'></div>
    </div>
    )
}


export default AnnoTaskNode