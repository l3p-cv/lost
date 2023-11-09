import React from 'react'
import AnnoTaskTabs from '../pipeline/running/2/modals/types/AnnoTaskModalUtils/AnnoTaskTabs'
import { CModal, CModalBody, CModalHeader } from '@coreui/react'


const DatasetExportModal = ({ isVisible, setIsVisible, datasetName, description, annoTask, datastoreList, datasetList }) => {

    return (
        <CModal
            visible={isVisible}
            size="xl"
            onClose={() => setIsVisible(false)}
        >
            <CModalHeader>{datasetName} Dataset</CModalHeader>
            <CModalBody>
                <div className="mt-2">
                    {description}
                </div>
                <AnnoTaskTabs
                    annotask={annoTask}
                    datastoreList={datastoreList}
                    datasetList={datasetList}
                    hasChangeUser={false}
                    hasShowLabels={false}
                    hasAdaptConfiguration={false}
                />
            </CModalBody>
        </CModal>
    )
}

export default DatasetExportModal
