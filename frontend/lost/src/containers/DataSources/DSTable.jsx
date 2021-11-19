import React, { useEffect, useState } from 'react'
import Datatable from '../../components/Datatable'
import { useDispatch, useSelector } from 'react-redux'
import actions from '../../actions/user'
import IconButton from '../../components/IconButton'
import { faUserPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import EditDSModal from './EditDSModal'
import * as Notification from '../../components/Notification'
import * as REQUEST_STATUS from '../../types/requestStatus'
import { getFSList, getPossibleFsTypes, deleteFs } from '../../access/fb'
import { CBadge } from '@coreui/react'

export const DSTable = ({ visLevel }) => {
    const deleteUserStatus = useSelector((state) => state.user.deleteUserStatus)
    const [isNewDS, setIsNewDS] = useState(false)
    const [fsList, setFSList] = useState([])
    const [possibleFsTypes, setPossibleFsTypes] = useState([])

    async function fetchData() {
        setFSList(await getFSList(visLevel))
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
                    visLevel={visLevel}
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
                        Header: 'Edit',
                        id: 'edit',
                        accessor: (row) => {
                            return (
                                <IconButton
                                    icon={faEdit}
                                    color="primary"
                                    onClick={() => onEditDs(row)}
                                    disabled={
                                        row.groupId === null
                                            ? visLevel !== 'global'
                                            : false
                                    }
                                    text="Edit"
                                    // isOutline={false}
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
                                    disabled={
                                        row.groupId === null
                                            ? visLevel !== 'global'
                                            : false
                                    }
                                    text="Delete"
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
