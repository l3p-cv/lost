import { useCallback } from 'react'
import { connect } from 'react-redux'
import actions from '../../../../../../actions/pipeline/pipelineStartModals/script'
import CollapseCard from '../../../../globalComponents/modals/CollapseCard'
import ArgumentsTable from '../../../../globalComponents/modals/ScriptArgumentsTable'
import Table from '../../../../globalComponents/modals/Table'

const { updateArguments } = actions

const ScriptModal = ({ exportData, peN, updateArguments }) => {
    const argumentTableOnInput = useCallback(
        (e) => {
            const arg = { ...exportData.script.arguments }
            const key = e.target.getAttribute('data-ref')
            const value = e.target.value
            arg[key].value = value
            updateArguments(peN, arg)
        },
        [exportData.script.arguments, peN, updateArguments],
    )

    return (
        <>
            <Table
                data={[
                    {
                        key: 'Script Name',
                        value: exportData.script.name,
                    },
                    {
                        key: 'Description',
                        value: exportData.script.description,
                    },
                ]}
            />
            <ArgumentsTable
                onInput={argumentTableOnInput}
                data={exportData.script.arguments}
            />
            <CollapseCard>
                <Table
                    data={[
                        {
                            key: 'Path',
                            value: exportData.script.path,
                        },
                    ]}
                />
            </CollapseCard>
        </>
    )
}

export default connect(null, { updateArguments })(ScriptModal)
