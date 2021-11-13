import React, { useEffect, useState } from 'react'
import Datatable from '../../components/Datatable'
import { useDispatch, useSelector } from 'react-redux'
import actions from '../../actions/user'
import IconButton from '../../components/IconButton'
import { faUserPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import EditDSModal from './EditDSModal'
import { useCopyToClipboard } from 'react-use'
import * as Notification from '../../components/Notification'
import * as REQUEST_STATUS from '../../types/requestStatus'
import { getFSList, getPossibleFsTypes, deleteFs } from '../../access/fb'

export const DSTable = () => {
    const [copiedObj, copyToClipboard] = useCopyToClipboard()
    const deleteUserStatus = useSelector((state) => state.user.deleteUserStatus)
    const [isNewDS, setIsNewDS] = useState(false)
    const [fsList, setFSList] = useState([])
    const [possibleFsTypes, setPossibleFsTypes] = useState([])

    async function fetchData() {
        setFSList(await getFSList())
        setPossibleFsTypes(await getPossibleFsTypes())
    }

    async function deleteSelectedFs(row) {
        await deleteFs(row)
    }

    useEffect(() => {
        fetchData()
        // const interval = setInterval(fetchData, 1000)
        // return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (deleteUserStatus.status) {
            Notification.networkRequest(deleteUserStatus)
            if ((deleteUserStatus.status = REQUEST_STATUS.SUCCESS)) {
                dispatch(actions.getUsers())
            }
        }
    }, [deleteUserStatus])

    useEffect(() => {
        if (copiedObj.error) {
            Notification.showError(
                'Unable to copy to clipboard. API TOKEN was logged in console log',
            )
        } else if (copiedObj.value) {
            Notification.showSuccess(
                `API TOKEN: ${copiedObj.value.substr(0, 8)}... copied to clipboard`,
            )
        }
    }, [copiedObj])

    // control modal close
    const [isDsEditOpenControl, setIsDsEditOpenControl] = useState(false)
    const [selectedDs, setSelectedDs] = useState()
    // only close modal when animation finished
    const [isDsEditOpenView, setIsDsEditOpenView] = useState(false)

    const dispatch = useDispatch()

    // const getUsers = () => {
    //     dispatch(actions.getUsers())
    // }

    const createNewDS = () => {
        setIsNewDS(true)
        setSelectedDs(undefined)
        openEditDSModal()
    }

    const handleEditDs = (row) => {
        console.log('handleEditDs', row)
        console.log('row.value', row.id)
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
                            console.log('Delete', row)
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

    return (
        <div>
            {isDsEditOpenView && (
                <EditDSModal
                    isNewDs={isNewDS}
                    fsList={fsList}
                    selectedId={selectedDs}
                    modalOpen={isDsEditOpenControl}
                    closeModal={closeModal}
                    onClosed={onClosedModal}
                    possibleFsTypes={possibleFsTypes}
                />
            )}

            <IconButton
                color="primary"
                icon={faUserPlus}
                text="Add Datasource"
                onClick={createNewDS}
                style={{ marginBottom: 20 }}
            />

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
                    {
                        Header: 'Root Path',
                        accessor: 'rootPath',
                    },
                    {
                        Header: 'Connection',
                        accessor: 'connection',
                    },
                    {
                        Header: 'Edit',
                        id: 'edit',
                        accessor: (row) => {
                            return (
                                <IconButton
                                    icon={faEdit}
                                    color="warning"
                                    onClick={() => onEditDs(row)}
                                />
                            )
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
                                />
                            )
                        },
                    },
                ]}
            />
        </div>
    )
}

export default DSTable
