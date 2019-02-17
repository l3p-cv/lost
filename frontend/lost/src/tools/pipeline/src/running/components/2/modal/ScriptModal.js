import React, { Component } from 'react'
import { ModalHeader, ModalBody, Progress } from 'reactstrap';


class ScriptModal extends Component {
    renderBody() {
        const progress = this.props.script.progress
        return (
            <>
            <table className="table table-hover">
                <tbody>
                    <tr>
                        <td><strong>Script Name:</strong></td>
                        <td>{this.props.script.name}</td>
                    </tr>
                    <tr>
                        <td><strong>Description:</strong></td>
                        <td>{this.props.script.description}</td>
                    </tr>
                </tbody>
            </table>
            <Progress value={progress}>{progress}%</Progress>
            <table className="table table-hover">
                <tbody>
                    <tr>
                        <td><strong>Element ID:</strong></td>
                        <td>{this.props.id}</td>
                    </tr>
                    <tr>
                        <td><strong>Script ID:</strong></td>
                        <td>{this.props.script.id}</td>
                    </tr>
                    <tr>
                        <td><strong>Path:</strong></td>
                        <td>{this.props.script.path}</td>
                    </tr>
                    <tr>
                        <td><strong>Status:</strong></td>
                        <td>{this.props.state}</td>
                    </tr>
                    {this.renderErrorMessage()}
                </tbody>
            </table>
            {this.renderArgumentTable()}
            </>
    )
    }

    renderErrorMessage() {
        if (this.props.script.errorMsg) {
            return (
                <tr>
                    <td><strong>Error Message:</strong></td>
                    <td>{this.props.script.errorMsg}</td>
                </tr>
            )
        }
    }
    renderArgumentTable(){
        return (
            <div style={{marginLeft: 15, marginRight: 15}}>
                <table className="table table-bordered">
                    <thead>
                        <tr><th>Key</th><th>Value</th></tr>
                    </thead>
                    <tbody>
                       {Object.keys(this.props.script.arguments).map((key)=>{
                           return(
                           <tr>
                               <th>{key}</th>
                               <td><input className="form-control" data-ref="polygon" value={key} disabled/></td>
                            </tr>
                            )
                       })}
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        return ([
            <ModalHeader>Script</ModalHeader>,
            <ModalBody>
                {this.renderBody()}
            </ModalBody>
        ]
        )
    }
}

export default ScriptModal