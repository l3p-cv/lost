import { useState } from 'react'
// import Datatable from '../../components/Datatable'

import { faL, faPlus } from '@fortawesome/free-solid-svg-icons'
import { Input, InputGroup } from 'reactstrap'
import { useCreateGroup, useDeleteGroup, useGroups } from '../../actions/group/group-api'
import IconButton from '../../components/IconButton'
import * as Notification from '../../components/Notification'
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../components/CoreDataTable'
import BaseContainer from '../../components/BaseContainer'

export const Groups = () => {
    const [newGroup, setNewGroup] = useState('')
    const { mutate: createGroup } = useCreateGroup()
    const { mutate: deleteGroup } = useDeleteGroup()
    const { data: groupsData } = useGroups()
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
                        <div className="small text-muted">
                            {`ID: ${props.row.original.idx}`}
                        </div>
                    </>
                )
            }
        })
    ]

    let needPages = false
    if (groupsData) {
        needPages = (groupsData.groups.length > 10)
    }

    return (
        groupsData && (
            <div>
                <InputGroup style={{ marginBottom: 20 }}>
                    <Input
                        placeholder="groupname"
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.currentTarget.value)}
                    />
                    <IconButton color="success" icon={faPlus} onClick={addGroup} />
                </InputGroup>
                {/* TODO: make pagination-buttons smaller */}
                <BaseContainer>
                    <CoreDataTable
                        columns={columns}
                        tableData={groupsData.groups}
                        usePagination={needPages} />
                </BaseContainer>
                {/* <Datatable
                    data={groupsData.groups}
                    columns={[
                        {
                            Header: 'Group',
                            accessor: 'name',
                            Cell: ({ original }) => (
                                <>
                                    <b>{original.name}</b>
                                    <div className="small text-muted">
                                        {`ID: ${original.idx}`}
                                    </div>
                                </>
                            ),
                        },
                        // Note: commented this out temporarily since it allows you to delete groups assigned to users
                        // The backend api needs to be fixed before re-enabling this feature
                        // {
                        //     Header: '',
                        //     width: 50,
                        //     Cell: function customCell(row) {
                        //         return (
                        //             <IconButton
                        //                 disabled
                        //                 icon={faTrash}
                        //                 color="danger"
                        //                 onClick={() => {
                        //                     deleteGroup(row.original.idx)
                        //                 }}
                        //             />
                        //         )
                        //     },
                        // },
                    ]}
                /> */}
            </div>
        )
    )
}
export default Groups
