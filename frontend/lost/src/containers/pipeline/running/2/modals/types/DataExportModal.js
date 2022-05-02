import React, { Component } from 'react'
import { ModalHeader, ModalBody } from 'reactstrap'
import Table from '../../../../globalComponents/modals/Table'

import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'
import actions from '../../../../../../actions/pipeline/pipelineRunning'
import { saveAs } from 'file-saver'

import { API_URL } from '../../../../../../lost_settings'
import IconButton from '../../../../../../components/IconButton'
import ReactTable from 'react-table'

const { downloadDataExport } = actions
class DataExportModal extends Component {
    constructor() {
        super()
        this.state = {
            downloadBlob: undefined,
        }
        // this.download = this.download.bind(this)
    }

    download_file(de_id, fileName) {
        // axios.post(API_URL+'/data/dataexport', {'de_id':de_id}).then( resp => {
        //   saveAs(resp.data, fileName)
        // })
        fetch(`${API_URL}/data/dataexport/${de_id}`, {
            method: 'get',
            headers: new Headers({
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
        })
            .then((res) => res.blob())
            .then((blob) => saveAs(blob, fileName))
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
                    <ReactTable
                        columns={[
                            {
                                Header: 'Name',
                                accessor: 'file_name',
                                Cell: (row) => {
                                    return String(row.original.file_path.split('/').pop())
                                },
                            },
                            // {
                            //     Header: 'Pipeline Iteration',
                            //     accessor: 'iteration',
                            // },
                            {
                                Header: 'Download',
                                accessor: 'fileName',
                                Cell: (row) => {
                                    return (
                                        <IconButton
                                            color="primary"
                                            isOutline={false}
                                            icon={faDownload}
                                            onClick={() =>
                                                this.download_file(
                                                    row.original.id,
                                                    String(
                                                        row.original.file_path
                                                            .split('/')
                                                            .pop(),
                                                    ),
                                                )
                                            }
                                            text={'Download'}
                                        ></IconButton>
                                    )
                                },
                            },
                        ]}
                        defaultSorted={[
                            {
                                id: 'fileName',
                                desc: true,
                            },
                        ]}
                        data={this.props.dataExport}
                        defaultPageSize={10}
                        className="-striped -highlight"
                    />
                </ModalBody>
            </>
        )
    }
}

export default connect(null, { downloadDataExport })(DataExportModal)
