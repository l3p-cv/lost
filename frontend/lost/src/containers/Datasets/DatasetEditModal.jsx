import { CCol, CFormInput, CModal, CModalBody, CModalHeader, CRow } from '@coreui/react'
import { faSave, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import Select from 'react-select'
import * as datasetApi from '../../actions/dataset/dataset_api'
import IconButton from '../../components/IconButton'
import { showError, showSuccess } from '../../components/Notification'

const NOTIFICATION_TIMEOUT_MS = 5000

const DatasetEditModal = ({
    isVisible,
    setIsVisible,
    editedDatasetObj = undefined,
    flatDatasetList,
    onDatasetCreated,
    onDatasetModified,
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

    useEffect(() => {
        // only continue if data available
        if (editedDatasetObj === undefined || flatDatasetList === undefined) return

        // set idx to -1 when object is empty => creation mode
        setIdx(editedDatasetObj.idx === undefined ? -1 : editedDatasetObj.idx)
        setName(editedDatasetObj.name)
        setDescription(editedDatasetObj.description)

        const parentDataset =
            flatDatasetList.filter(
                (ds) => ds.value == `${editedDatasetObj.parentId}`,
            )[0] || flatDatasetList[0]

        setParentDataset(parentDataset)
    }, [editedDatasetObj])

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
        showApiResponse(updateResponse, 'updated', 'updating', (response) => {
            onDatasetModified(response.datasetId)
        })
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
                        <Select
                            placeholder="Select parent dataset"
                            isSearchable
                            options={flatDatasetList}
                            defaultValue={parentDataset || flatDatasetList[0]}
                            onChange={setParentDataset}
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
