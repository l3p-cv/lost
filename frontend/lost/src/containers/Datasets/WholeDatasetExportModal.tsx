import { useState } from 'react'
import { useExportDataset } from '../../actions/dataset/dataset-export-api'
import { DatasetExportsTable } from './DatasetExportsTable'
import { CButton, CForm, CFormCheck, CModal, CModalBody, CModalFooter, CModalHeader, CRow } from '@coreui/react'

interface WholeDatasetExportModalProps {
    isOpen: boolean
    toggle: () => void
    datasetId: number
    datasetName: string
}
export const WholeDatasetExportModal = ({
    isOpen,
    toggle,
    datasetId,
    datasetName,
}: WholeDatasetExportModalProps) => {
    const [annotatedOnly, setAnnotatedOnly] = useState(true)
    const { mutate: startExportDataset } = useExportDataset()

    const handleSubmit = () => {
        startExportDataset({
            datasetId,
            annotatedOnly,
        })
    }

    return (
        <CModal visible={isOpen} size="xl">
            <CModalHeader>Exports for dataset: {datasetName}</CModalHeader>
            <CModalBody>
                <CForm>
                    <CRow>
                        <CFormCheck
                            type="checkbox"
                            label="Annotated Only"
                            checked={annotatedOnly}
                            onChange={(e) => setAnnotatedOnly(e.target.checked)}
                        />
                    </CRow>
                    <CButton color="primary" onClick={handleSubmit} className="mt-2">
                        Generate Export
                    </CButton>
                </CForm>

                <h4 className="text-center">Dataset Exports </h4>
                <DatasetExportsTable datasetId={datasetId} />
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={toggle}>
                    Cancel
                </CButton>
            </CModalFooter>
        </CModal>
    )
}
