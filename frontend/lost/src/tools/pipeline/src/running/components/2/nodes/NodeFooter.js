import React from 'react'

const NodeFooter = (props) =>{
    let className = props.footer
    let footerText = props.footer
    if(props.footer === 'in_progress'){
        footerText = 'in progress'
        className = 'in-progress'
    }
    return(
        <div className={`${className}  graph-node-footer  `}>{
            footerText
        }</div>
    )
}

export default NodeFooter