import React, { useEffect, useState } from 'react'
import Datatable from '../../components/Datatable'
import actions from '../../actions/group'
import userActions from '../../actions/user'

import { useDispatch, useSelector } from 'react-redux'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../components/IconButton'
import { Input, InputGroupAddon, InputGroup } from 'reactstrap'
import * as Notification from '../../components/Notification'
import * as REQUEST_STATUS from '../../types/requestStatus'
export const Groups = () => {
    const dispatch = useDispatch()
    const groups = useSelector((state) => state.group.groups)
    const [newGroup, setNewGroup] = useState('')
    const addGroupStatus = useSelector((state) => state.group.createGroupStatus)
    const deleteGroupStatus = useSelector((state) => state.group.deleteGroupStatus)

    useEffect(() => {
        if (addGroupStatus.status) {
            Notification.networkRequest(addGroupStatus)
            if (addGroupStatus.status === REQUEST_STATUS.SUCCESS) {
                dispatch(actions.getGroups())
                setNewGroup('')
            }
        }
    }, [addGroupStatus])

    useEffect(() => {
        if (deleteGroupStatus.status) {
            Notification.networkRequest(deleteGroupStatus)
            if (deleteGroupStatus.status === REQUEST_STATUS.SUCCESS) {
                dispatch(actions.getGroups())
                dispatch(userActions.getUsers())
            }
        }
    }, [deleteGroupStatus])

    useEffect(() => {
        dispatch(actions.getGroups())
    }, [])

    const addGroup = () => {
        if (newGroup.length < 3) {
            Notification.showError('Minimum 3 character')
        } else if (newGroup.length > 25) {
            Notification.showError('Maximum 25 character')
        } else {
            dispatch(
                actions.createGroup({
                    group_name: newGroup,
                }),
            )
        }
    }

    const deleteGroup = (id) => {
        dispatch(actions.deleteGroup(id))
    }

    return (
        <div>
            <InputGroup style={{ marginBottom: 20 }}>
                <Input
                    placeholder="groupname"
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.currentTarget.value)}
                />
                <InputGroupAddon addonType="append">
                    <IconButton color="primary" icon={faPlus} onClick={addGroup} />
                </InputGroupAddon>
            </InputGroup>
            <Datatable
                showPageSizeOptions={false}
                data={groups}
                columns={[
                    {
                        Header: 'Group',
                        accessor: 'name',
                    },
                    {
                        Header: '',
                        width: 50,
                        Cell: function customCell(row) {
                            return (
                                <IconButton
                                    icon={faTrash}
                                    color="danger"
                                    onClick={() => {
                                        deleteGroup(row.original.idx)
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
export default Groups
