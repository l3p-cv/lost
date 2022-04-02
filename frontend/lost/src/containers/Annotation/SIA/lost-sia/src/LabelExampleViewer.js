import Prompt from './Prompt'
import React, {useState} from 'react'
import { Card, Dimmer, Header, Image } from 'semantic-ui-react'

const LabelExampleViewer = (props) => {

    const renderContent = () => {
        if (!props.lbl) return null
        return <div>
            {/* <Card> */}
            <Header inverted>{props.lbl.label}</Header>
            {props.lbl.description}
            <Image src={props.exampleImg} centered size='medium'></Image>
            {/* </Card> */}
        </div>
    }

    const handlePromptClick = () => {
        if (props.onClose){
            props.onClose()
        }
    }

    return <Prompt onClick={() => {handlePromptClick()}}
            active={props.active} content={renderContent()} 
        />

}

export default LabelExampleViewer