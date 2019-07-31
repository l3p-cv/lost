import React, {Component} from 'react'
// import { 
//     Button, CardHeader, 
//     CardBody, Input, Container, 
//     Row, Col, Fade, Toast, ToastBody, ToastHeader
//     } from 'reactstrap';
import {connect} from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faDrawPolygon, faVectorSquare, faWaveSquare, faDotCircle, 
    faArrowRight, faArrowLeft , faExpandArrowsAlt
} from '@fortawesome/free-solid-svg-icons'
import { 
    faImage
} from '@fortawesome/free-regular-svg-icons'
import { Card, Icon, Segment, Menu, Input, Message, Statistic, Divider, Button, List, Label } from 'semantic-ui-react'
import Draggable from 'react-draggable';
import actions from '../../../actions'
import * as TOOLS from '../types/tools'
import * as utils from '../utils/transform'
const { siaShowImgBar } = actions

class AnnoDetails extends Component{

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount(){
        
    }
    componentDidUpdate(prevProps){

    }

    renderMeta(){
        if (this.props.anno.id){
            return (
                <Card.Meta>Type: {this.props.anno.type} </Card.Meta>
            )
        }
    }
    renderDescription(){
        if (this.props.anno.id){
            const box = utils.getBox(this.props.anno.data, this.props.anno.type)
            console.log('AnnoDetails box', box)
            return (
                <Card.Description>
                    <Statistic.Group widths='one' size='mini'>
                        <Statistic>
                            <Statistic.Label> 
                                x / y
                            {/* <Icon name="arrow right"/> */}
                            </Statistic.Label>
                            <Statistic.Value>
                                {/* {"x / y"} */}
                                {/* <Icon name="arrow right"/> */}

                                {"("+box[0].x.toFixed(0)+" , "+ box[0].y.toFixed(0)+")"}
                            </Statistic.Value>
                        </Statistic>
                        {/* <Statistic>
                            <Statistic.Value>{box[0].y.toFixed(0)}</Statistic.Value>
                            <Statistic.Label>
                                <Icon name="arrow down"/>
                                y
                            </Statistic.Label>
                        </Statistic> */}
                        
                    </Statistic.Group>
                    <Divider horizontal> Size </Divider>
                    <Statistic.Group widths='two' size='mini'>
                        <Statistic >
                            <Statistic.Value>
                                {(box[1].x-box[0].x).toFixed(0)}
                            </Statistic.Value>
                            <Statistic.Label>
                                <Icon name="arrows alternate horizontal"/>
                                width
                            </Statistic.Label>
                        </Statistic>
                        <Statistic>
                            <Statistic.Value>
                                {(box[2].y-box[1].y).toFixed(0)}
                            </Statistic.Value>
                            <Statistic.Label>
                                <Icon name="arrows alternate vertical"/>
                                height
                            </Statistic.Label>
                        </Statistic>
                    </Statistic.Group>
                    
                </Card.Description>
            )
        } else {
            return <Card.Description>No annotation selected!</Card.Description>
        }
    }

    
    render(){
        if (!this.props.annos.image) return null
        console.log('Annotation Details', this.props.anno)
        return(
        <Draggable handle=".handle">
            <div className="handle" style={{cursor: 'grab'}}>
        

            <Card
                // onDismiss={(e) => {console.log('Dissmissed Card', e)}}
                style={{opacity:0.8}}
                raised
            >
            <Card.Content>
            <Card.Header>
            Annotation Details
            <Button basic floated='right' icon='close'/>
            {/* {/* <Icon name="close" size="small"></Icon> */}
            {/* <Menu secondary>
                <Menu.Menu position='right'>
                <Menu.Item icon="close" onClick={e => {console.log('Clicked on dissmiss')}}>
                </Menu.Item>
                </Menu.Menu>
            </Menu> */}
            </Card.Header>
            {this.renderMeta()}
            {this.renderDescription()}
            </Card.Content>

            </Card>
            {/* <Segment raised> */}
            <Message 
                style={{opacity:0.8}}
                onDismiss={e => {console.log('Clicked on dissmiss')}}
                size="small"
            >
                <Message.Header>Annotation Details</Message.Header>
                <Divider></Divider>
                {/* {this.renderMeta()} */}
                {this.renderDescription()}
            </Message>
            {/* </Segment> */}
            </div> 
        
        
        </Draggable>
        )
    }
}

function mapStateToProps(state) {
    return ({
        annos: state.sia.annos,
        layoutUpdate: state.sia.layoutUpdate,
        uiConfig: state.sia.uiConfig,
        imgBar: state.sia.imgBar
    })
}
export default connect(mapStateToProps, 
    {siaShowImgBar}
)(AnnoDetails)