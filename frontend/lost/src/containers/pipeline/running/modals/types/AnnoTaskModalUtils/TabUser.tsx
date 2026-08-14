import { createColumnHelper } from '@tanstack/react-table'
import { useGroups } from '../../../../../../api/group'
import { useAnnoTaskUser } from '../../../../../../api/user'
import CoreDataTable from '../../../../../../components/CoreDataTable'
import * as Notification from '../../../../../../components/Notification'
import InfoText from '../../../../../../components/InfoText'
import CoreIconButton from '../../../../../../components/CoreIconButton'
import { useEffect, useMemo, useState } from 'react'

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

type TabUserProps = {
  annotaskId: number | string
  annotaskUser: string
  changeUser: (arg1: number | string, arg2: number | string, arg3: () => void) => void
}

const TabUser = ({ annotaskId, annotaskUser, changeUser }: TabUserProps) => {
  const { data: users, isLoading: isUsersLoading } = useAnnoTaskUser(selectUsers)
  const { data: groups, isLoading: isGroupsLoading } = useGroups(selectGroups)

  const [currentUser, setCurrentUser] = useState(annotaskUser)
  useEffect(() => setCurrentUser(annotaskUser), [annotaskUser])

  function changeUserSuccessful(rawName) {
    Notification.showSuccess('Change user successful')
    setCurrentUser(rawName)
  }

  function handleChangeUser(groupId, rawName) {
    changeUser(annotaskId, groupId, () => changeUserSuccessful(rawName))
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
        if (props.row.original.rawName === currentUser) {
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
            onClick={() => handleChangeUser(props.row.original.idx, props.row.original.rawName)}
          />
        )
      },
    }),
  ]
  const tableData = useMemo(() => {
    return users && groups ? [...users, ...groups] : []
  }, [users, groups])
  return (
    <>
      {users && groups ? (
        <CoreDataTable
          tableData={tableData}
          columns={columns}
          isLoading={isUsersLoading || isGroupsLoading}
        />
      ) : (
        ''
      )}
    </>
  )
}

export default TabUser
