import React, {useState} from 'react'
import { ModalHeader, ModalBody, Modal, ModalFooter } from 'reactstrap';
import BaseTable from './BaseTable'
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
            title: 'Password',
            key: 'new_password'
        },
        {
            title: 'Confirm Password',
            key: 'confirm_password'
        },
    ],
    data: [
        {user_name: "", email: "", isDesigner: "", isAnnotator: "", new_password: "", confirm_password: "" }
    ]
}

export default (props) => {

    return(
        <>
        <Modal size='lg' isOpen={props.modalIsOpen} toggle={props.toggle}>
            <ModalHeader>{props.title}</ModalHeader>
            <ModalBody>
                <BaseTable
                 tableData= {tableData}
                />
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
        </Modal>
    </>
    )
}


    





