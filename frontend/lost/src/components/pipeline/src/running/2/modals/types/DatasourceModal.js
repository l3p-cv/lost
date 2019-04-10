import React from 'react'
import {ModalHeader, ModalBody } from 'reactstrap';
import Table from '../../../../globalComponents/modals/Table'
import CollapseCard from '../../../../globalComponents/modals/CollapseCard'
export default (props) =>{
  return (
    <>
      <ModalHeader>Datasource</ModalHeader>
      <ModalBody>
        <Table
          data={[
            {
              key: 'Type',
              value: props.datasource.type
            },
            {
              key: 'Path',
              value: props.datasource.rawFilePath
            }
          ]}
        />
        <CollapseCard>
          <Table
            data={
              [
                {
                  key: 'Element ID',
                  value: props.id
                },
                {
                  key: 'Datasource ID',
                  value: props.datasource.id
                },
                ,
                {
                  key: 'Status',
                  value: props.state
                }
              ]
            }
          />
        </CollapseCard>
      </ModalBody>
    </>
  )
}




