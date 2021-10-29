import React, { useEffect, useState } from 'react'
import Datatable from '../../components/Datatable'
import { useDispatch, useSelector } from 'react-redux'
import actions from '../../actions/user'
import IconButton from '../../components/IconButton'
import {
    faUserEdit,
    faTrash,
    faUserPlus,
    faCopy,
} from '@fortawesome/free-solid-svg-icons'
import EditUserModal from './EditUserModal'
import { useCopyToClipboard } from 'react-use'
import * as Notification from '../../components/Notification'
import * as REQUEST_STATUS from '../../types/requestStatus'

const EMPTY_USER = [
    {
        email: '',
        groups: [],
        password: '',
        roles: [],
        userName: '',
    },
]

export const Users = () => {
    let users = useSelector((state) => state.user.users)
    const [copiedObj, copyToClipboard] = useCopyToClipboard()
    const deleteUserStatus = useSelector((state) => state.user.deleteUserStatus)
    const [isNewUser, setIsNewUser] = useState(false)

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
    const [isUserEditOpenControl, setIsUserEditOpenControl] = useState(false)
    const [selectedUser, setSelectedUser] = useState()
    // only close modal when animation finished
    const [isUserEditOpenView, setIsUserEditOpenView] = useState(false)

    const dispatch = useDispatch()

    const getUsers = () => {
        dispatch(actions.getUsers())
    }

    const createNewUser = () => {
        setIsNewUser(true)
        setSelectedUser(EMPTY_USER)
        openUserModal()
    }

    useEffect(() => {
        getUsers()
    }, [])

    const openUserModal = () => {
        setIsUserEditOpenControl(true)
        setIsUserEditOpenView(true)
    }

    const editClick = ({ row }) => {
        setIsNewUser(false)
        setSelectedUser(users.filter((el) => el.user_name === row.user_name))

        openUserModal()
    }

    const deleteClick = (row) => {
        dispatch(actions.deleteUser(row.original.idx))
    }

    const closeModal = () => {
        setIsUserEditOpenControl(false)
        getUsers()
    }
    const onClosedModal = () => {
        setIsUserEditOpenView(false)
    }
    return (
        <div>
            {isUserEditOpenView && (
                <EditUserModal
                    isNewUser={isNewUser}
                    users={users}
                    user={selectedUser}
                    isOpen={isUserEditOpenControl}
                    closeModal={closeModal}
                    onClosed={onClosedModal}
                />
            )}

            <IconButton
                color="primary"
                icon={faUserPlus}
                text="Add User"
                onClick={createNewUser}
                style={{ marginBottom: 20 }}
            />

            <Datatable
                data={users}
                columns={[
                    {
                        Header: 'Username',
                        accessor: 'user_name',
                        Cell: function customCell(row) {
                            return row.value
                        },
                    },
                    {
                        Header: 'API Token',
                        accessor: 'apiToken',
                        Cell: function customCell(row) {
                            if (row.original.apiToken) {
                                return (
                                    <IconButton
                                        color="primary"
                                        icon={faCopy}
                                        onClick={() => {
                                            copyToClipboard(row.original.apiToken)
                                        }}
                                    />
                                )
                            }
                            return null
                        },
                    },
                    {
                        Header: 'Roles',
                        accessor: 'roles',
                        Cell: function customCell(row) {
                            return row.value.map((el) => (
                                <Datatable.RenderBadge
                                    key={el.idx}
                                    text={el.name}
                                    color="success"
                                />
                            ))
                        },
                    },
                    {
                        Header: 'Groups',
                        accessor: 'groups',
                        Cell: function customCell(row) {
                            return row.value.map((el) => (
                                <Datatable.RenderBadge
                                    key={el.idx}
                                    text={el.name}
                                    color="primary"
                                />
                            ))
                        },
                    },
                    {
                        Header: 'Edit',
                        Cell: function customCell(row) {
                            return (
                                <IconButton
                                    icon={faUserEdit}
                                    color="warning"
                                    onClick={() => editClick(row)}
                                />
                            )
                        },
                    },
                    {
                        Header: 'Delete',
                        Cell: function customCell(row) {
                            return (
                                <IconButton
                                    icon={faTrash}
                                    color="danger"
                                    onClick={() => {
                                        deleteClick(row)
                                    }}
                                />
                            )
                        },
                    },
                ]}
            />
        </div>
    )
}

export default Users
