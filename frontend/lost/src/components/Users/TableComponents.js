import React from 'react'
import {Icon, Button, Input} from 'semantic-ui-react'
export function timesIcon(){
    return <Icon size='big' name='times circle outline' color="red" />
}

export function checkIcon(){
    return <Icon size='big' name='check circle outline' color="green" />
}

export function editButton(onClick, row){
    return (
        <Button basic color='blue' onClick={()=>{onClick(row)}}>
        Edit
      </Button>
    )
}

export function textInput(key, value, callback){
    return (
        <Input value={value} style={{width: 130}}placeholder='Search...' onChange={(e)=>{callback(key, e.currentTarget.value)}}/>
    )
}