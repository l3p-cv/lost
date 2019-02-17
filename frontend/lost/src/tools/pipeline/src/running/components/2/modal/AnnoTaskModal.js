import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import Table from './Table'
class AnnoTaskModal extends Component {
    renderBody() {
        return (
            <Table
                data={[
                    {
                        key: 'Annotation Task Name',
                        value: this.props.annoTask.name
                    },
                    {
                        key: 'Instructions',
                        value: this.props.annoTask.instructions
                    },
                    {
                        key: 'User Name',
                        value: this.props.annoTask.userName
                    },
                    {
                        key: 'Element ID',
                        value: this.props.id
                    },
                    {
                        key: 'Annotation Task ID',
                        value: this.props.annoTask.id
                    },
                    {
                        key: 'Type',
                        value: this.props.annoTask.type
                    },
                    {
                        key: 'Status',
                        value: this.props.state
                    }
                ]}
            />
        )
    }
    render() {
        return (
            <>
                <ModalHeader>Annotation Task</ModalHeader>
                <ModalBody>
                    {this.renderBody()}
                </ModalBody>
            </>
        )
    }
}

export default AnnoTaskModal



