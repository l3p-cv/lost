import React, { useEffect, useState } from 'react'
import { CCol, CContainer, CRow } from '@coreui/react'
import HelpButton from '../../../../../../../components/HelpButton'
import { Dropdown } from 'semantic-ui-react'

const TabStorageSettings = ({ datasetList, datastoreList }) => {

    const [datastoreDropdownOptions, setDatastoreDropdownOptions] = useState([])
    const [datasetDropdownOptions, setDatasetDropdownOptions] = useState([])

    const [selectedDatastoreID, setSelectedDatastoreID] = useState("0")
    const [selectedDatasetID, setSelectedDatasetID] = useState(0)


    // convert the datasource list (id: name) to a list compatible to the Dropdown options
    const converDatasourcesToDropdownOptions = (datastores) => {
        const options = []
        Object.keys(datastores).forEach((datasourceID) => {
            options.push({
                key: datasourceID,
                value: datasourceID,
                text: datastores[datasourceID]
            })
        })
        setDatastoreDropdownOptions(options)
    }

    const convertDatasetToDropdownOptions = (datasets) => {
        const options = []
        datasets.forEach((dataset) => {
            options.push({
                key: dataset.id,
                value: dataset.id,
                text: dataset.name
            })
        })
        setDatasetDropdownOptions(options)
    }

    useEffect(() => {
        converDatasourcesToDropdownOptions(datastoreList)
    }, [datastoreList])

    useEffect(() => {
        convertDatasetToDropdownOptions(datasetList);
    }, [datasetList])

    return (
        <CContainer>
            <CRow style={{ marginLeft: '5px' }}>
                <CCol sm="6">
                    <CRow xs={{ gutterY: 3 }}>
                        <CCol sm="12">
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
                        </CCol>
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
                        </CCol>
                    </CRow>
                </CCol>
            </CRow>
        </CContainer>
    )
}

export default TabStorageSettings
