import GroupTable from './GroupsTable'
import UserTable from './UsersTable'
import { CCol, CRow } from '@coreui/react'

const UsersAndGroups = () => (
  <CRow>
    <CCol xs="3">
      <GroupTable />
    </CCol>
    <CCol xs="9">
      <UserTable />
    </CCol>
  </CRow>
)

export default UsersAndGroups
