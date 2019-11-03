import React, { useState, useEffect } from 'react'
import { ModalHeader, ModalBody, Modal, ModalFooter } from 'reactstrap';
import BaseTable from './BaseTable'
import { Button } from 'semantic-ui-react'
import { useDispatch } from 'react-redux';
import actions from 'actions/user'

export default (props) => {

    const ERRORS = {
        EDIT_USER_NAME: 'min 4 char',
        EDIT_EMAIL: 'no valid email',
        EDIT_PASSWORD: 'min 6 char',
        EDIT_CONFIRM_PASSWORD: 'passwords do not match'
    }

    const [userData, setUserData] = useState(
        {
            edit_user_name: {
                value: "",
                error: ERRORS.EDIT_USER_NAME
            },
            edit_email: {
                value: "",
                error: ERRORS.EDIT_EMAIL
            },
            edit_isDesigner: false,
            edit_password: {
                value: "",
                error: ERRORS.EDIT_PASSWORD
            },

            edit_confirm_password: {
                value: "",
                error: ERRORS.EDIT_CONFIRM_PASSWORD
            },
        }
    );
    const dispatch = useDispatch();
    const createUser = (payload) => dispatch(actions.createUserAction(payload));
    let data
    if (userData) {
        data = [
            {
                edit_user_name: userData.edit_user_name,
                edit_email: userData.edit_email,
                edit_isDesigner: userData.edit_isDesigner,
                edit_password: userData.edit_password,
                edit_confirm_password: userData.edit_confirm_password
            }
        ]

    }
    // console.log("OOOOOO")
    // console.log(userData)
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
        //setUserData(props.editUserData)
    }, [props.editUserData]); // empty-array means don't watch for any updates

    const dataTableCallback = (key, value) => {

        switch (key) {
            case 'edit_user_name':
                setUserData({
                    ...userData,
                    edit_user_name: {
                        value,
                        error: value.length > 3 ? undefined : ERRORS.EDIT_USER_NAME
                    }
                })
                break
            case 'edit_email':
                setUserData({
                    ...userData,
                    edit_email: {
                        value,
                        error: value.includes('@') ? undefined : ERRORS.EDIT_EMAIL
                    }
                })
                break
            case 'edit_isDesigner':
                setUserData({ ...userData, edit_isDesigner: !userData.edit_isDesigner })
                break
            case 'edit_password':
                setUserData({
                    ...userData,
                    edit_password: {
                        value,
                        error: value.length > 5 ? undefined : ERRORS.EDIT_PASSWORD

                    }
                })
                break
            case 'edit_confirm_password':
                setUserData({
                    ...userData,
                    edit_confirm_password: {
                        value,
                        error: userData['edit_password'].value === value ? undefined : ERRORS.EDIT_CONFIRM_PASSWORD
                    }
                })
                break
        }
    }
    console.log("userData")
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
                        let validated = true
                        Object.keys(userData).forEach(key => {
                            const value = userData[key]
                            if (value.error) {
                                validated = false;
                            }
                        })
                        if (validated) {
                            const roles = ['Annotater']
                            if (userData.edit_isDesigner) {
                                roles.push('Designer')
                            }
                            let postData = {
                                user_name: userData.edit_user_name.value,
                                password: userData.edit_password.value,
                                email: userData.edit_email.value,
                                groups: [],
                                roles
                            }
                            createUser(postData)
                            props.toggle()
                        }
                    }} >
                        Save
      </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}




// {"user_name":"cccc","password":"djangotestd","email":"cccc","groups":[],"roles":["Designer","Annotater"]}



