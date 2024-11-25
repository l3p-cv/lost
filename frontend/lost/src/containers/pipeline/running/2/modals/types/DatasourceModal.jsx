import React from 'react'
import { ModalHeader, ModalBody } from 'reactstrap'
import Table from '../../../../globalComponents/modals/Table'
import CollapseCard from '../../../../globalComponents/modals/CollapseCard'
export default (props) => {
    return (
        <>
            <ModalHeader>Datasource</ModalHeader>
            <ModalBody>
                <Table
                    data={[
                        {
                            key: 'Path',
                            value: props.datasource.rawFilePath,
                        },
                        {
                            key: 'Element ID',
                            value: props.id,
                        },
                    ]}
                />
                <CollapseCard>
                    <Table
                        data={[
                            {
                                key: 'Datasource ID',
                                value: props.datasource.id,
                            },
                            {
                                key: 'Status',
                                value: props.state,
                            },
                        ]}
                    />
                </CollapseCard>
            </ModalBody>
        </>
    )
}
