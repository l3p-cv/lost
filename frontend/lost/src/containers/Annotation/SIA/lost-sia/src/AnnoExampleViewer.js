import Prompt from './Prompt'
import React, {useState} from 'react'
import { Card, Divider, Dimmer, Header, Image } from 'semantic-ui-react'

const LabelExampleViewer = (props) => {

    const requestExample = (e) => {
        e.stopPropagation()
        if (props.onRequestExample){
            props.onRequestExample()
        }
    }
    const renderContent = () => {
        if (!props.lbl) return null
        if (!props.exampleImg) return null
        const description = <div>
              {/* <Divider horizontal> Description </Divider> */}
            {props.lbl.description}
              <Divider horizontal> comment </Divider>
            { props.exampleImg.anno ? props.exampleImg.anno.comment : "no comment" }
        </div>
        return <div>
            <Card 
                
                // image={props.exampleImg.img}
                // description={props.lbl.description}
                // header={props.lbl.label}
                // // description={props.exampleImg.anno.comment}
                // extra={props.exampleImg.anno.comment}
            >
                <Image onClick={(e) => requestExample(e)} src={props.exampleImg.img} wrapped ui={false} />
                <Card.Content>
                <Card.Header >{props.lbl.label}</Card.Header>
                {/* <Card.Description>{props.lbl.description}</Card.Description> */}
                <Card.Description>{description}</Card.Description>
                {/* <Card.Description>{props.exampleImg.anno.comment}</Card.Description> */}
                </Card.Content>
            </Card>
            {/* <Header inverted>{props.lbl.label}</Header>
            {props.lbl.description}
            <Image src={props.exampleImg.img} centered size='medium'></Image> */}
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