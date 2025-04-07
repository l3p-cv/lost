import { useGroups } from '../../../../../../actions/group/group-api'
import { useAnnoTaskUser } from '../../../../../../actions/user/user_api'
import { CenteredSpinner } from '../../../../../../components/CenteredSpinner'
import Datatable from '../../../../../../components/Datatable'
import IconButton from '../../../../../../components/IconButton'
import { alertSuccess } from '../../../../globalComponents/Sweetalert'

const selectUsers = (usersData) => {
    return usersData.users.map((user) => ({
        idx: user.default_group_id,
        rawName: user.user_name,
        name: `${user.user_name} (user)`,
    }))
}

const selectGroups = (groupsData) => {
    return groupsData.groups.map((group) => ({
        idx: group.idx,
        rawName: group.name,
        name: `${group.name} (group)`,
    }))
}

const TabUser = ({ annotaskId, annotaskUser, changeUser }) => {
    const { data: users, isLoading: isUsersLoading } = useAnnoTaskUser(selectUsers)
    const { data: groups, isLoading: isGroupsLoading } = useGroups(selectGroups)

    function changeUserSuccessful() {
        alertSuccess('Change user successful')
    }

    function handleChangeUser(groupId) {
        changeUser(annotaskId, groupId, changeUserSuccessful)
    }

    if (isUsersLoading || isGroupsLoading) {
        return <CenteredSpinner />
    }

    return (
        <>
            {users && groups ? (
                <Datatable
                    data={[...users, ...groups]}
                    columns={[
                        {
                            Header: 'Name',
                            accessor: 'name',
                        },
                        {
                            Header: 'Change',
                            id: 'change',
                            accessor: (d) => {
                                if (d.rawName === annotaskUser) {
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
                                        onClick={() => handleChangeUser(d.idx)}
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
