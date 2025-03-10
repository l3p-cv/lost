import { CCol, CRow } from '@coreui/react'
import { faBoxesPacking } from '@fortawesome/free-solid-svg-icons'
import { useNodesData, useReactFlow } from '@xyflow/react'
import { useState } from 'react'
import Select from 'react-select'
import { Form, FormGroup, Label } from 'reactstrap'
import * as datasetApi from '../../../../../../actions/dataset/dataset_api'
import HelpButton from '../../../../../../components/HelpButton'
import IconButton from '../../../../../../components/IconButton'
import DatasetEditModal from '../../../../../Datasets/DatasetEditModal'
import { AnnoTaskNodeData } from '../../../nodes'

interface SelectStorageSettingsProps {
    nodeId: string
}

const selectFn = (data) => {
    return [
        {
            value: '-1',
            label: 'No Dataset',
        },
        ...Object.keys(data).map((key) => ({
            value: key,
            label: data[key],
        })),
    ]
}

export const SelectStorageSettings = ({ nodeId }: SelectStorageSettingsProps) => {
    const nodeData = useNodesData(nodeId)
    const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData

    const { updateNodeData } = useReactFlow()

    const {
        data: flatDatasetList,
        refetch: reloadFlatDatasetList,
        isFetching,
        isLoading,
        isError,
    } = datasetApi.useFlatDatasets(selectFn)

    const [isCreateDatasetModalOpen, setIsCreateDatasetModalOpen] = useState(false)

    if (isLoading || isFetching) {
        return <p>Loading...</p>
    }

    if (isError) {
        return <p>Error when loading datasets.</p>
    }

    return (
        flatDatasetList && (
            <>
                <h4 className="mb-3 text-center">Dataset Selection</h4>

                <CRow className="justify-content-center">
                    <CCol sm="6">
                        <Form onSubmit={(e) => e.preventDefault()}>
                            <FormGroup>
                                <Label for="dataset" className="text-start">
                                    Dataset
                                </Label>

                                <HelpButton
                                    text={`Select the dataset where the annotations are linked to.`}
                                />

                                <CRow>
                                    <CCol>
                                        <Select
                                            placeholder="Select Dataset"
                                            isSearchable
                                            options={flatDatasetList}
                                            defaultValue={
                                                annoTaskNodeData.selectedDataset ||
                                                flatDatasetList[0]
                                            }
                                            onChange={(selectedOption) => {
                                                updateNodeData(nodeId, {
                                                    selectedDataset: selectedOption,
                                                })
                                            }}
                                        />
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol>
                                        <IconButton
                                            isOutline={false}
                                            color="primary"
                                            icon={faBoxesPacking}
                                            text="Create new dataset"
                                            onClick={() => {
                                                setIsCreateDatasetModalOpen(true)
                                            }}
                                            className="mt-2"
                                        />
                                    </CCol>
                                </CRow>
                            </FormGroup>
                        </Form>
                    </CCol>
                </CRow>
                <DatasetEditModal
                    isVisible={isCreateDatasetModalOpen}
                    setIsVisible={setIsCreateDatasetModalOpen}
                    flatDatasetList={flatDatasetList}
                    onDatasetCreated={() => {
                        reloadFlatDatasetList()
                    }}
                />
            </>
        )
    )
}
