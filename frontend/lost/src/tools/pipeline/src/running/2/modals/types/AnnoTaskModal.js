import React from 'react'
import { ModalHeader, ModalBody } from 'reactstrap';
import Table from '../../../../forAllComponents/modals/Table'
import CollapseCard from '../../../../forAllComponents/modals/CollapseCard'
export default (props)=>{
    return (
        <>
            <ModalHeader>Annotation Task</ModalHeader>
            <ModalBody>
                <Table
                    data={[
                        {
                            key: 'Annotation Task Name',
                            value: props.annoTask.name
                        },
                        {
                            key: 'Instructions',
                            value: props.annoTask.instructions
                        },
                        {
                            key: 'User Name',
                            value: props.annoTask.userName
                        }
                    ]}
                />
                <CollapseCard>
                    <Table
                        data={[
                            {
                                key: 'Element ID',
                                value: props.id
                            },
                            {
                                key: 'Annotation Task ID',
                                value: props.annoTask.id
                            },
                            {
                                key: 'Type',
                                value: props.annoTask.type
                            },
                            {
                                key: 'Status',
                                value: props.state
                            }
                        ]}
                    />
                </CollapseCard>
            </ModalBody>
        </>
    )
}



