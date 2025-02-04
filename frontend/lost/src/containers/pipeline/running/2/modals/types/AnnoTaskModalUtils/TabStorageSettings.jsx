import { CCol, CContainer, CRow } from '@coreui/react'
import { faBoxesPacking } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { Dropdown } from 'semantic-ui-react'
import * as annoTaskApi from '../../../../../../../actions/annoTask/anno_task_api'
import * as datasetApi from '../../../../../../../actions/dataset/dataset_api'
import HelpButton from '../../../../../../../components/HelpButton'
import IconButton from '../../../../../../../components/IconButton'
import { showSuccess } from '../../../../../../../components/Notification'
import DatasetEditModal from '../../../../../../Datasets/DatasetEditModal'

const NOTIFICATION_TIMEOUT_MS = 5000

// const TabStorageSettings = ({ datastoreList }) => {
const TabStorageSettings = ({ annotaskId }) => {
    const { data: flatDatasetList, refetch: reloadFlatDatasetList } =
        datasetApi.useFlatDatasets()
    const { data: storageSettings, refetch: getStorageSettings } =
        annoTaskApi.useGetStorageSettings(annotaskId)
    const { data: updateStorageSettingsResponse, mutate: updateStorageSettings } =
        annoTaskApi.useUpdateStorageSettings()

    // const [datastoreDropdownOptions, setDatastoreDropdownOptions] = useState([])
    const [datasetDropdownOptions, setDatasetDropdownOptions] = useState([])

    // const [selectedDatastoreID, setSelectedDatastoreID] = useState("0")
    const [selectedDatasetID, setSelectedDatasetID] = useState()
    const [isCreateDatasetModalOpen, setIsCreateDatasetModalOpen] = useState(false)

    // convert the datasource list (id: name) to a list compatible to the Dropdown options
    // const converDatasourcesToDropdownOptions = (datastores) => {
    //     const options = []
    //     Object.keys(datastores).forEach((datasourceID) => {
    //         options.push({
    //             key: datasourceID,
    //             value: datasourceID,
    //             text: datastores[datasourceID]
    //         })
    //     })
    //     setDatastoreDropdownOptions(options)
    // }

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
        getStorageSettings()
    }, [])

    useEffect(() => {
        if (storageSettings === undefined || storageSettings === null) return

        let datasetId = '-1'
        if (storageSettings.datasetId !== null) datasetId = `${storageSettings.datasetId}`

        setSelectedDatasetID(datasetId)
    }, [storageSettings])

    // useEffect(() => {
    //     converDatasourcesToDropdownOptions(datastoreList)
    // }, [datastoreList])

    useEffect(() => {
        convertDatasetToDropdownOptions(flatDatasetList)
    }, [flatDatasetList])

    useEffect(() => {
        if (updateStorageSettingsResponse === undefined) return

        if (updateStorageSettingsResponse.status === 200) {
            showSuccess('Dataset changed successfully', NOTIFICATION_TIMEOUT_MS)
        }
    }, [updateStorageSettingsResponse])

    const updateSelectedDatasetID = (datasetId) => {
        const data = {
            annotaskId,
            datasetId: datasetId,
        }

        updateStorageSettings(data)
        setSelectedDatasetID(datasetId)
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
                                        <Dropdown
                                            placeholder="Select Dataset"
                                            fluid
                                            search
                                            selection
                                            multiple={false}
                                            options={datasetDropdownOptions}
                                            value={selectedDatasetID}
                                            onChange={(_, data) => {
                                                updateSelectedDatasetID(data.value)
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
