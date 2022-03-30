import React, {useState, useEffect, useRef} from 'react'
import { Button, Icon, Divider, Header, TextArea, Form, Label} from 'semantic-ui-react'
import InfoBox from './InfoBox'

const AnnoDetails = (props) => {

    const [comment, setComment] = useState('')
    const [showSaveBtn, setShowSaveBtn] = useState(false)
    const tARef = useRef()
    useEffect(() => {
        if (props.anno){
            if (props.anno.comment){
                setComment(props.anno.comment)
            } else {
                setComment('')
            }
        }
    }, [props.anno])

    useEffect(() => {
        if (tARef.current){
            tARef.current.focus()
        }
    }, [props.commentInputTrigger])

    const onDismiss = () => {
        if (props.onDismiss){
            props.onDismiss()
        }
    }

    const onCommentUpdate = () => {
        if (props.onCommentUpdate){
            props.onCommentUpdate(comment)
        }
        setShowSaveBtn(false)
    }

    const renderSaveBtn = () => {
        if (showSaveBtn){
            return <Label as='a' 
                        corner='right' 
                        icon='save' color='red' 
                        >
                    </Label>
        }
    }

    const renderComment = ()=>{
        return <div>
            <Form onClick={() => {}} >
                {renderSaveBtn()}
                <TextArea placeholder='Write a comment' 
                    ref={tARef}
                    value={comment}
                    rows={2}
                    onBlur={() => onCommentUpdate()}
                    onFocus={() => setShowSaveBtn(true)}
                    onChange={(e) => setComment(e.target.value)} >
                </TextArea>
            </Form>
        </div>
    }
    const renderLabels = () => {
        if (props.anno){
            const selectedLabelIds = props.anno.labelIds
            if (!selectedLabelIds) return 'No Label'

            let lbls = ''
            props.anno.labelIds.forEach((lbl, idx) => {
                const labelObject = props.possibleLabels.find(el => {
                    return el.id === lbl
                })
                if (idx > 0) lbls += ', '
                lbls += labelObject.label
            })
            if (!lbls) return "No Label"
            return lbls
        } else {
            return 'No Label'
        }
    }

    const renderDescription = () => {
        if (props.anno){
            return (
                <div>
                        <Header> 
                            Labels
                        </Header>
                        <div>
                            {renderLabels()}
                        </div>
                <Divider horizontal> Comment </Divider>
                {renderComment()}
                </div>
            )
        } else {
            return "No annotation selected!"
        }
    }

    return <InfoBox
        header={'Annotation Details'}
        content={renderDescription()}
        visible={props.visible}
        defaultPos={props.defaultPos}
        onDismiss={e => onDismiss()}
    />
}

export default AnnoDetails