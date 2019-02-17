import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Table from './Table'

class DatasourceModal extends Component {
  renderBody() {
    return (
      <Table
        data={[
          { 
            key: 'Type', 
            value: this.props.datasource.type 
          },
          { 
            key: 'Path', 
            value: this.props.datasource.rawFilePath 
          },
          { 
            key: 'Element ID', 
            value: this.props.id
          },
          { 
            key: 'Datasource ID', 
            value: this.props.datasource.id
          },
          ,
          { 
            key: 'Status', 
            value: this.props.state
          }
        ]}
      />
    )
  }
  render() {
    return (
      <>
        <ModalHeader>Datasource</ModalHeader>
        <ModalBody>
          {this.renderBody()}
        </ModalBody>
      </>
    )
  }
}

export default DatasourceModal



