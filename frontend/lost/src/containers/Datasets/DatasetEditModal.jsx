import React, { useEffect, useState } from 'react'
import { CCol, CModal, CModalBody, CModalHeader, CFormInput, CRow } from '@coreui/react'
import IconButton from '../../components/IconButton'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { Dropdown } from 'semantic-ui-react'
import * as datasetApi from '../../actions/dataset/dataset_api'


const DatasetEditModal = ({ isVisible, setIsVisible, editedDatasetObj, datastoreList }) => {

    const { mutate: updateDatasetList } = datasetApi.useUpdateDataset()

    const [idx, setIdx] = useState(-1)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [datastoreId, setDatastoreId] = useState("0")
    const [datastoreDropdownOptions, setDatastoreDropdownOptions] = useState([])

    // convert the datasource list (id: name) to a list compatible to the Dropdown options
    const converDatastoreToDropdownOptions = (datastores) => {
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

    useEffect(() => {
        converDatastoreToDropdownOptions(datastoreList)
    }, [datastoreList])

    useEffect(() => {
        // only continue if data available
        if (editedDatasetObj === undefined) return

        setIdx(editedDatasetObj.idx)
        setName(editedDatasetObj.name)
        setDescription(editedDatasetObj.description)

        // convert int to string to be recognized by semantic UIs Dropdown
        setDatastoreId("" + editedDatasetObj.datastore_id)

    }, [editedDatasetObj])

    const updateDataset = () => {
        const dataset = {
            id: idx,
            name,
            description,
            datastoreId: parseInt(datastoreId)
        }

        updateDatasetList(dataset)
    }

    return (
        <CModal
            visible={isVisible}
            size="xl"
            onClose={() => { setIsVisible(false) }}
        >
            <CModalHeader>{idx === -1 ? "Add" : "Edit"} Dataset</CModalHeader>
            <CModalBody>
                <CRow>
                    <CCol sm="2">Name</CCol>
                    <CCol sm="6">
                        <CFormInput
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </CCol>
                </CRow>
                <CRow>&nbsp;</CRow>
                <CRow>
                    <CCol sm="2">Description</CCol>
                    <CCol sm="6">
                        <CFormInput
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </CCol>
                </CRow>
                <CRow>&nbsp;</CRow>
                <CRow>
                    <CCol sm="2">Datastore</CCol>
                    <CCol sm="6">
                        <Dropdown
                            placeholder='Select Datastore'
                            fluid
                            search
                            selection
                            multiple={false}
                            options={datastoreDropdownOptions}
                            value={datastoreId}
                            onChange={(_, data) => {
                                setDatastoreId(data.value)
                            }}
                        />
                    </CCol>
                </CRow>
                <CRow>
                    <CCol sm="2">&nbsp;</CCol>
                    <CCol sm="6">
                        <IconButton
                            isOutline={false}
                            color="primary"
                            icon={faSave}
                            text="Add Dataset"
                            onClick={updateDataset}
                            style={{ marginTop: '15px', float: 'right' }}
                        />
                    </CCol>
                </CRow>
            </CModalBody>
        </CModal >
    )
}

export default DatasetEditModal
