import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolderOpen, faHdd } from '@fortawesome/free-solid-svg-icons'
import NodeFooter from './NodeFooter'

const DatasourceNode = (props) => {
    return (
        <div className="graph-node">
            <div className="graph-node-title">
                <span className="graph-node-title-icon">
                    <FontAwesomeIcon icon={faHdd} />
                </span>
                <span className="graph-node-title-text">{props.title}</span>
            </div>
            <div className="graph-node-body">
                <div className="graph-node-body-row">
                    <span>
                        <FontAwesomeIcon icon={faFolderOpen} size="3x" />
                    </span>
                </div>
            </div>
            <NodeFooter footer={props.footer} />
        </div>
    )
}

export default DatasourceNode
