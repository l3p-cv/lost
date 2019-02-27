import React from 'react'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import VerificationTitle from './VerificationTitle'

const AnnoTaskNode = (props) => {
    return (
        <div className='graph-node'>
            <VerificationTitle
                verified={props.verified}
                title= {props.title}
                icon= {faDatabase}
            />

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