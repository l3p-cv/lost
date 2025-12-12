import { createColumnHelper } from '@tanstack/react-table'
import { useGroups } from '../../../../../../actions/group/group-api'
import { useAnnoTaskUser } from '../../../../../../actions/user/user_api'
import { CenteredSpinner } from '../../../../../../components/CenteredSpinner'
import CoreDataTable from '../../../../../../components/CoreDataTable'
import { alertSuccess } from '../../../../globalComponents/Sweetalert'
import InfoText from '../../../../../../components/InfoText'
import CoreIconButton from '../../../../../../components/CoreIconButton'

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

  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (props) => {
        return (
          <InfoText
            text={props.row.original.name}
            subText={`ID: ${props.row.original.idx}`}
          />
        )
      },
    }),
    columnHelper.accessor('change', {
      header: 'Change',
      cell: (props) => {
        if (props.row.original.rawName === annotaskUser) {
          return (
            <CoreIconButton
              color="success"
              isOutline={false}
              text="Selected"
              disabled
              overrideDisabledColor
            />
          )
        }

        return (
          <CoreIconButton
            color="primary"
            text="Change"
            onClick={() => handleChangeUser(props.row.original.idx)}
          />
        )
      },
    }),
  ]

  return (
    <>
      {users && groups ? (
        <CoreDataTable tableData={[...users, ...groups]} columns={columns} />
      ) : (
        ''
      )}
    </>
  )
}

export default TabUser
