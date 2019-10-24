import React, {useEffect} from 'react'
import BaseTable from './BaseTable'
import actions from 'actions/user'

import { useDispatch, useSelector } from 'react-redux';


const tableData2 = {
    header: [
        {
            title: "Name",
            key: "name"
        },
        {
            title: "Age",
            key: "age"
        },
        {
            title: "Gender",
            key: "gender"
        }
    ],
    data: [
        { name: 'John', age: 15, gender: 'Male' , city: "asd"},
        {  age: 40, name: 'Amber',gender: 'Female' , city: "asd"},
        { name: 'Leslie', age: 25, gender: 'Other' , city: "asd"},
        { name: 'Ben', age: 70, gender: 'Male' , city: "asd"},
    ]
}
function UserTable() {
    const users = useSelector((state) => state.user.users);
    const dispatch = useDispatch();
    const getUsers = () => dispatch(actions.getUsersAction());
    useEffect  (()=>{
        async function fetchUsers() {
            await getUsers();
          }
          if(!users.length){
            fetchUsers();
          }
    })
    console.log(users)
    const tableData = {
        header: [
            {
                title: 'Username',
                key: 'user_name'
            },
            {
                title: 'Email',
                key: 'email'
            },
        ],
        data: users
    }
    return (
        <div>
            <BaseTable tableData={tableData} />

        </div>
    )
}

export default UserTable
