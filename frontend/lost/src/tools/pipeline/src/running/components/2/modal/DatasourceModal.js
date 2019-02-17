import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


class DatasourceModal extends Component {
  renderBody() {
    return (
      <table className="table table-hover">
        <tbody>
          <tr>
            <td><strong>Type:</strong></td>
            <td>{this.props.datasource.type}</td>
          </tr>
          <tr>
            <td><strong>Path:</strong></td>
            <td>{this.props.datasource.rawFilePath}</td>
          </tr>
          <tr>
            <td><strong>Element ID:</strong></td>
            <td>{this.props.id}</td>
          </tr>
          <tr>
            <td><strong>Datasource ID:</strong></td>
            <td>{this.props.datasource.id}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td>{this.props.state}</td>
          </tr>
        </tbody>
      </table>
    )
  }
  render() {
    return ([
      <ModalHeader>Datasource</ModalHeader>,
      <ModalBody>
        {this.renderBody()}
      </ModalBody>
    ]
    )
  }
}

export default DatasourceModal



