import React from 'react'
import { Progress } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import NodeFooter from './NodeFooter'

const AnnoTaskNode = (props) => {
    return (
        <div className="graph-node">
            <div className="graph-node-title">
                <span className="graph-node-title-icon">
                    <FontAwesomeIcon icon={faPencilAlt} />
                </span>
                <span className="graph-node-title-text">{props.title}</span>
            </div>
            <div className="graph-node-body">
                <div className="graph-node-body-row">
                    <b>
                        <span className="graph-node-body-left-text">
                            <b>Name: </b>
                        </span>
                    </b>
                    <span>{props.annoTask.name}</span>
                </div>
                <Progress value={props.annoTask.progress}>
                    {props.annoTask.progress}
                </Progress>
            </div>
            <NodeFooter footer={props.footer} />
        </div>
    )
}

export default AnnoTaskNode
