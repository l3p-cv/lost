import React, { useEffect, useState } from 'react'
import Datatable from '../../components/Datatable'
import { useDispatch, useSelector } from 'react-redux'
import actions from '../../actions/user'
import IconButton from '../../components/IconButton'
import {
    faUserEdit,
    faTrash,
    faUserPlus,
    faEdit,
    faCopy
} from '@fortawesome/free-solid-svg-icons'
import EditDSModal from './EditDSModal'
import { useCopyToClipboard } from 'react-use'
import * as Notification from '../../components/Notification'
import * as REQUEST_STATUS from '../../types/requestStatus'
import {getFSList, getPossibleFsTypes} from '../../access/fb'

const EMPTY_USER = [
    {
        email: '',
        groups: [],
        password: '',
        roles: [],
        userName: ''
    }
]

export const DSTable = () => {
    let users = useSelector((state) => state.user.users)
    const [copiedObj, copyToClipboard] = useCopyToClipboard()
    const deleteUserStatus = useSelector((state) => state.user.deleteUserStatus)
    const [isNewDS, setIsNewDS] = useState(false)
    const [fsList, setFSList] = useState([])
    const [possibleFsTypes, setPossibleFsTypes] = useState([])

    useEffect( () => {
        async function fetchData(){
            setFSList(await getFSList())
            setPossibleFsTypes(await getPossibleFsTypes())
        }
        fetchData()
        // console.log('IN DSTABLE: ', await getFSList())
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
                'Unable to copy to clipboard. API TOKEN was logged in console log'
            )
        } else if (copiedObj.value) {
            Notification.showSuccess(
                `API TOKEN: ${copiedObj.value.substr(
                    0,
                    8
                )}... copied to clipboard`
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
        setSelectedDs(row.value)
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
                        Header: 'Edit',
                        accessor: 'id',
                        Cell: (row) =>
                            Datatable.centeredCell({
                                children: (
                                    <IconButton
                                        icon={faEdit}
                                        color="warning"
                                        onClick={() => handleEditDs(row)}
                                    />
                                )
                            })
                    },{
                        Header: 'Name',
                        accessor: 'name',
                        Cell: (row) =>
                            Datatable.centeredCell({ children: row.value })
                    },{
                        Header: 'Type',
                        accessor: 'fsType',
                        Cell: (row) =>
                            Datatable.centeredCell({ children: row.value })
                    },{
                        Header: 'Root Path',
                        accessor: 'rootPath',
                        Cell: (row) =>
                            Datatable.centeredCell({ children: row.value })
                    },{
                        Header: 'Connection',
                        accessor: 'connection',
                        Cell: (row) =>
                            Datatable.centeredCell({ children: row.value })
                    }
                ]}
            />
        </div>
    )
}

export default DSTable
