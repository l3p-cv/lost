import React, { useEffect, useState } from 'react'
import { CCol, CContainer, CRow } from '@coreui/react'
import IconButton from '../../components/IconButton'
import { faFolderPlus } from '@fortawesome/free-solid-svg-icons'
import DatasetTable from './DatasetTable'
import DatasetExportModal from './DatasetExportModal'
import * as datasetApi from '../../actions/dataset/dataset_api'
import * as annotaskApi from '../../actions/annoTask/anno_task_api'
import DatasetEditModal from './DatasetEditModal'
import { NotificationContainer } from 'react-notifications'


const Datasets = () => {

    const { data: datasetList, refetch: reloadDatasetList } = datasetApi.useDatasets()
    const { data: flatDatasetList, refetch: reloadFlatDatasetList } = datasetApi.useFlatDatasets()

    const { data: datastores } = datasetApi.useDatastoreKeys()
    const { data: annotaskResponse, mutate: loadAnnotask } = annotaskApi.useAnnotask()

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [annotask, setAnnotask] = useState()

    const [editedDatasetObj, setEditedDatasetObj] = useState()

    const openAddDatasetMenu = () => {
        // clear data from previous modal editings
        setEditedDatasetObj({})

        // open modal
        setIsEditModalOpen(true)
    }

    const openEditDatasetMenu = (datasetRowObj) => {
        // only select necessary properties out of row data
        const datasetObj = (({ idx, name, description, parent_id, datastore_id }) => ({ idx, name, description, parent_id, datastore_id }))(datasetRowObj)

        // update data for the editing modal
        setEditedDatasetObj(datasetObj)

        // open modal
        setIsEditModalOpen(true)
    }

    // const openAssignAnnotaskMenu = () => {
    //     console.log("Clicked on assign annotask")
    // }

    const openExportModal = async (idx, isAnnotask) => {
        // set content to selected dataset
        // @TODO
        console.log("openExportModal", idx, isAnnotask);

        if (isAnnotask) {

            // remove previous content (in case request fails)
            setAnnotask(undefined)

            // loadAnnotaskData
            await loadAnnotask(idx)

        } else {
            // loadDatasetData
            // @TODO implement exporting for datasets
            console.log("Export for datasets not implemented yet.")
            return
        }
    }

    // triggered after loadAnnotask response is available
    useEffect(() => {

        // dont open modal at beginning
        if (annotaskResponse === undefined) return

        console.log(annotaskResponse);

        setAnnotask(annotaskResponse)
    }, [annotaskResponse])

    // triggered if loadAnnotask response contained valid data
    useEffect(() => {

        // dont open modal without data
        if (annotask === undefined) return

        console.log(annotask);

        setIsExportModalOpen(true)
    }, [annotask])

    useEffect(() => {
        // update the list after the data has changed (modal closes on API response)
        if (isEditModalOpen === false) {
            reloadDatasetList()
            reloadFlatDatasetList()
        }
    }, [isEditModalOpen, reloadDatasetList, reloadFlatDatasetList])

    return (
        <>
            <DatasetExportModal
                isVisible={isExportModalOpen}
                setIsVisible={setIsExportModalOpen}
                datasetName="Test"
                description="Test"
                annoTask={annotask}
                datastoreList={datastores}
                datasetList={datasetList}
            />
            <DatasetEditModal
                isVisible={isEditModalOpen}
                setIsVisible={setIsEditModalOpen}
                editedDatasetObj={editedDatasetObj}
                flatDatasetList={flatDatasetList}
                datastoreList={datastores}
            />
            <CContainer>
                <CRow>
                    <CCol sm="auto">
                        <IconButton
                            isOutline={false}
                            color="primary"
                            icon={faFolderPlus}
                            text="Add Dataset"
                            onClick={openAddDatasetMenu}
                            style={{ marginTop: '15px' }}
                        />
                    </CCol>
                    {/* <CCol sm="auto">
                        <IconButton
                            isOutline={false}
                            color="primary"
                            icon={faTag}
                            text="Assign Annotasks"
                            onClick={openAssignAnnotaskMenu}
                            style={{ marginTop: '15px' }}
                        />
                    </CCol> */}
                </CRow>
                <CRow>
                    <CCol>
                        <div className="h-4">&nbsp;</div>
                        <DatasetTable
                            datasetList={datasetList}
                            datastores={datastores}
                            onExportButtonClicked={openExportModal}
                            onEditButtonClicked={openEditDatasetMenu}
                        />
                    </CCol>
                </CRow>
            </CContainer>
            <NotificationContainer />
        </>

    )
}

export default Datasets
