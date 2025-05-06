import {
    faCopy,
    faTrash,
    faUserEdit,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useDeleteUser, useUsers } from '../../actions/user/user_api'
import Datatable from '../../components/Datatable'
import IconButton from '../../components/IconButton'
import * as Notification from '../../components/Notification'
import EditUserModal from './EditUserModal'

const EMPTY_USER = [
    {
        email: '',
        groups: [],
        password: '',
        roles: [],
        userName: '',
    },
]

export const UsersTable = () => {
    const [copiedObj, copyToClipboard] = useCopyToClipboard()
    const [isNewUser, setIsNewUser] = useState(false)

    const { data: usersData, refetch: refetchUsers } = useUsers()
    const { mutate: deleteUser } = useDeleteUser()

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

    const createNewUser = () => {
        setIsNewUser(true)
        setSelectedUser(EMPTY_USER)
        openUserModal()
    }

    const openUserModal = () => {
        setIsUserEditOpenControl(true)
        setIsUserEditOpenView(true)
    }

    const editClick = ({ row }) => {
        setIsNewUser(false)
        setSelectedUser(usersData.users.filter((el) => el.user_name === row.user_name))

        openUserModal()
    }

    const deleteClick = (row) => {
        deleteUser(row.original.idx)
    }

    const closeModal = () => {
        setIsUserEditOpenControl(false)
        refetchUsers()
    }
    const onClosedModal = () => {
        setIsUserEditOpenView(false)
    }
    return usersData ? (
        <div>
            {isUserEditOpenView && (
                <EditUserModal
                    isNewUser={isNewUser}
                    users={usersData.users}
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
                data={usersData.users}
                columns={[
                    {
                        Header: 'Username',
                        accessor: 'user_name',
                        Cell: ({ original }) => (
                            <>
                                <b>{original.user_name}</b>
                                <div className="small text-muted">
                                    {`ID: ${original.idx}`}
                                </div>
                            </>
                        ),
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
    ) : (
        <></>
    )
}

export default UsersTable
