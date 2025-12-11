import { useState } from 'react'
import { useExportDataset } from '../../actions/dataset/dataset-export-api'
import { DatasetExportsTable } from './DatasetExportsTable'
import {
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CRow,
} from '@coreui/react'
import CoreIconButton from '../../components/CoreIconButton'

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
            <CCol>
              <CFormCheck
                type="checkbox"
                label="Annotated Only"
                checked={annotatedOnly}
                onChange={(e) => setAnnotatedOnly(e.target.checked)}
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CoreIconButton
                text="Generate Export"
                onClick={handleSubmit}
                className="mt-2"
              />
            </CCol>
          </CRow>
        </CForm>

        <h4 className="text-center">Dataset Exports </h4>
        <DatasetExportsTable datasetId={datasetId} />
      </CModalBody>
      <CModalFooter>
        <CoreIconButton color="secondary" onClick={toggle} text="Cancel" />
      </CModalFooter>
    </CModal>
  )
}
