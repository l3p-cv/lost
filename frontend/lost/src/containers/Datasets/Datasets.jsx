import { CCol, CContainer, CRow } from '@coreui/react'
import { faFolderPlus } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useToggle } from 'react-use'
import * as annotaskApi from '../../actions/annoTask/anno_task_api'
import * as datasetApi from '../../actions/dataset/dataset_api'
import IconButton from '../../components/IconButton'
import DatasetEditModal from './DatasetEditModal'
import DatasetExportModal from './DatasetExportModal'
import DatasetTable from './DatasetTable'
import { WholeDatasetExportModal } from './WholeDatasetExportModal'
import BaseContainer from '../../components/BaseContainer'

const Datasets = () => {
    // const { data: datasetList, refetch: reloadDatasetList } = datasetApi.useDatasets()
    const { data: flatDatasetList, refetch: reloadFlatDatasetList } =
        datasetApi.useFlatDatasets()

    const { data: datastores } = datasetApi.useDatastoreKeys()
    const { data: annotaskResponse, mutate: loadAnnotask } = annotaskApi.useAnnotask()

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [annotask, setAnnotask] = useState()
    const [datasetId, setDatasetId] = useState()
    const [datasetName, setDatasetName] = useState()
    const [isWholeDatasetModalOpen, toggleWholeDatasetModal] = useToggle(false)

    const [editedDatasetObj, setEditedDatasetObj] = useState()

    // new stuff
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(0)
    const [pageCount, setPageCount] = useState(0) //(null)
    const [lastRequestedPage, setLastRequestedPage] = useState(0)
    const [datatableInfo, setDatatableInfo] = useState()
    const [dSData, setDSData] = useState([])
    // TODO: use isError
    const { data, isError, isLoading, refetch: reloadFlatDatasetListPaged } = datasetApi.useDatasetsPaged(page, pageSize)

    useEffect(() => {
        if (data && page === lastRequestedPage) {
            setPageCount(data.pages)
            setDSData(data.datasets)
        }
        if (isLoading && !dSData) {
            setDSData([])
        }
    }, [data, lastRequestedPage])

    useEffect(() => {
        if (datatableInfo) {
            setPageSize(datatableInfo.pageSize)
            setPage(datatableInfo.page)
        }
    }, [datatableInfo])



    const openAddDatasetMenu = () => {
        // clear data from previous modal editings
        setEditedDatasetObj({})

        // open modal
        setIsEditModalOpen(true)
    }

    const openEditDatasetMenu = (datasetRowObj) => {
        // only select necessary properties out of row data
        const datasetObj = (({ idx, name, description, parent_id, datastore_id }) => ({
            idx,
            name,
            description,
            parent_id,
            datastore_id,
        }))(datasetRowObj)

        // update data for the editing modal
        setEditedDatasetObj(datasetObj)

        // open modal
        setIsEditModalOpen(true)
    }

    // const openAssignAnnotaskMenu = () => {
    //     console.log("Clicked on assign annotask")
    // }

    const openExportModal = async (idx, isAnnotask, name, description) => {
        // set content to selected dataset
        // @TODO
        // console.log('openExportModal', idx, isAnnotask, name, description)

        if (isAnnotask) {
            // remove previous content (in case request fails)
            setAnnotask(undefined)

            // loadAnnotaskData
            await loadAnnotask(idx)
        } else {
            setDatasetId(parseInt(idx))
            setDatasetName(name)
            toggleWholeDatasetModal()
        }
    }

    // triggered after loadAnnotask response is available
    useEffect(() => {
        // dont open modal at beginning
        if (annotaskResponse === undefined) return

        // console.log(annotaskResponse)

        setAnnotask(annotaskResponse)
    }, [annotaskResponse])

    // triggered if loadAnnotask response contained valid data
    useEffect(() => {
        // dont open modal without data
        if (annotask === undefined) return

        // console.log(annotask)

        setIsExportModalOpen(true)
    }, [annotask])

    useEffect(() => {
        // update the list after the data has changed (modal closes on API response)
        if (isEditModalOpen === false) {
            reloadFlatDatasetListPaged()
            reloadFlatDatasetList()
        }
    }, [isEditModalOpen, reloadFlatDatasetListPaged, reloadFlatDatasetList])
    return (
        <>
            <DatasetExportModal
                isVisible={isExportModalOpen}
                setIsVisible={setIsExportModalOpen}
                datasetName="Test"
                description="Test"
                annoTask={annotask}
            // datastoreList={datastores}
            // datasetList={datasetList}
            />
            <DatasetEditModal
                isVisible={isEditModalOpen}
                setIsVisible={setIsEditModalOpen}
                editedDatasetObj={editedDatasetObj}
                flatDatasetList={flatDatasetList}
                // datastoreList={datastores} // not used as of now
                // onDatasetCreated={reloadDatasetList}
                onDatasetCreated={reloadFlatDatasetListPaged}
            />

            <WholeDatasetExportModal
                isOpen={isWholeDatasetModalOpen}
                toggle={toggleWholeDatasetModal}
                datasetId={datasetId}
                datasetName={datasetName}
            />

            <CContainer style={{ marginTop: '15px' }}>
                <h3 className="card-title mb-3" style={{ textAlign: 'center' }}>
                    Datasets
                </h3>
                <CRow>
                    <CCol sm="auto">
                        <IconButton
                            isOutline={true}
                            color="success"
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
                        <BaseContainer>
                            <DatasetTable
                                datasetList={dSData}
                                datastores={datastores}
                                onExportButtonClicked={openExportModal}
                                onEditButtonClicked={openEditDatasetMenu}
                                page={page}
                                pageCount={pageCount}
                                setLastRequestedPage={setLastRequestedPage}
                                setDatatableInfo={setDatatableInfo}
                            />
                        </BaseContainer>
                    </CCol>
                </CRow>
            </CContainer>
        </>
    )
}

export default Datasets
