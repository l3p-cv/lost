import {
    faEdit,
    faFolderOpen,
    faTimes,
    faTrash,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import BaseModal from '../../components/BaseModal'
import Datatable from '../../components/Datatable'
import LostFileBrowser from '../../components/FileBrowser/LostFileBrowser'
import IconButton from '../../components/IconButton'
import * as Notification from '../../components/Notification'
import EditDSModal from './EditDSModal'
// import { deleteFs } from '../../access/fb'
import { CBadge, CCol, CRow } from '@coreui/react'
import * as fbAPI from '../../actions/fb/fb_api'
import BaseContainer from '../../components/BaseContainer'

export const DSTable = ({ visLevel }) => {
    const [isNewDS, setIsNewDS] = useState(false)
    // const [fsList, setFSList] = useState([])
    // const [possibleFsTypes, setPossibleFsTypes] = useState([])
    const userName = localStorage.getItem('username') || ''
    const defaultDsName = 'default'
    const [browseOpen, setBrowseOpen] = useState(false)
    const [fs, setFs] = useState()
    const { mutate: getFSListNew, data: fsList } = fbAPI.useGetFSList()
    const { mutate: getFullFs, data: fullFs } = fbAPI.useGetFullFs()
    const { mutate: getPossibleFsTypes, data: possibleFsTypes } =
        fbAPI.useGetPossibleFsTypes()
    const {
        mutate: deleteFs,
        status: deleteStatus,
        error: deleteErrorData,
    } = fbAPI.useDeleteFs()

    function fetchData() {
        // setFSList(await getFSList(visLevel))
        getFSListNew(visLevel)
        // setPossibleFsTypes(await getPossibleFsTypes())
        getPossibleFsTypes()
    }

    function deleteSelectedFs(row) {
        deleteFs(row)
    }

    useEffect(() => {
        fetchData()
        // const interval = setInterval(fetchData, 1000)
        // return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (deleteStatus === 'success') {
            fetchData()
            Notification.showSuccess('Deletion successfull!')
        } else if (deleteStatus === 'error') {
            Notification.showError(`Error while deleting Datasource!\n${deleteErrorData}`)
        }
    }, [deleteStatus])

    useEffect(() => {}, [possibleFsTypes])
    // control modal close
    const [isDsEditOpenControl, setIsDsEditOpenControl] = useState(false)
    const [selectedDs, setSelectedDs] = useState()
    // only close modal when animation finished
    const [isDsEditOpenView, setIsDsEditOpenView] = useState(false)

    const createNewDS = () => {
        setIsNewDS(true)
        setSelectedDs(undefined)
        openEditDSModal()
    }

    const handleEditDs = (row) => {
        setSelectedDs(row.id)
        openEditDSModal()
    }

    // useEffect(() => {
    //     getUsers()
    // }, [])

    const openEditDSModal = () => {
        setIsDsEditOpenControl(true)
        setIsDsEditOpenView(true)
    }

    // const editClick = ({ row }) => {
    //     setIsNewDS(false)
    //     setSelectedUser(users.filter((el) => el.user_name === row.user_name))

    //     openEditDSModal()
    // }

    // const deleteClick = (row) => {
    //     dispatch(actions.deleteUser(row.original.idx))
    // }

    const closeModal = () => {
        setIsDsEditOpenControl(false)
        // getUsers()
    }
    const onClosedModal = () => {
        setIsDsEditOpenView(false)
        fetchData()
    }

    const onDeleteDs = (row) => {
        Notification.showDecision({
            title: 'Do you really want to delete datasource?',
            option1: {
                text: 'YES',
                callback: () => {
                    deleteSelectedFs(row)
                },
            },
            option2: {
                text: 'NO!',
                callback: () => {},
            },
        })
    }

    const onEditDs = (row) => {
        Notification.showDecision({
            title: 'Editing datasources can lead to data inconsistency. Take care!',
            option1: {
                text: 'Ok',
                callback: () => {
                    handleEditDs(row)
                },
            },
            option2: {
                text: 'Cancel',
                callback: () => {},
            },
        })
    }

    const onOpenFileBrowser = (row) => {
        const fs = {
            id: row.id,
        }
        getFullFs(fs)
        setBrowseOpen(true)
    }
    const checkEditable = (row) => {
        if (row.name === userName) {
            return true
        }
        if (row.name === defaultDsName) {
            return true
        }
        if (row.groupId === null) {
            if (visLevel !== 'global') {
                return true
            }
        }
        return false
    }

    return (
        <>
            <BaseModal
                isOpen={browseOpen}
                title="Browse Files"
                toggle={() => setBrowseOpen(!browseOpen)}
                // onClosed={onClosed}
                footer={
                    <>
                        <IconButton
                            isOutline={false}
                            icon={faTimes}
                            color="secondary"
                            text="Close"
                            onClick={() => setBrowseOpen(false)}
                        />
                    </>
                }
            >
                {fullFs ? <LostFileBrowser fs={fullFs} /> : ''}
            </BaseModal>
            {isDsEditOpenView && (
                <EditDSModal
                    isNewDs={isNewDS}
                    fsList={fsList}
                    selectedId={selectedDs}
                    modalOpen={isDsEditOpenControl}
                    closeModal={closeModal}
                    onClosed={onClosedModal}
                    possibleFsTypes={possibleFsTypes}
                    visLevel={visLevel}
                />
            )}

            <CRow>
                <CCol sm="auto">
                    <IconButton
                        isOutline={false}
                        color="primary"
                        icon={faUserPlus}
                        text="Add Datasource"
                        onClick={createNewDS}
                        style={{ marginTop: 15, marginBottom: 20 }}
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <BaseContainer>
                        <Datatable
                            data={fsList}
                            columns={[
                                {
                                    Header: 'Name',
                                    accessor: 'name',
                                },
                                {
                                    Header: 'Type',
                                    accessor: 'fsType',
                                },
                                // {
                                //     Header: 'Root Path',
                                //     accessor: 'rootPath',
                                // },
                                // {
                                //     Header: 'Connection',
                                //     accessor: 'connection',
                                // },
                                {
                                    Header: 'Global',
                                    id: 'groupId',
                                    accessor: (d) => {
                                        if (d.groupId) {
                                            return <CBadge color="success">User</CBadge>
                                        }
                                        return <CBadge color="primary">Global</CBadge>
                                    },
                                },
                                {
                                    Header: 'Delete',
                                    id: 'delete',
                                    accessor: (row) => {
                                        return (
                                            <IconButton
                                                icon={faTrash}
                                                color="danger"
                                                onClick={() => onDeleteDs(row)}
                                                disabled={checkEditable(row)}
                                                text="Delete"
                                            />
                                        )
                                    },
                                },
                                {
                                    Header: 'Edit',
                                    id: 'edit',
                                    accessor: (row) => {
                                        return (
                                            <IconButton
                                                icon={faEdit}
                                                color="primary"
                                                onClick={() => onEditDs(row)}
                                                disabled={checkEditable(row)}
                                                text="Edit"
                                                // isOutline={false}
                                            />
                                        )
                                    },
                                },
                                {
                                    Header: 'Browse',
                                    id: 'browse',
                                    accessor: (row) => {
                                        return (
                                            <IconButton
                                                icon={faFolderOpen}
                                                color="primary"
                                                onClick={() => onOpenFileBrowser(row)}
                                                text="Browse"
                                                // isOutline={false}
                                            />
                                        )
                                    },
                                },
                            ]}
                        />
                    </BaseContainer>
                </CCol>
            </CRow>
        </>
    )
}

export default DSTable
