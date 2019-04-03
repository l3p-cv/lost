import React, {Component} from 'react'
import { ModalHeader, ModalBody } from 'reactstrap';
import Table from 'pipelineGlobalComponents/modals/Table'
import { Button } from 'reactstrap'
import {connect} from 'react-redux'
import actions from 'actions/pipeline/pipelineRunning'
const {downloadDataExport} = actions
class DataExportModal extends Component {
  constructor() {
    super()
    this.download = this.download.bind(this)
  }

  download(e){
    const path = e.target.getAttribute('data-ref')
    this.props.downloadDataExport(path)
  }

  render() {
    return (
      <>
        <ModalHeader>Data Export</ModalHeader>
        <ModalBody>
          <Table
            data={this.props.dataExport.map((el) => {
              const fileName = String(el.file_path.split('/').pop())
              return {
                key: String(el.iteration),
                value: <Button data-ref= {el.file_path} onClick={this.download}>{fileName}</Button>
              }
            })}
          />
        </ModalBody>
      </>
    )
  }
}


export default connect(null,{downloadDataExport})(DataExportModal)