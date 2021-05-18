import React, { useEffect, useState } from 'react'
import Datatable from '../../components/Datatable'
import { useDispatch, useSelector } from 'react-redux'
import actions from '../../actions/user'
import IconButton from '../../components/IconButton'
import {
    faUserEdit,
    faTrash,
    faUserPlus,
    faCopy
} from '@fortawesome/free-solid-svg-icons'
import EditUserModal from './EditUserModal'
import { useCopyToClipboard } from 'react-use'
import * as Notification from '../../components/Notification'
import * as REQUEST_STATUS from '../../types/requestStatus'
import {getFSList} from '../../access/fb'

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
    const [isNewUser, setIsNewUser] = useState(false)
    const [fsList, setFSList] = useState([])

    useEffect(async ()=>{
        setFSList(await getFSList())
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
                data={fsList}
                columns={[
                    {
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
                    // {
                    //     Header: 'API Token',
                    //     accessor: 'apiToken',
                    //     Cell: (row) => {
                    //         if (row.original.apiToken) {
                    //             return (
                    //                 <Datatable.centeredCell>
                    //                     <IconButton
                    //                         color="primary"
                    //                         icon={faCopy}
                    //                         onClick={() => {
                    //                             copyToClipboard(
                    //                                 row.original.apiToken
                    //                             )
                    //                         }}
                    //                     />
                    //                 </Datatable.centeredCell>
                    //             )
                    //         }
                    //         return null
                    //     }
                    // },
                    // {
                    //     Header: 'Roles',
                    //     accessor: 'roles',
                    //     Cell: (row) => {
                    //         return row.value.map((el) => {
                    //             return Datatable.renderBadge(
                    //                 el.idx,
                    //                 el.name,
                    //                 'success'
                    //             )
                    //         })
                    //     }
                    // },
                    // {
                    //     Header: 'Groups',
                    //     accessor: 'groups',
                    //     Cell: (row) => {
                    //         return row.value.map((el) => {
                    //             return Datatable.renderBadge(
                    //                 el.idx,
                    //                 el.name,
                    //                 'primary'
                    //             )
                    //         })
                    //     }
                    // },
                    // {
                    //     Header: 'Edit',
                    //     Cell: (row) =>
                    //         Datatable.centeredCell({
                    //             children: (
                    //                 <IconButton
                    //                     icon={faUserEdit}
                    //                     color="warning"
                    //                     onClick={() => editClick(row)}
                    //                 />
                    //             )
                    //         })
                    // },
                    // {
                    //     Header: 'Delete',
                    //     Cell: (row) =>
                    //         Datatable.centeredCell({
                    //             children: (
                    //                 <IconButton
                    //                     icon={faTrash}
                    //                     color="danger"
                    //                     onClick={() => {
                    //                         deleteClick(row)
                    //                     }}
                    //                 />
                    //             )
                    //         })
                    // }
                ]}
            />
        </div>
    )
}

export default DSTable
