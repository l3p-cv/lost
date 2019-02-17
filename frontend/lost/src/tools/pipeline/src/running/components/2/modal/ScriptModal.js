import React, { Component } from 'react'
import { ModalHeader, ModalBody, Progress } from 'reactstrap';
import Table from './Table'

class ScriptModal extends Component {
    renderBody() {
        const progress = this.props.script.progress
        return (
            <>
                <Table
                    data={[
                        {
                            key: 'Script Name',
                            value: this.props.script.name
                        },
                        {
                            key: 'Description',
                            value: this.props.script.description
                        }
                    ]}
                />
                <Progress value={progress}>{progress}%</Progress>
                <Table
                    data={[
                        {
                            key: 'Element ID',
                            value: this.props.id
                        },
                        {
                            key: 'Script ID',
                            value: this.props.script.id
                        },
                        {
                            key: 'Path',
                            value: this.props.script.path
                        },
                        {
                            key: 'Status',
                            value: this.props.state
                        },
                        {
                            key: 'Error Message',
                            value: this.props.script.errorMsg,
                            valueStyle: {color: 'red'}
                        },
                    ]}
                />
                {this.renderArgumentTable()}
            </>
        )
    }
    renderArgumentTable() {
        return (
            <div style={{ marginLeft: 15, marginRight: 15 }}>
                <table className="table table-bordered">
                    <thead>
                        <tr><th>Key</th><th>Value</th></tr>
                    </thead>
                    <tbody>
                        {Object.keys(this.props.script.arguments).map((key) => {
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
        )
    }

    render() {
        return (
            <>
                <ModalHeader>Script</ModalHeader>
                <ModalBody>
                    {this.renderBody()}
                </ModalBody>
            </>
        )
    }
}

export default ScriptModal