import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const VerificationTitle = (props) =>{
    return(
        <div className={`${props.verified?'bg-green':'bg-orange'} graph-node-title`}>
            <span className='graph-node-title-icon' ><FontAwesomeIcon icon={props.icon} /></span>
                <span className='graph-node-title-text'>{props.title}</span>
        </div>
    )
}

export default VerificationTitle