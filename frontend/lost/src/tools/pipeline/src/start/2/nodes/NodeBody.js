import React from 'react'

const NodeBody = (props) => {
    return(
        <div className='graph-node-body'>
        {props.data.map((el)=>{
            return(
                <div key={el.key} className='graph-node-body-row'>
                <span className='graph-node-body-left-text'>{el.key}: </span>
                <span>{el.value}</span>
            </div>
            )
        })}


    </div>
    )
}

export default NodeBody