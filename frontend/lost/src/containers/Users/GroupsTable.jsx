import { useState } from 'react'
// import Datatable from '../../components/Datatable'

import { faL, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useCreateGroup, useDeleteGroup, useGroups } from '../../actions/group/group-api'
import IconButton from '../../components/IconButton'
import * as Notification from '../../components/Notification'
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../components/CoreDataTable'
import BaseContainer from '../../components/BaseContainer'
import { CFormInput, CInputGroup } from '@coreui/react'
import CoreIconButton from '../../components/CoreIconButton'
import ErrorBoundary from '../../components/ErrorBoundary'

export const Groups = () => {
  const [newGroup, setNewGroup] = useState('')
  const { mutate: createGroup } = useCreateGroup()
  const { mutate: deleteGroup } = useDeleteGroup()
  const { data: groupsData, isLoading } = useGroups()
  const columnHelper = createColumnHelper()

  const addGroup = () => {
    if (newGroup.length < 3) {
      Notification.showError('Minimum 3 character')
    } else if (newGroup.length > 25) {
      Notification.showError('Maximum 25 character')
    } else {
      createGroup({
        group_name: newGroup,
      })
    }
  }

  const columns = [
    columnHelper.accessor('name', {
      header: 'Group',
      cell: (props) => {
        return (
          <>
            <b>{props.row.original.name}</b>
            <div className="small text-muted">{`ID: ${props.row.original.idx}`}</div>
          </>
        )
      },
    }),
  ]

  let needPages = false
  if (groupsData) {
    needPages = groupsData.groups.length > 10
  }

  return (
    groupsData && (
      <div>
        <CInputGroup style={{ marginBottom: 20 }}>
          <CFormInput
            placeholder="groupname"
            value={newGroup}
            onChange={(e) => setNewGroup(e.currentTarget.value)}
          />
          <CoreIconButton
            color="primary"
            type="submit"
            icon={faPlus}
            onClick={addGroup}
          />
        </CInputGroup>
        <BaseContainer>
          <ErrorBoundary>
            <CoreDataTable
              columns={columns}
              tableData={groupsData.groups}
              usePagination={needPages}
              paginationLarge={false}
              isLoading={isLoading}
            />
          </ErrorBoundary>
        </BaseContainer>
      </div>
    )
  )
}
export default Groups
