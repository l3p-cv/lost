import React, {useEffect, useState} from 'react'
import BaseTable from './BaseTable'
import actions from 'actions/user'
import {Button} from 'semantic-ui-react'
import { useDispatch, useSelector } from 'react-redux';
import UserModal from './UserModal'


function UserTable() {
    let users = useSelector((state) => state.user.users);
    console.log(users)
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

    const [modalIsOpen, setModalIsOpen] = useState(false);

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
                key: 'edit'
            },
        ],
        data: users
    }

    const dataTableCallback = (arg)=>{
        console.log(arg)
    }
    console.log(modalIsOpen)
    return (
        <div>

            <UserModal title="Add User" modalIsOpen={modalIsOpen} toggle={()=> {setModalIsOpen(!modalIsOpen)}}/>
    <Button basic color='blue' onClick={()=>{setModalIsOpen(true)}}> 
      Add User
    </Button>
            <BaseTable tableData={tableData} callback={dataTableCallback} />

        </div>
    )
}

export default UserTable
