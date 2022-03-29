import React, { useEffect, useState, useRef } from 'react';
import { Icon, Button, Input, Form, TextArea} from 'semantic-ui-react'
import Prompt from "./Prompt"

const AnnoCommentInput = ({triggerInput, iniComment, onClose}) => {
    const [show, setShow] = useState(false)
    const [comment, setComment] = useState('')

    useEffect(() => {
        if (triggerInput!=0){
            setShow(!show)
        }
    }, [triggerInput])
    // const [show, setShow] = useState(true)
    useEffect(() => {
        setComment(iniComment)
    }, [iniComment])

    const handleInputClose = () => {
        setShow(false)
        if (onClose){
            onClose(comment)

        }

    }

    // return "AnnoCommentInput --> Test"

    return <Prompt 
        // onClick={() => handleInputClose()}
        active={show}
        header={<div>
           Add a comment to this annotation
        </div>}
        content={<div>
            <Form onClick={() => {}} onSubmit={() => handleInputClose()}>
                <TextArea placeholder='Write a comment' onClick={() => {}} 
                    onChange={(e) => setComment(e.target.value)} >
                    {comment}
                </TextArea>
            </Form>
            {/* <Input placeholder='Comment input' type='text' focus={true} /> */}
            <Button basic color="green" inverted
                onClick={() => handleInputClose()}
            >
                <Icon name='check'></Icon>
                OK
            </Button>
        </div>}
    />
}

export default AnnoCommentInput