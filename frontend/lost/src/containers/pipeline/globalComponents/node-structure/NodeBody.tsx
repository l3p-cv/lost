import React, { ReactNode } from 'react'

interface DataItem {
    key: string
    value: string
}

interface NodeBodyProps {
    data?: DataItem[]
    children?: ReactNode
}

const renderTable = (data: DataItem[]) => {
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

const NodeBody: React.FC<NodeBodyProps> = (props) => {
    return (
        <div className="graph-node-body">
            {props.data && renderTable(props.data)}
            {props.children}
        </div>
    )
}

export default NodeBody
