import { CModal, CModalBody, CModalHeader } from '@coreui/react'
import AnnoTaskTabs from '../pipeline/running/modals/types/AnnoTaskModalUtils/AnnoTaskTabs'
import { useState } from 'react'

const DatasetExportModal = ({
    isVisible,
    setIsVisible,
    datasetName,
    description,
    annoTask,
    datastoreList,
    datasetList,
}) => {
    const [activeTaskTab, setActiveTaskTab] = useState(0) // remember which Tab is active
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
                    active={activeTaskTab} // for remembering which tab was opened last
                    setActive={setActiveTaskTab} // see above comment
                />
            </CModalBody>
        </CModal>
    )
}

export default DatasetExportModal
