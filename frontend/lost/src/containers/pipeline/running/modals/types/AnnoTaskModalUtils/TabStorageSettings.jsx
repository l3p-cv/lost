import { CCol, CContainer, CRow } from '@coreui/react'
import { faBoxesPacking } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import * as annoTaskApi from '../../../../../../actions/annoTask/anno_task_api'
import * as datasetApi from '../../../../../../actions/dataset/dataset_api'
import HelpButton from '../../../../../../components/HelpButton'
import IconButton from '../../../../../../components/IconButton'
import { showSuccess } from '../../../../../../components/Notification'
import DatasetEditModal from '../../../../../Datasets/DatasetEditModal'
import Select from 'react-select'

const NOTIFICATION_TIMEOUT_MS = 5000

const selectFlatDsFn = (data) => {
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

// const TabStorageSettings = ({ datastoreList }) => {
const TabStorageSettings = ({ annotaskId }) => {
    const { data: flatDatasetList, refetch: reloadFlatDatasetList } =
        datasetApi.useFlatDatasets(selectFlatDsFn)
    const { data: storageSettings, refetch: getStorageSettings } =
        annoTaskApi.useGetStorageSettings(annotaskId)
    const { data: updateStorageSettingsResponse, mutate: updateStorageSettings } =
        annoTaskApi.useUpdateStorageSettings()

    const [selectedDataset, setSelectedDataset] = useState()
    const [isCreateDatasetModalOpen, setIsCreateDatasetModalOpen] = useState(false)

    useEffect(() => {
        getStorageSettings()
    }, [])

    useEffect(() => {
        if (
            storageSettings === undefined ||
            storageSettings === null ||
            flatDatasetList.length === 0
        )
            return

        // handle datasets with no parent
        // -1 -> meta dataset
        const datasetId =
            storageSettings.datasetId === null || storageSettings.datasetId === undefined
                ? '-1'
                : storageSettings.datasetId

        // get the parent dataset with the matching id
        const newSelectedDataset =
            flatDatasetList.filter((dataset) => dataset.value === `${datasetId}`)[0] ||
            flatDatasetList[0]
        setSelectedDataset(newSelectedDataset)
    }, [storageSettings, flatDatasetList])

    useEffect(() => {
        if (updateStorageSettingsResponse === undefined) return

        if (updateStorageSettingsResponse.status === 200) {
            showSuccess('Dataset changed successfully', NOTIFICATION_TIMEOUT_MS)
        }
    }, [updateStorageSettingsResponse])

    const updateSelectedDatasetID = (dataset) => {
        const data = {
            annotaskId,
            datasetId: dataset.value,
        }

        updateStorageSettings(data)
        setSelectedDataset(dataset)
    }

    return (
        <>
            <CContainer>
                <CRow style={{ marginLeft: '5px' }}>
                    <CCol sm="6">
                        <CRow xs={{ gutterY: 3 }}>
                            {/* <CCol sm="12">
                            <h4>
                                Destination Datastore
                                <HelpButton
                                    text={`Select the datastore where the annotations are saved after the pipeline has finished.`}
                                />
                            </h4>
                            <CRow>
                                <CCol>
                                    <Dropdown
                                        placeholder='Select Datastore'
                                        fluid
                                        search
                                        selection
                                        multiple={false}
                                        options={datastoreDropdownOptions}
                                        value={selectedDatastoreID}
                                        onChange={(_, data) => {
                                            setSelectedDatastoreID(data.value)
                                        }}
                                    />
                                </CCol>
                            </CRow>
                        </CCol> */}
                            <CCol sm="12">
                                <h4>
                                    Dataset
                                    <HelpButton
                                        text={`Select the dataset where the annotations are linked to.`}
                                    />
                                </h4>
                                <CRow>
                                    <CCol>
                                        {selectedDataset && flatDatasetList && (
                                            <Select
                                                placeholder="Select dataset"
                                                isSearchable
                                                options={flatDatasetList}
                                                defaultValue={selectedDataset}
                                                onChange={(dataset) => {
                                                    updateSelectedDatasetID(dataset)
                                                    setSelectedDataset(dataset)
                                                }}
                                            />
                                        )}
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
            </CContainer>
            <DatasetEditModal
                isVisible={isCreateDatasetModalOpen}
                setIsVisible={setIsCreateDatasetModalOpen}
                flatDatasetList={flatDatasetList}
                onDatasetCreated={(datasetId) => {
                    reloadFlatDatasetList()
                    updateSelectedDatasetID(`${datasetId}`)
                }}
            />
        </>
    )
}

export default TabStorageSettings
