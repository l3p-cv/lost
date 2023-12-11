import React, { useEffect, useState } from 'react'
import { CCol, CModal, CModalBody, CModalHeader, CFormInput, CRow } from '@coreui/react'
import IconButton from '../../components/IconButton'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { Dropdown } from 'semantic-ui-react'
import * as datasetApi from '../../actions/dataset/dataset_api'
import { NotificationManager } from 'react-notifications'

const NOTIFICATION_TIMEOUT_MS = 5000

const DatasetEditModal = ({ isVisible, setIsVisible, editedDatasetObj, flatDatasetList, datastoreList }) => {

    const { mutate: createDatasetApi, data: createResponse } = datasetApi.useCreateDataset()
    const { mutate: updateDatasetApi, data: updateResponse } = datasetApi.useUpdateDataset()

    const [idx, setIdx] = useState(-1)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [parentDatasetId, setParentDatasetId] = useState("-1")
    const [parentDatasetOptions, setParentDatasetOptions] = useState([])
    // const [datastoreId, setDatastoreId] = useState("0")
    // const [datastoreDropdownOptions, setDatastoreDropdownOptions] = useState([])

    // convert the datasource list (id: name) to a list compatible to the Dropdown options
    // const converDatastoreToDropdownOptions = (datastores) => {
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
    //     converDatastoreToDropdownOptions(datastoreList)
    // }, [datastoreList])

    const convertDatasetListToDropdownOptions = (datasetList) => {
        // default entry in case dataset shouldn't have a parent
        const options = [{
            key: "-1",
            value: "-1",
            text: "No parent Dataset"
        }]

        Object.keys(datasetList).forEach((datasetId) => {
            options.push({
                key: datasetId,
                value: datasetId,
                text: datasetList[datasetId]
            })
        })
        setParentDatasetOptions(options)
    }

    useEffect(() => {
        convertDatasetListToDropdownOptions(flatDatasetList)
    }, [flatDatasetList])

    useEffect(() => {
        // only continue if data available
        if (editedDatasetObj === undefined) return

        console.log(editedDatasetObj);

        setIdx(editedDatasetObj.idx)
        setName(editedDatasetObj.name)
        setDescription(editedDatasetObj.description)

        // handle datasets with no parent
        const parentId = (editedDatasetObj.parent_id === null ? -1 : editedDatasetObj.parent_id)

        // convert int to string to be recognized by semantic UIs Dropdown
        setParentDatasetId("" + parentId)
        // setDatastoreId("" + editedDatasetObj.datastore_id)

    }, [editedDatasetObj])

    useEffect(() => {
        // dont show a notification on initialisation
        if (createResponse === undefined) return

        const [isSuccessful, response] = createResponse

        // make sure the type is a boolean
        if (isSuccessful === true) {
            NotificationManager.success(
                "",
                "Dataset created successfully",
                NOTIFICATION_TIMEOUT_MS,
            )

            // close the modal
            setIsVisible(false)
        } else {
            const errorMessage = response.data
            NotificationManager.error(
                errorMessage,
                "Error creating dataset",
                NOTIFICATION_TIMEOUT_MS,
            )
        }
    }, [createResponse, setIsVisible])

    useEffect(() => {
        // dont show a notification on initialisation
        if (updateResponse === undefined) return

        const [isSuccessful, response] = updateResponse

        // make sure the type is a boolean
        if (isSuccessful === true) {
            NotificationManager.success(
                "",
                "Dataset updated successfully",
                NOTIFICATION_TIMEOUT_MS,
            )

            // close the modal
            setIsVisible(false)
        } else {
            const errorMessage = response.data
            NotificationManager.error(
                errorMessage,
                "Error updating dataset",
                NOTIFICATION_TIMEOUT_MS,
            )
        }
    }, [updateResponse, setIsVisible])

    const updateDataset = () => {
        const dataset = {
            id: idx,
            name,
            description,
            parentDatasetId,
            // datastoreId: parseInt(datastoreId)
        }

        updateDatasetApi(dataset)
    }

    const createDataset = () => {
        const dataset = {
            name,
            description,
            parentDatasetId,
            // datastoreId: parseInt(datastoreId)
        }

        createDatasetApi(dataset)
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
                    <CCol sm="2">Parent Dataset</CCol>
                    <CCol sm="6">
                        <Dropdown
                            placeholder='Select Parent Dataset'
                            fluid
                            search
                            selection
                            multiple={false}
                            options={parentDatasetOptions}
                            value={parentDatasetId}
                            onChange={(_, data) => {
                                setParentDatasetId(data.value)
                            }}
                        />
                    </CCol>
                </CRow>
                {/* <CRow>&nbsp;</CRow>
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
                </CRow> */}
                <CRow>
                    <CCol sm="2">&nbsp;</CCol>
                    <CCol sm="6">
                        <IconButton
                            isOutline={false}
                            color="primary"
                            icon={faSave}
                            text="Add Dataset"
                            onClick={() => (idx === -1 ? createDataset() : updateDataset())}
                            style={{ marginTop: '15px', float: 'right' }}
                        />
                    </CCol>
                </CRow>
            </CModalBody>
        </CModal >
    )
}

export default DatasetEditModal
