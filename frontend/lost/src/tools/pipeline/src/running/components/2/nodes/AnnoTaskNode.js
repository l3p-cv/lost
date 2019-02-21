import React, { Component } from 'react'
import { Progress } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import NodeFooter from './NodeFooter'


const AnnoTaskNode = (props) =>{
    return(
        <div className='graph-node'>
        <div className='graph-node-title'>
            <span className='graph-node-title-icon' ><FontAwesomeIcon icon={faDatabase} /></span>
            <span className='graph-node-title-text'>{props.title}</span>
        </div>
        <div className='graph-node-body'>
            <div className='graph-node-body-row'>
                <span className='graph-node-body-left-text'>Name: </span>
                <span>{props.data.name}</span>
            </div>
            <Progress value={props.data.progress}>{props.data.progress}</Progress>
        </div>
        <NodeFooter footer={props.footer}/>
    </div>
    )
}


export default AnnoTaskNode


