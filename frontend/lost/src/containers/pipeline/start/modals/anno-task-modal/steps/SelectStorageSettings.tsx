import { CCol, CContainer, CRow } from '@coreui/react'
import { faBoxesPacking } from '@fortawesome/free-solid-svg-icons'
import { useNodesData, useReactFlow } from '@xyflow/react'
import { useEffect, useState } from 'react'
import { Dropdown } from 'semantic-ui-react'
import * as datasetApi from '../../../../../../actions/dataset/dataset_api'
import HelpButton from '../../../../../../components/HelpButton'
import IconButton from '../../../../../../components/IconButton'
import DatasetEditModal from '../../../../../Datasets/DatasetEditModal'
import { AnnoTaskNodeData } from '../../../nodes'

interface SelectStorageSettingsProps {
    nodeId: string
}

export const SelectStorageSettings = ({ nodeId }: SelectStorageSettingsProps) => {
    const nodeData = useNodesData(nodeId)
    const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData

    const { updateNodeData } = useReactFlow()

    const { data: flatDatasetList, refetch: reloadFlatDatasetList } =
        datasetApi.useFlatDatasets()

    const [isCreateDatasetModalOpen, setIsCreateDatasetModalOpen] = useState(false)
    const [datasetDropdownOptions, setDatasetDropdownOptions] = useState<object[]>([])

    const convertDatasetToDropdownOptions = (datasets) => {
        const options = [
            {
                key: '-1',
                value: '-1',
                text: 'No Dataset',
            },
        ]

        Object.keys(datasets).forEach((datasetId) => {
            options.push({
                key: datasetId,
                value: datasetId,
                text: datasets[datasetId],
            })
        })
        setDatasetDropdownOptions(options)
    }

    useEffect(() => {
        convertDatasetToDropdownOptions(flatDatasetList)
    }, [flatDatasetList])

    return (
        <>
            <h4 className="mb-3 text-center">Dataset Selection</h4>

            <CContainer>
                <CRow style={{ marginLeft: '5px' }}>
                    <CCol sm="6">
                        <CRow xs={{ gutterY: 3 }}>
                            <CCol sm="12">
                                <h4>
                                    Dataset
                                    <HelpButton
                                        text={`Select the dataset where the annotations are linked to.`}
                                    />
                                </h4>
                                <CRow>
                                    <CCol>
                                        <Dropdown
                                            placeholder="Select Dataset"
                                            fluid
                                            search
                                            selection
                                            multiple={false}
                                            options={datasetDropdownOptions}
                                            value={annoTaskNodeData.selectedDatasetId}
                                            onChange={(_, data) => {
                                                updateNodeData(nodeId, {
                                                    selectedDatasetId:
                                                        data.value as string,
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
                            </CCol>
                        </CRow>
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
            </CContainer>
        </>
    )
}
