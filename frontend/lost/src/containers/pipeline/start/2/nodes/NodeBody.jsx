import React from 'react'

function renderTable(data) {
    if (data) {
        return data.map((el) => {
            return (
                <div key={el.key} className="graph-node-body-row">
                    <b>
                        <span className="graph-node-body-left-text">
                            <b>{el.key}: </b>
                        </span>
                    </b>
                    <span>{el.value}</span>
                </div>
            )
        })
    }
}

const NodeBody = (props) => {
    return (
        <div className="graph-node-body">
            {renderTable(props.data)}
            {props.children}
        </div>
    )
}

export default NodeBody
