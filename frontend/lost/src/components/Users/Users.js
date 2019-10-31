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
        { name: "Name", age: 15, gender: 'Male' , city: "asd"},
        {  age: 40, name: 'Amber',gender: 'Female' , city: "asd"},
        { name: 'Leslie', age: 25, gender: 'Other' , city: "asd"},
        { name: 'Ben', age: 70, gender: 'Male' , city: "asd"},
    ]
}
function UserTable() {
    let users = useSelector((state) => state.user.users);
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
    users = users.map(user=> {
        const isDesigner = user.roles.filter(el=>el.name === 'Designer')[0] != undefined
        const isAnnotator = user.roles.filter(el=>el.name === 'Annotator')[0] != undefined
        return(
            {
                ...user,
                isDesigner,
                isAnnotator,
                deletable: true,
                changeable: true
            }
        )
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
            {
                title: 'Designer',
                key: 'isDesigner'
            },
            {
                title: 'Annotator',
                key: 'isAnnotator'
            },
            {
                title: '',
                key: 'changeable'
            },
        ],
        data: users
    }

    const dataTableCallback = ()=>{
        console.log(dataTableCallback)
    }
    return (
        <div>
            <BaseTable tableData={tableData} callback={dataTableCallback} />

        </div>
    )
}

export default UserTable
