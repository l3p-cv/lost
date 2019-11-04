import React, { useEffect, useState } from 'react'
import actions from 'actions/group'
import { useDispatch, useSelector } from 'react-redux';
import BaseTable from './BaseTable'
// * tableData: {header: [{title: Age, key: age}, ...], data:[{age: 12,...}, ...]}
import { Button, Input } from 'semantic-ui-react'

function GroupTable() {
    const groups = useSelector((state) => {

        return state.group.groups
    });
    const dispatch = useDispatch();
    const getGroups = () => dispatch(actions.getGroupsAction());
    const createGroup = (payload)=> dispatch(actions.createGroupAction(payload));
    const deleteGroup = (payload)=> dispatch(actions.deleteGroupAction(payload));
    const data = groups.map(group => { return { 'groupName': group.name } })
    const [groupName, setGroupName] = useState("")
    const tableData = {
        header: [
            {
                title: "Group",
                key: "groupName"
            },
            {
                title: "",
                key: "deleteUser"
            }
        ],
        data: data
    }
    useEffect(() => {
         function fetchGroups() {
             getGroups();
        }
        fetchGroups();

    }, [])
    const dataTableCallback = (type, row) => {
        const group = groups.filter(el=>el.name == row.groupName)[0]
        console.log(group)
        deleteGroup(group.idx)

    }

    return (
        <div>
            <Input
                value={groupName}
                action={
                    <Button basic color='blue'
                        onClick={() => {
                            createGroup({'group_name': groupName})
                            setGroupName("")
                            getGroups()
                        }}>
                        Add Group
                    </Button>
                }
                onChange={(e)=>setGroupName(e.currentTarget.value)}
                iconPosition='left'
                placeholder='Groupname'
            />

            <BaseTable tableData={tableData} callback={dataTableCallback} />
        </div>
    )
}

export default GroupTable