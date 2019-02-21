import React, { Component } from 'react'
import { Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import NodeFooter from './NodeFooter'


const DatasourceNode = (props) =>{
    return(
        <div className='graph-node'>
        <div className='graph-node-title'>
            <span className='graph-node-title-icon' ><FontAwesomeIcon icon={faDatabase} /></span>
            <span className='graph-node-title-text'>{props.title}</span>
        </div>
        <div className='graph-node-body'>
        <div className='graph-node-body-row'>
        <span className='graph-node-body-left-text'>Type: </span>
        <span>{props.data.type}</span>
        </div>
        </div>
        <NodeFooter footer={props.footer}/>
    </div>

    )
}

export default DatasourceNode
