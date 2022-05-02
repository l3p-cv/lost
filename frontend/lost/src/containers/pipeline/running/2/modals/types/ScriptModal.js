import React, { useEffect, useState } from 'react'
import { ModalHeader, ModalBody, Progress } from 'reactstrap'
import Table from '../../../../globalComponents/modals/Table'
import CollapseCard from '../../../../globalComponents/modals/CollapseCard'
import ArgumentsTable from '../../../../globalComponents/modals/ScriptArgumentsTable'
import pipelineActions from '../../../../../../actions/pipeline/pipelineRunning'
import { useDispatch, useSelector } from 'react-redux'
import IconButton from '../../../../../../components/IconButton'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import * as Notification from '../../../../../../components/Notification'

export default (props) => {
    const dispatch = useDispatch()
    const updateArgumentsRequestStatus = useSelector(
        (state) => state.pipelineRunning.step1Data.updateArgumentsRequestStatus,
    )
    const [scriptArguments, setScriptArguments] = useState(props.script.arguments)
    const progress = props.script.progress
    useEffect(() => {
        const notifcationText = 'Updated Arguments.'
        Notification.handling(
            updateArgumentsRequestStatus,
            props.state === 'pending'
                ? notifcationText
                : `${notifcationText} Effect only in next Iteration`,
        )
    }, [updateArgumentsRequestStatus])

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
    const updateArguments = async () => {
        dispatch(pipelineActions.updateArguments(props.id, scriptArguments))
    }
    return (
        <>
            <ModalHeader>Script</ModalHeader>
            <ModalBody>
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
                <Progress style={{ marginBottom: '20px' }} value={progress}>
                    {progress}%
                </Progress>
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
                        onClick={updateArguments}
                    />
                </CollapseCard>
            </ModalBody>
        </>
    )
}
