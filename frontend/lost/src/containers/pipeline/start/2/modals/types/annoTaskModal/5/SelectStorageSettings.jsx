import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { CCol, CContainer, CRow } from '@coreui/react'
import { Dropdown } from 'semantic-ui-react'
import { NotificationContainer } from 'react-notifications'
import HelpButton from '../../../../../../../../components/HelpButton'
import * as datasetApi from '../../../../../../../../actions/dataset/dataset_api'
import actions from '../../../../../../../../actions/pipeline/pipelineStartModals/annoTask'
import DatasetEditModal from '../../../../../../../Datasets/DatasetEditModal'
import IconButton from '../../../../../../../../components/IconButton'
import { faBoxesPacking } from '@fortawesome/free-solid-svg-icons'

const { setStorageSettings } = actions

// const SelectStorageSettings = ({ datasetList, datastoreList }) => {
const SelectStorageSettings = ({ peN, setStorageSettings }) => {

    const { data: flatDatasetList, refetch: reloadFlatDatasetList } = datasetApi.useFlatDatasets()

    const [isCreateDatasetModalOpen, setIsCreateDatasetModalOpen] = useState(false)
    // const [datastoreDropdownOptions, setDatastoreDropdownOptions] = useState([])
    const [datasetDropdownOptions, setDatasetDropdownOptions] = useState([])

    // const [selectedDatastoreID, setSelectedDatastoreID] = useState("0")
    const [selectedDatasetID, setSelectedDatasetID] = useState("-1")

    useEffect(() => {
        setStorageSettings(selectedDatasetID, peN)
    }, [selectedDatasetID])

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

    // useEffect(() => {
    //     converDatasourcesToDropdownOptions(datastoreList)
    // }, [datastoreList])

    const convertDatasetToDropdownOptions = (datasets) => {
        const options = [{
            key: "-1",
            value: "-1",
            text: "No Dataset"
        }]

        Object.keys(datasets).forEach((datasetId) => {
            options.push({
                key: datasetId,
                value: datasetId,
                text: datasets[datasetId]
            })
        })
        setDatasetDropdownOptions(options)
    }

    useEffect(() => {
        convertDatasetToDropdownOptions(flatDatasetList);
    }, [flatDatasetList])

    return (
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
                                        placeholder='Select Datasource'
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
                                        placeholder='Select Dataset'
                                        fluid
                                        search
                                        selection
                                        multiple={false}
                                        options={datasetDropdownOptions}
                                        value={selectedDatasetID}
                                        onChange={(_, data) => {
                                            setSelectedDatasetID(data.value)
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
                                        onClick={() => { setIsCreateDatasetModalOpen(true) }}
                                        className="mt-2"
                                    />
                                </CCol>
                            </CRow>
                        </CCol>
                    </CRow>
                </CCol>
            </CRow>
            <NotificationContainer />
            <DatasetEditModal
                isVisible={isCreateDatasetModalOpen}
                setIsVisible={setIsCreateDatasetModalOpen}
                flatDatasetList={flatDatasetList}
                onDatasetCreated={(datasetId) => {
                    reloadFlatDatasetList()
                    setSelectedDatasetID(`${datasetId}`)
                }}
            />
        </CContainer>
    )
}

export default connect(null, { setStorageSettings })(SelectStorageSettings)