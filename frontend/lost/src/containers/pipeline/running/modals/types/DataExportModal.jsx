import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { saveAs } from 'file-saver'
import { connect } from 'react-redux'
import { ModalBody, ModalHeader } from 'reactstrap'

import ReactTable from 'react-table'
import IconButton from '../../../../../components/IconButton'
import { API_URL } from '../../../../../lost_settings'

const DataExportModal = ({ dataExport }) => {
    const downloadFile = (de_id, fileName) => {
        fetch(`${API_URL}/data/dataexport/${de_id}`, {
            method: 'GET',
            headers: new Headers({
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
        })
            .then((res) => res.blob())
            .then((blob) => saveAs(blob, fileName))
    }

    return (
        <>
            <ModalHeader>Data Export</ModalHeader>
            <ModalBody>
                <ReactTable
                    columns={[
                        {
                            Header: 'Name',
                            accessor: 'file_name',
                            Cell: ({ original }) => {
                                return String(original.file_path.split('/').pop())
                            },
                        },
                        {
                            Header: 'Download',
                            accessor: 'fileName',
                            Cell: ({ original }) => {
                                return (
                                    <IconButton
                                        color="primary"
                                        isOutline={false}
                                        icon={faDownload}
                                        onClick={() =>
                                            downloadFile(
                                                original.id,
                                                String(
                                                    original.file_path.split('/').pop(),
                                                ),
                                            )
                                        }
                                        text={'Download'}
                                    />
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
                    data={dataExport}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />
            </ModalBody>
        </>
    )
}

export default connect(null, {})(DataExportModal)
