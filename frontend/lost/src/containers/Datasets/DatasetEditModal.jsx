import { CCol, CFormInput, CModal, CModalBody, CModalHeader, CRow } from '@coreui/react'
import { faSave, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import * as datasetApi from '../../actions/dataset/dataset_api'
import IconButton from '../../components/IconButton'
import { showError, showSuccess } from '../../components/Notification'
import FilterableDropdown from '../../components/FilterableDropdown'

const NOTIFICATION_TIMEOUT_MS = 5000

const DatasetEditModal = ({
    isVisible,
    setIsVisible,
    editedDatasetObj = undefined,
    flatDatasetList,
    onDatasetCreated,
}) => {
    const { mutate: createDatasetApi, data: createResponse } =
        datasetApi.useCreateDataset()
    const { mutate: updateDatasetApi, data: updateResponse } =
        datasetApi.useUpdateDataset()
    const { mutate: deleteDataset, data: deleteDatasetResponse } =
        datasetApi.useDeleteDataset()

    const [idx, setIdx] = useState(-1)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [parentDataset, setParentDataset] = useState(undefined)
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
        const options = [
            {
                key: -1,
                value: -1,
                text: 'No parent Dataset',
            },
        ]

        Object.keys(datasetList).forEach((datasetId) => {
            options.push({
                key: datasetId,
                value: datasetId,
                text: datasetList[datasetId],
            })
        })
        setParentDatasetOptions(options)
    }

    useEffect(() => {
        convertDatasetListToDropdownOptions(flatDatasetList)
    }, [flatDatasetList])

    useEffect(() => {
        // only continue if data available
        if (editedDatasetObj === undefined || parentDatasetOptions === undefined) return

        // set idx to -1 when object is empty => creation mode
        setIdx(editedDatasetObj.idx === undefined ? -1 : editedDatasetObj.idx)
        setName(editedDatasetObj.name)
        setDescription(editedDatasetObj.description)

        // handle datasets with no parent
        // -1 -> meta dataset
        const parentId =
            editedDatasetObj.parentId === null || editedDatasetObj.parentId === undefined
                ? -1
                : editedDatasetObj.parentId

        // get the parent dataset with the matching id
        const newParentDataset = parentDatasetOptions.filter(
            (dataset) => dataset.value == parentId,
        )[0]

        setParentDataset(newParentDataset)
    }, [editedDatasetObj, parentDatasetOptions])

    const showApiResponse = (
        apiResponse,
        msgSuccessVerb,
        msgErrorVerb,
        onSuccessCallback,
    ) => {
        if (apiResponse === undefined) return

        const [isSuccessful, response] = apiResponse

        // make sure the type is a boolean
        if (isSuccessful === true) {
            showSuccess(`Dataset ${msgSuccessVerb} successfully`, NOTIFICATION_TIMEOUT_MS)

            // close the modal
            setIsVisible(false)

            if (onSuccessCallback) onSuccessCallback(response)
        } else {
            const errorMessage = response.data
            showError(
                `${errorMessage}: Error ${msgErrorVerb} dataset`,
                NOTIFICATION_TIMEOUT_MS,
            )
        }
    }

    useEffect(() => {
        showApiResponse(createResponse, 'created', 'creating', (response) => {
            onDatasetCreated(response.datasetId)
        })
    }, [createResponse])

    useEffect(() => {
        showApiResponse(updateResponse, 'updated', 'updating')
    }, [updateResponse])

    useEffect(() => {
        showApiResponse(deleteDatasetResponse, 'deleted', 'deleting')
    }, [deleteDatasetResponse])

    const updateDataset = () => {
        const dataset = {
            id: idx,
            name,
            description,
            parentDatasetId: parentDataset.value,
            // datastoreId: parseInt(datastoreId)
        }

        updateDatasetApi(dataset)
    }

    const createDataset = () => {
        const dataset = {
            name,
            description,
            parentDatasetId: parentDataset.value,
            // datastoreId: parseInt(datastoreId)
        }

        createDatasetApi(dataset)
    }

    const showDeleteDatasetConfirmationMessage = () => {
        Swal.fire({
            title: `Do you really want to delete dataset ${name}?`,
            text: 'All children datasets and annotation tasks will be orphaned.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: 'green',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteDataset(idx)
            } else {
            }
        })
    }

    const renderDeleteDatasetButton = () => (
        <IconButton
            isOutline={false}
            color="danger"
            icon={faTrash}
            text="Delete Dataset"
            onClick={() => showDeleteDatasetConfirmationMessage()}
            style={{ marginTop: '15px' }}
        />
    )

    return (
        <CModal
            visible={isVisible}
            backdrop="static"
            size="xl"
            onClose={() => {
                setIsVisible(false)
            }}
        >
            <CModalHeader>{idx === -1 ? 'Add' : 'Edit'} Dataset</CModalHeader>
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
                        <FilterableDropdown
                            items={parentDatasetOptions}
                            selectedItem={parentDataset}
                            onChange={(item) => setParentDataset(item)}
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
                        {idx !== -1 ? renderDeleteDatasetButton() : ''}

                        <IconButton
                            isOutline={false}
                            color="primary"
                            icon={faSave}
                            text={`${idx === -1 ? 'Add' : 'Update'} Dataset`}
                            onClick={() =>
                                idx === -1 ? createDataset() : updateDataset()
                            }
                            style={{ marginTop: '15px', float: 'right' }}
                        />
                    </CCol>
                </CRow>
            </CModalBody>
        </CModal>
    )
}

export default DatasetEditModal
