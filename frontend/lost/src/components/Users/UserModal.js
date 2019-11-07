import React, { useState, useEffect } from 'react'
import { ModalHeader, ModalBody, Modal, ModalFooter } from 'reactstrap';
import BaseTable from './BaseTable'
import { Button, RefFindNode } from 'semantic-ui-react'
import { useDispatch, useSelector } from 'react-redux';
import actions from 'actions/user'
import * as Alert from '../BasicComponents/Alert' 

const ERRORS = {
    EDIT_USER_NAME: 'min 4 char',
    EDIT_EMAIL: 'no valid email',
    EDIT_PASSWORD: 'min 5 char',
    EDIT_CONFIRM_PASSWORD: 'passwords do not match'
}
const INIT_USERDATA =         {
    edit_user_name: {
        value: "",
        error: ERRORS.EDIT_USER_NAME,
        disabled: false
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
    edit_groups: []

}

export default (props) => {
    const groups = useSelector((state) => {

        return state.group.groups
    });
    const users = useSelector((state) => state.user.users);


    const [userData, setUserData] = useState(
        INIT_USERDATA
    );
    const dispatch = useDispatch();
    const createUser = (payload) => dispatch(actions.createUserAction(payload));
    const updateUser = (payload) => dispatch(actions.updateUserAction(payload));

    let data
    if (userData) {
        data = [
            {
                edit_user_name: userData.edit_user_name,
                edit_email: userData.edit_email,
                edit_isDesigner: userData.edit_isDesigner,
                edit_password: userData.edit_password,
                edit_confirm_password: userData.edit_confirm_password,
                edit_groups: userData.edit_groups
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
            {
                title: 'Groups',
                key: 'edit_groups'
            },
        ],
        data: data
    }

    useEffect(() => {

        if (props.editUserData) {
            setUserData(
                {
                    idx: props.editUserData.idx,
                    edit_user_name: {
                        value: props.editUserData.user_name,
                        error: undefined,
                        disabled: true
                    },
                    edit_email: {
                        value: props.editUserData.email,
                        error: undefined
                    },
                    edit_isDesigner: props.editUserData.isDesigner,
                    edit_password: {
                        value: "",
                        error: undefined
                    },

                    edit_confirm_password: {
                        value: "",
                        error: undefined
                    },
                    edit_groups: props.editUserData.groups
                }
            )
        }else{
            setUserData(INIT_USERDATA)
        }

    }, [props.editUserData]); // empty-array means don't watch for any updates

    //{"idx":4,"email":"hehes","first_name":"","last_name":"","groups":[],"roles":["Annotator"],"password":null}

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
                        error: value.length > 4 ? undefined : ERRORS.EDIT_PASSWORD
                    },
                    edit_confirm_password: {
                        ...userData.edit_confirm_password,
                        error: userData['edit_confirm_password'].value === value ? undefined : ERRORS.EDIT_CONFIRM_PASSWORD
                    }
                })
                break
            case 'edit_confirm_password':
                setUserData({
                    ...userData,
                    edit_password: {
                        ...userData.edit_password,
                        error: userData['edit_password'].value.length > 4 ? undefined : ERRORS.EDIT_PASSWORD
                    },
                    edit_confirm_password: {
                        value,
                        error: userData['edit_password'].value === value ? undefined : ERRORS.EDIT_CONFIRM_PASSWORD
                    }
                })
                break
            case 'edit_groups':
                setUserData({
                    ...userData,
                    edit_groups: value
                })    
            break
        }
    }

    return (
        <>
            <Modal style={{minWidth: 900}} isOpen={props.modalIsOpen} toggle={props.toggle}>
                <ModalHeader >{props.editUserData ? "Edit User" : "Add User"}</ModalHeader>
                <ModalBody >
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

                            const baseData = {
                                email: userData.edit_email.value,
                                password: userData.edit_password.value,
                                roles,
                                groups: userData.edit_groups.map(el=>el.name)
                            }
                            if(userData.idx){
                                const patchData= {
                                    ...baseData,
                                    idx: userData.idx,
                                    first_name: "",
                                    last_name: ""
                                }
                                updateUser(patchData)
                            }else{
                                const postData = {
                                    ...baseData,
                                    user_name: userData.edit_user_name.value,
                                }
                                if(groups.filter(group=>group.name === postData.user_name).length){
                                    Alert.error("username and groupname can not be the same")
                                    return
                                }
                                if(users.filter(user=>(user.user_name===postData.user_name) || (user.email === postData.email)).length){
                                    Alert.error("username/email already taken")
                                    return
                                }
                               createUser(postData)
    
                            }
                            setUserData(INIT_USERDATA)
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

//{"idx":4,"email":"hehes","first_name":"","last_name":"","groups":[],"roles":["Annotator"],"password":null}



// {"user_name":"cccc","password":"djangotestd","email":"cccc","groups":[],"roles":["Designer","Annotater"]}



