import React from 'react'
import { Icon, Button, Input, Label, Form } from 'semantic-ui-react'
import * as Alert from '../BasicComponents/Alert'
export function timesIcon(callback) {
    return <Icon size='big' name='times circle outline' color="red" onClick={() => { callback("edit_isDesigner") }} />
}

export function checkIcon(callback) {
    return <Icon size='big' name='check circle outline' color="green" onClick={() => { callback("edit_isDesigner") }} />
}

export function editButton(onClick, row) {
    return (
        <Button basic color='blue' onClick={() => { onClick(row) }}>
            Edit
      </Button>
    )
}
export function deleteButton(onClick, row) {
    return (
        <Button basic color='red' onClick={() => {
            Alert.alertDelete()
        }

        }>
            Delete
      </Button>
    )
}


function textInputInner(key, value, callback) {
    if(!value)value={}
    return (
        <Form.Input
            style={{ width: 130 }}
            value={value.value}
            error= {value.error}
            fluid
            onChange={(e) => { 
                callback(
                    key, 
                    e.currentTarget.value,                    
                    ) 
                }
            }
        />
    )
}
export function textInput(key, value, callback) {
    return (
        <Form>
            {textInputInner(key, value, callback)}
        </Form>
    )
}

{/* <Input error value={value} style={{ width: 130 }} placeholder='Search...' onChange={(e) => { callback(key, e.currentTarget.value) }} /> */ }
