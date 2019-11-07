import React, { useEffect, useState } from 'react'
import groupActions from 'actions/group'
import userActions from 'actions/user'
import * as Alert from '../BasicComponents/Alert' 
import { useDispatch, useSelector } from 'react-redux';
import BaseTable from './BaseTable'
// * tableData: {header: [{title: Age, key: age}, ...], data:[{age: 12,...}, ...]}
import { Button, Input } from 'semantic-ui-react'

function GroupTable() {
    const groups = useSelector((state) => {

        return state.group.groups
    });

    const users = useSelector((state) => state.user.users);

    const dispatch = useDispatch();
    const getGroups = () => dispatch(groupActions.getGroupsAction());
    const createGroup = (payload)=> dispatch(groupActions.createGroupAction(payload));
    const deleteGroup = (payload)=> dispatch(groupActions.deleteGroupAction(payload));

    const data = groups.map(group => ({ 'groupName': group.name } ))
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
    const dataTableCallback =  async (type, row) => {
        const group = groups.filter(el=>el.name == row.groupName)[0]
        await deleteGroup(group.idx)
        getGroups()

    }

    return (
        <div>
            <Input
                value={groupName}
                action={
                    <Button basic color='blue'
                        onClick={() => {
                            if(users.filter(user=>user.user_name === groupName).length){
                                Alert.error("groupname and username can not be the same")
                                return
                            }
                            if(groups.filter(group=>group.name===groupName).length){
                                Alert.error("groupname already taken")
                                return
                            }
                            
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
{groups.length > 0 && <BaseTable tableData={tableData} callback={dataTableCallback} />}
            
        </div>
    )
}

export default GroupTable