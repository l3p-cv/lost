import React, {useState, useEffect, useRef} from 'react'
// import {connect} from 'react-redux'
import { Button, Icon, Divider, Header, TextArea, Form, Label} from 'semantic-ui-react'
import InfoBox from './InfoBox'
// import actions from '../../../../actions'
// import * as transform from '../utils/transform'
// const { siaShowImgBar } = actions

const AnnoDetails = (props) => {
// class AnnoDetails extends Component{

//     constructor(props) {
//         super(props)
//         this.state = {
//         }
//     }

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

    // const renderMeta = () => {
    //     if (props.anno.id){
    //         return (
    //             <Card.Meta>Type: {this.props.anno.type} </Card.Meta>
    //         )
    //     }
    // }



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
            // return <Button basic color="green"
            //         onClick={() => onCommentUpdate()}
            //     >
            //         <Icon name='save'></Icon>
            //         OK
            //     </Button>
//   <Reveal animated='fade'>
//     <Reveal.Content visible>
//       <Image src='https://react.semantic-ui.com/images/wireframe/square-image.png' size='small' />
//     </Reveal.Content>
//     <Reveal.Content hidden>
//       <Image src='https://react.semantic-ui.com/images/avatar/large/ade.jpg' size='small' />
//     </Reveal.Content>
//   </Reveal>
            return <Label as='a' 
                        corner='right' 
                        // attached='top'
                        // ribbon
                        icon='save' color='red' 
                        >
                        {/* Unsaved */}
                    </Label>
            // return <Button color='green' basic animated='vertical' onClick={()=> onCommentUpdate()}>
            //     <Button.Content hidden>Save</Button.Content>
            //     <Button.Content visible>
            //         <Icon name='save' />
            //     </Button.Content>
            //     </Button>
        }
    }

    const renderComment = ()=>{
        console.log('comment', comment)
        return <div>
            <Form onClick={() => {}} >
                {renderSaveBtn()}
                <TextArea placeholder='Write a comment' 
                    ref={tARef}
                    value={comment}
                    onBlur={() => onCommentUpdate()}
                    onFocus={() => setShowSaveBtn(true)}
                    onChange={(e) => setComment(e.target.value)} >
                </TextArea>
            </Form>
            {/* <Input placeholder='Comment input' type='text' focus={true} /> */}
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
            // const lbls = this.props.anno.labelIds.map((lblId) => {
            //     return this.props.possibleLabels.find( e => {
            //         return lblId === e.id
            //     })
            // })
            if (!lbls) return "No Label"
            return lbls
        } else {
            return 'No Label'
        }
    }

    const renderDescription = () => {
        if (props.anno){
            // let box = transform.getBox(props.anno.data, props.anno.type)
            // if (!box[1]) return "No annotation selected!"
            // box = transform.toBackend(box, props.svg, 'bBox')
            return (
                <div>
                        <Header> 
                            Labels
                        {/* <Icon name="arrow right"/> */}
                        </Header>
                        <div>
                            {/* {"x / y"} */}
                            {/* <Icon name="arrow right"/> */}

                            {renderLabels()}
                        </div>
                <Divider horizontal> Comment </Divider>
                {renderComment()}
                {/* <Form>
                <TextArea onBlur={() => console.log('BLUR')}>
                        {props.anno.comment ? props.anno.comment : 'No comment'}
                </TextArea>
                </Form> */}
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

// function mapStateToProps(state) {
//     return ({
//         annos: state.sia.annos,
//         layoutUpdate: state.sia.layoutUpdate,
//         uiConfig: state.sia.uiConfig,
//         imgBar: state.sia.imgBar
//     })
// }
// export default connect(mapStateToProps, 
//     {siaShowImgBar}
// )(AnnoDetails)
export default AnnoDetails