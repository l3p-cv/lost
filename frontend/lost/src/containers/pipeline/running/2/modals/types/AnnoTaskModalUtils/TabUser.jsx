import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import actions from '../../../../../../../actions'
import Datatable from '../../../../../../../components/Datatable'
import * as userApi from '../../../../../../../actions/user/user_api'
import { alertSuccess } from '../../../../../globalComponents/Sweetalert'
import IconButton from '../../../../../../../components/IconButton'

const TabUser = (props) => {
    const { data: users } = userApi.useAnnotaskUser()
    // const users = useSelector((state) => state.user.users)
    const dispatch = useDispatch()
    const groups = useSelector((state) => state.group.groups)

    useEffect(() => {
        // dispatch(actions.getUsers())
        dispatch(actions.getGroups())
    }, [])

    function changeUserSuccessful() {
        alertSuccess('Change user successful')
    }

    function handleChangeUser(props, groupId) {
        props.changeUser(props.annoTask.id, groupId, changeUserSuccessful)
    }
    const dataTableData = [
        ...users.map((user) => ({
            idx: user.default_group_id,
            rawName: user.user_name,
            name: `${user.user_name} (user)`,
        })),
        ...groups.map((group) => ({
            idx: group.idx,
            rawName: group.name,
            name: `${group.name} (group)`,
        })),
    ]

    return (
        <>
            {dataTableData.length > 0 ? (
                <Datatable
                    data={dataTableData}
                    columns={[
                        // {
                        //     Header: 'ID',
                        //     accessor: 'idx',
                        // },
                        {
                            Header: 'Name',
                            accessor: 'name',
                        },
                        {
                            Header: 'Change',
                            id: 'change',
                            accessor: (d) => {
                                if (d.rawName === props.annoTask.userName) {
                                    return (
                                        <IconButton
                                            color="success"
                                            isOutline={false}
                                            text="Selected"
                                            disabled
                                        />
                                    )
                                }
                                return (
                                    <IconButton
                                        color="primary"
                                        text="Change"
                                        onClick={() => handleChangeUser(props, d.idx)}
                                    />
                                )
                            },
                        },
                    ]}
                />
            ) : (
                ''
            )}
        </>
    )
}

export default TabUser
