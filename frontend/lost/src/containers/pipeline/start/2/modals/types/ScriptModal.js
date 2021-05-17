import React, { Component } from 'react'
import Table from '../../../../globalComponents/modals/Table'

import ArgumentsTable from '../../../../globalComponents/modals/ScriptArgumentsTable'

import CollapseCard from '../../../../globalComponents/modals/CollapseCard'

import {connect} from 'react-redux'
import actions from '../../../../../../actions/pipeline/pipelineStartModals/script'

const {updateArguments} = actions
class ScriptModal extends Component {
    constructor() {
        super()
        this.argumentTableOnInput = this.argumentTableOnInput.bind(this)
    }
    argumentTableOnInput(e){
        let arg = this.props.exportData.script.arguments
        const key = e.target.getAttribute('data-ref')
        const value = e.target.value
        arg[key].value = value
        this.props.updateArguments(this.props.peN, arg)
    }
    render() {
        return (
            <>
                <Table
                    data={[
                        {
                            key: 'Script Name',
                            value: this.props.exportData.script.name
                        },
                        {
                            key: 'Description',
                            value: this.props.exportData.script.description
                        }
                    ]}
                />
                <ArgumentsTable
                    onInput={this.argumentTableOnInput}
                    data={this.props.exportData.script.arguments}
                />
                <CollapseCard>
                <Table
                    data={[
                        {
                            key: 'Path',
                            value: this.props.exportData.script.path
                        }
                    ]}
                />
                </CollapseCard>


            </>
        )
    }
}

export default connect(null,{updateArguments})(ScriptModal)