import React from 'react'
import { ModalHeader, ModalBody, Progress } from 'reactstrap';
import Table from '../../../../globalComponents/modals/Table'
import CollapseCard from '../../../../globalComponents/modals/CollapseCard'
import ArgumentsTable from '../../../../globalComponents/modals/ScriptArgumentsTable'




export default (props) => {
    const progress = props.script.progress
    return (
        <>
            <ModalHeader>Script</ModalHeader>
            <ModalBody>
                <Table
                    data={[
                        {
                            key: 'Script Name',
                            value: props.script.name
                        },
                        {
                            key: 'Description',
                            value: props.script.description
                        }
                    ]}
                />
                <Progress value={progress}>{progress}%</Progress>
                <CollapseCard>
                    <Table
                        data={[
                            {
                                key: 'Element ID',
                                value: props.id
                            },
                            {
                                key: 'Script ID',
                                value: props.script.id
                            },
                            {
                                key: 'Path',
                                value: props.script.path
                            },
                            {
                                key: 'Status',
                                value: props.state
                            },
                            {
                                key: 'Error Message',
                                value: props.script.errorMsg,
                                valueStyle: { color: 'red' }
                            },
                        ]}
                    />
                    <ArgumentsTable
                        showUpdateButton
                        data = {props.script.arguments}
                    />
                </CollapseCard>
            </ModalBody>
        </>
    )
}

