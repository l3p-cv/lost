import React from 'react'
import { ModalHeader, ModalBody, Button } from 'reactstrap';
import Table from '../../../../globalComponents/modals/Table'
import CollapseCard from '../../../../globalComponents/modals/CollapseCard'
import { createHashHistory } from 'history'

function handleSiaRewiewClick(siaReviewSetElement, elementId){
    siaReviewSetElement(elementId)
    createHashHistory().push('/sia-review')
}

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
                            key: 'User/Group Name',
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
                <Button color="info" style={{ marginLeft:10, marginTop:20, marginBottom: '1rem' }}
                    onClick={e => handleSiaRewiewClick(props.siaReviewSetElement, props.id)}>Review Annotations</Button>

            </ModalBody>
        </>
    )
}



