import React, {Component} from 'react'
import { ModalHeader, ModalBody } from 'reactstrap';
import Table from '../../../../globalComponents/modals/Table'

import { Button } from 'reactstrap'
import {connect} from 'react-redux'
import actions from '../../../../../../actions/pipeline/pipelineRunning'
import {saveAs}  from 'file-saver';

import axios from 'axios'
import {API_URL} from '../../../../../../lost_settings'

const {downloadDataExport} = actions
class DataExportModal extends Component {
  constructor() {
    super()
    this.state = {
      downloadBlob : undefined
    }
    // this.download = this.download.bind(this)
  }

  download_file(de_id, fileName){
    // axios.post(API_URL+'/data/dataexport', {'de_id':de_id}).then( resp => {
    //   saveAs(resp.data, fileName)
    // })
    fetch(`${API_URL}/data/dataexport/${de_id}`,
    {
        method: 'get',
        headers: new Headers({
            'Authorization': `Bearer ${localStorage.getItem('token')}`, 
        })
    }).then(res => res.blob()).then(blob => saveAs(blob, fileName))
  }

  // download(e){
  //   const path = e.target.getAttribute('data-ref')
  //   this.props.downloadDataExport(path)
  // }

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
                value: <Button onClick={() => this.download_file(el.id, fileName)}>{fileName}</Button>
              }
            })}
          />
        </ModalBody>
      </>
    )
  }
}


export default connect(null,{downloadDataExport})(DataExportModal)