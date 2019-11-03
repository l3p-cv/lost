import React, {useState, useEffect} from 'react'
import { ModalHeader, ModalBody, Modal, ModalFooter } from 'reactstrap';
import BaseTable from './BaseTable'


export default (props) => {

    let data = [
        {edit_username: "", edit_email: "", edit_isDesigner: "", edit_password: "", edit_confirm_password: "" }
    ]
    const [userData, setUserData] = useState();
    if(userData){
        data = [
            {
                edit_user_name: userData.user_name, 
                edit_email: userData.email, 
                edit_isDesigner: userData.isDesigner,
                edit_password: userData.password, 
                edit_confirm_password: userData.password }
        ]
    }
    const tableData = {
        header: [
            {
                title: 'Username',
                key: 'edit_user_name'
            },
            {
                title: 'Email',
                key: 'edit_email'
            },
            {
                title: 'Designer',
                key: 'edit_isDesigner'
            },
            {
                title: 'Password',
                key: 'edit_password'
            },
            {
                title: 'Confirm Password',
                key: 'edit_confirm_password'
            },
        ],
        data: data
    }

    useEffect(() => {
        if(props.editUserData){
            setUserData(props.editUserData)
        }
      }, [props.editUserData]); // empty-array means don't watch for any updates

    const dataTableCallback = (key, e)=>{
        console.log(e)
    }
    return(
        <>
        <Modal size='lg' isOpen={props.modalIsOpen} toggle={props.toggle}>
            <ModalHeader>{props.editUserData?"Edit User":"Add User"}</ModalHeader>
            <ModalBody>
                <BaseTable
                 tableData= {tableData}
                 callback= {dataTableCallback}
                />
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
        </Modal>
    </>
    )
}


    





