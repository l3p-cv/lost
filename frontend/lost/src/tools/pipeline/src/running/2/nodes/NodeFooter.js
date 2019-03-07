import React from 'react'

const NodeFooter = (props) =>{
    
    let footerText = props.footer
    let className = 'bg-red'

    if(props.footer === 'in_progress'){
        footerText = 'in progress'
        className = 'bg-orange'
    }else if(props.footer === 'finished'){
        className = 'bg-green'
    }else if(props.footer === 'pending'){
        className = 'bg-blue'
    }else if(props.footer==='script_error'){
        footerText = 'script error'
    }
    return(
        <div className={`${className}  graph-node-footer  `}>{
            footerText
        }</div>
    )
}

export default NodeFooter