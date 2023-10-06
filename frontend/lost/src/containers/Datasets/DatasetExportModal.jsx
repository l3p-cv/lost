import React from 'react'
import { ModalHeader, ModalBody } from 'reactstrap'
import { faEye, faCircle } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import IconButton from '../../components/IconButton'
import DatasetExportTabs from './DatasetExportTabs'


const DatasetExportModal = ({ name, description, annoTask, datasourceList }) => {
    const navigate = useNavigate()

    return (
        <>
            <ModalHeader>{name} Dataset</ModalHeader>
            <ModalBody>
                <div class="mt-2">
                    {description}
                </div>
                <DatasetExportTabs
                    annotask={annoTask}
                    datasourceList={datasourceList}
                />

                <hr></hr>
                <IconButton
                    icon={faEye}
                    color="primary"
                    // isOutline={false}
                    style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
                    onClick={(e) => {
                        console.log("review anno button clicked");
                        // handleSiaRewiewClick(props, () => {
                        //     navigate(`/sia-review/${props.id}`)
                        // })
                    }}
                    text="Review Annotations"
                />
                <IconButton
                    icon={faCircle}
                    color="danger"
                    style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
                    onClick={(e) => {
                        console.log("Force anno button clicked");
                    }}
                    text="Force Annotation Release"
                />
            </ModalBody>
        </>
    )
}

export default DatasetExportModal
