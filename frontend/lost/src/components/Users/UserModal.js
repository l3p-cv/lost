import React, { useState, useEffect } from 'react'
import { ModalHeader, ModalBody, Modal, ModalFooter } from 'reactstrap';
import BaseTable from './BaseTable'
import { Button } from 'semantic-ui-react'
import { useDispatch } from 'react-redux';
import actions from 'actions/user'

export default (props) => {
    let data = [
        { edit_username: "", edit_email: "", edit_isDesigner: "", edit_password: "", edit_confirm_password: "" }
    ]
    const [userData, setUserData] = useState();
    const dispatch = useDispatch();
    const createUser = (payload) => dispatch(actions.createUserAction(payload));
    if (userData) {
        data = [
            {
                edit_user_name: userData.user_name,
                edit_email: userData.email,
                edit_isDesigner: userData.isDesigner,
                edit_password: userData.password,
                edit_confirm_password: userData.confirm_password
            }
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
        setUserData(props.editUserData)
    }, [props.editUserData]); // empty-array means don't watch for any updates

    const dataTableCallback = (key, value) => {
        switch (key) {
            case 'edit_user_name':
                setUserData({
                    ...userData,
                    user_name: {
                        value,
                        error: value.length > 3 ? undefined : 'min 4 char'
                    }
                })
                break
            case 'edit_email':
                setUserData({
                    ...userData, email: {
                        value,
                        error: value.includes('@') ? undefined : 'no valid email'
                    }
                })
                break
            case 'edit_isDesigner':
                setUserData({ ...userData, isDesigner: !userData.isDesigner })
                break
            case 'edit_password':
                setUserData({
                    ...userData, password: {
                        value,
                        error: value.length > 5 ? undefined : 'min 6 char'

                    }
                })
                break
            case 'edit_confirm_password':
                setUserData({
                    ...userData, confirm_password: {
                        value,
                        error: userData['password'].value === value ? undefined : 'passwords do not match'
                    }
                })
                break
        }
    }
    console.log(userData)
    return (
        <>
            <Modal size='lg' isOpen={props.modalIsOpen} toggle={props.toggle}>
                <ModalHeader>{props.editUserData ? "Edit User" : "Add User"}</ModalHeader>
                <ModalBody>
                    <BaseTable
                        tableData={tableData}
                        callback={dataTableCallback}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button basic color='red' onClick={() => { props.toggle() }} >
                        Abort
      </Button>
                    <Button basic color='green' onClick={() => {
                        if (Object.keys(userData).length === 5) {
                            let validated = true
                            let postData = {}
                            Object.keys(userData).forEach(key => {
                                const value = userData[key]
                                if (value.error) {
                                    validated = false;
                                }
                                if (key === 'isDesigner') {
                                    const roles = ["Annotater"]
                                    if (value) {
                                        roles.push("Designer")
                                    }
                                    postData = { ...postData, roles }
                                }
                                postData = { ...postData, [key]: value.value }
                            })
                            if (validated) {
                                createUser(postData)
                            }
                        } else {
                            alert("Something wrong")
                        }
                        props.toggle()
                    }} >
                        Save
      </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}








