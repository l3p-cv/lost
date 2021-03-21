import React from 'react'
import { faRocket } from '@fortawesome/free-solid-svg-icons'
import VerificationTitle from './VerificationTitle'
import NodeBody from './NodeBody'

function renderArgumentsLabel(props) {
    if (props.exportData.script.arguments) {
        return (
            <div className='graph-node-body-row'>
                <span className='arguments-lable graph-node-body-left-text'>Arguments available</span>
            </div>
        )
    }

}

const ScriptNode = (props) => {
    return (
        <div className='graph-node'>
            <VerificationTitle
                verified={props.verified}
                title={props.title}
                icon={faRocket}
            />
            <NodeBody
                data={[
                    {
                        key: 'Name',
                        value: props.exportData.script.name
                    }
                ]}
            >
                {renderArgumentsLabel(props)}
            </NodeBody>
            <div className='graph-node-footer'></div>
        </div>
    )
}

export default ScriptNode


