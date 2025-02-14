import { CModal, CModalBody, CModalHeader } from '@coreui/react'
import AnnoTaskTabs from '../pipeline/running/modals/types/AnnoTaskModalUtils/AnnoTaskTabs'

const DatasetExportModal = ({
    isVisible,
    setIsVisible,
    datasetName,
    description,
    annoTask,
    datastoreList,
    datasetList,
}) => {
    return (
        <CModal visible={isVisible} size="xl" onClose={() => setIsVisible(false)}>
            <CModalHeader>{datasetName} Dataset</CModalHeader>
            <CModalBody>
                <div className="mt-2">{description}</div>
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
