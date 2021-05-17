import React from 'react'
import {ModalHeader, ModalBody } from 'reactstrap';
import Table from '../../../../globalComponents/modals/Table'

export default (props) =>{
  return (
    <>
      <ModalHeader>Loop Modal</ModalHeader>
      <ModalBody>
      <Table
          data={[
            {
              key: 'Element ID',
              value: props.id
            },
            {
              key: 'Loop ID',
              value: props.loop.id
            },
            {
              key: 'Breakloop',
              value: String(props.loop.isBreakLoop)
            },
            {
              key: 'Iteration',
              value: props.loop.iteration
            },
            {
              key: 'Max Iteration',
              value: typeof props.loop.maxIteration === 'number' && (props.loop.maxIteration > -1)?props.loop.maxIteration:'Infinity'
            },
            {
              key: 'Jump ID',
              value: props.loop.peJumpId
            },
            {
              key: 'Status',
              value: props.state
            }
          ]}
        />
      </ModalBody>
    </>
  )
}


