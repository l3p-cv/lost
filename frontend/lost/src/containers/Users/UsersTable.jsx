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
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../components/CoreDataTable'
import { CBadge, CButton, CTooltip } from '@coreui/react'
import BaseContainer from '../../components/BaseContainer'
import { FaFontAwesome } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { alertDeletion } from '../pipeline/globalComponents/Sweetalert'

const RenderBadge = ({ key, text, color }) => (
    <div>
        <CBadge color={color}>
            {text}
        </CBadge>
    </div>
)


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
    const columnHelper = createColumnHelper()

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

    const editClick = (row) => {
        setIsNewUser(false)
        setSelectedUser(usersData.users.filter((el) => el.user_name === row.original.user_name))

        openUserModal()
    }

    const deleteClick = async (row) => {
        const response = await alertDeletion("user")
        if (response.value) {
            deleteUser(row.original.idx)
        }
    }

    const closeModal = () => {
        setIsUserEditOpenControl(false)
        refetchUsers()
    }
    const onClosedModal = () => {
        setIsUserEditOpenView(false)
    }

    const columns = [
        columnHelper.accessor('user_name', {
            header: 'Username',
            cell: (props) => (
                <>
                    <b>{props.row.original.user_name}</b>
                    <div className="small text-muted">
                        {`ID: ${props.row.original.idx}`}
                    </div>
                </>
            ),
        }),
        columnHelper.accessor('roles', {
            header: 'Roles',
            cell: (props) => {
                return props.row.original.roles.map((el) => (
                    <RenderBadge // TODO: replace with CBadge
                        key={el.idx}
                        text={el.name}
                        color="success"
                    />
                ))
            },
        }),
        columnHelper.accessor('groups', {
            header: 'Groups',
            cell: (props) => {
                return props.row.original.groups.map((el) => (
                    <RenderBadge // TODO: replace with CBadge
                        key={el.idx}
                        text={el.name}
                        color="primary"
                    />
                ))
            },
        }),
        columnHelper.accessor('apiToken', {
            header: 'API Token',
            cell: (props) => {
                const visBool = false
                if (props.row.original.apiToken) {
                    return (
                        <CTooltip content="Copy Token to Clipboard" placement="top">
                            <CButton
                                color="info"
                                variant='outline'
                                onClick={() => {
                                    copyToClipboard(props.row.original.apiToken)
                                }}
                            >
                                <FontAwesomeIcon icon={faCopy} />
                            </CButton>
                        </CTooltip>
                    )
                }
                return null
            },
        }),
        columnHelper.accessor('edit', {
            header: 'Edit',
            cell: (props) => {
                // console.log("Log 1: ", props.row.original.user_name)
                const user_row = props.row
                return (
                    <CTooltip content="Edit User" placement="top">
                        <CButton
                            variant='outline'
                            color="warning"
                            onClick={() => editClick(user_row)}
                        >
                            <FontAwesomeIcon icon={faUserEdit} />
                        </CButton>
                    </CTooltip>
                )
            },
        }),
        columnHelper.accessor('delete', {
            header: 'Delete',
            cell: (props) => {
                return (
                    <CTooltip content="Delete User" placement="top">
                        <CButton
                            variant='outline'
                            color="danger"
                            onClick={() => {
                                deleteClick(props.row)
                            }}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </CButton>
                    </CTooltip>
                )
            },
        }),
    ]

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
                color="success"
                icon={faUserPlus}
                text="Add User"
                onClick={createNewUser}
                style={{ marginBottom: 20 }}
            />
            <BaseContainer>
                <CoreDataTable columns={columns} tableData={usersData.users} />
            </BaseContainer>
        </div>
    ) : (
        <></>
    )
}

export default UsersTable
