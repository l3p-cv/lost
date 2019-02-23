import React from 'react'
import { ModalHeader, ModalBody, Progress } from 'reactstrap';
import Table from '../../../../forAllComponents/modals/Table'
import CollapseCard from '../../../../forAllComponents/modals/CollapseCard'
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
                    {/* Argument Table */}
                    <div style={{ marginLeft: 15, marginRight: 15 }}>
                        <table className="table table-bordered">
                            <thead>
                                <tr><th>Key</th><th>Value</th></tr>
                            </thead>
                            <tbody>
                                {Object.keys(props.script.arguments).map((key) => {
                                    return (
                                        <tr key={key}>
                                            <th>{key}</th>
                                            <td><input className="form-control" data-ref="polygon" value={key} disabled /></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CollapseCard>
            </ModalBody>
        </>
    )
}

