import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { useUpdatePipelineArguments } from '../../../../../actions/pipeline/pipeline_api'
import IconButton from '../../../../../components/IconButton'
import CollapseCard from '../../../globalComponents/modals/CollapseCard'
import ArgumentsTable from '../../../globalComponents/modals/ScriptArgumentsTable'
import Table from '../../../globalComponents/modals/Table'
import { CModalBody, CModalHeader, CProgress } from '@coreui/react'

const ScriptModal = (props) => {
    const [scriptArguments, setScriptArguments] = useState(props.script.arguments)
    const progress = props.script.progress

    const { mutate: updatePipelineArguments } = useUpdatePipelineArguments()

    const argumentsOnInput = (e) => {
        const key = e.target.getAttribute('data-ref')
        const value = e.target.value
        setScriptArguments({
            ...scriptArguments,
            [key]: {
                ...scriptArguments[key],
                value,
            },
        })
    }

    return (
        <>
            <CModalHeader>Script</CModalHeader>
            <CModalBody>
                <Table
                    data={[
                        {
                            key: 'Script Name',
                            value: props.script.name,
                        },
                        {
                            key: 'Description',
                            value: props.script.description,
                        },
                        {
                            key: 'Pipe Element ID',
                            value: props.id,
                        },
                    ]}
                />
                <CProgress color='info' value={progress}>
                    {progress}
                </CProgress>
                <CollapseCard>
                    <Table
                        data={[
                            {
                                key: 'Script ID',
                                value: props.script.id,
                            },
                            {
                                key: 'Path',
                                value: props.script.path,
                            },
                            {
                                key: 'Status',
                                value: props.state,
                            },
                            {
                                key: 'Error Message',
                                value: props.script.errorMsg,
                                valueStyle: { color: 'red' },
                            },
                        ]}
                    />
                    <ArgumentsTable
                        showUpdateButton
                        data={scriptArguments}
                        onInput={argumentsOnInput}
                    />
                    <IconButton
                        color="primary"
                        isOutline={false}
                        icon={faCloudUploadAlt}
                        text="Update Arguments"
                        onClick={() =>
                            updatePipelineArguments({
                                elementId: props.id,
                                updatedArguments: scriptArguments,
                            })
                        }
                    />
                </CollapseCard>
            </CModalBody>
        </>
    )
}

export default ScriptModal
