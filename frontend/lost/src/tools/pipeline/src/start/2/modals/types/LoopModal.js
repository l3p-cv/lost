import React, {Component} from 'react'
import Table from 'pipelineGlobalComponents/modals/Table'

class LoopModal extends Component{
    render(){
        return(
            <Table
            data={[
                {
                    key: 'Max Iteration',
                    value: this.props.exportData.maxIteration?this.props.exportData.maxIteration: '0'
                }
            ]}
        />
        )
    }
}

export default LoopModal