import React from 'react'
import {Icon, Button} from 'semantic-ui-react'
export function timesIcon(){
    return <Icon size='big' name='times circle outline' color="red" />
}

export function checkIcon(){
    return <Icon size='big' name='check circle outline' color="green" />
}

export function editIcon(onClick){
    return (
        <Button basic color='blue' onClick={()=>{onClick()}}>
        Edit
      </Button>
    )
    
    
    
    
}

