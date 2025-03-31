import { useState } from 'react'
import {
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap'
import { useExportDataset } from '../../actions/dataset/dataset-export-api'
import { DatasetExportsTable } from './DatasetExportsTable'

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
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>Exports for dataset: {datasetName}</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup check>
                        <Label check>
                            <Input
                                type="checkbox"
                                checked={annotatedOnly}
                                onChange={(e) => setAnnotatedOnly(e.target.checked)}
                            />
                            Annotated Only
                        </Label>
                    </FormGroup>
                    <Button color="primary" onClick={handleSubmit} className="mt-2">
                        Generate Export
                    </Button>
                </Form>

                <h4 className="text-center">Dataset Exports </h4>
                <DatasetExportsTable datasetId={datasetId} />
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    )
}
