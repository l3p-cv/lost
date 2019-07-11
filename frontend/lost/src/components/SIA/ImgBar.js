import React, {Component} from 'react'
import { 
    Button, CardHeader, Card, 
    CardBody, Input, Container, 
    Row, Col, Fade, Toast, ToastBody, ToastHeader
    } from 'reactstrap';
import {connect} from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faDrawPolygon, faVectorSquare, faWaveSquare, faDotCircle, 
    faArrowRight, faArrowLeft , faExpandArrowsAlt
} from '@fortawesome/free-solid-svg-icons'
import { 
    faImage
} from '@fortawesome/free-regular-svg-icons'
import Draggable from 'react-draggable';
import actions from '../../actions'
import * as TOOLS from './types/tools'
const { siaShowImgBar } = actions

class ImgBar extends Component{

    constructor(props) {
        super(props)
        this.state = {
            position: {
                top: 0,
                left: 0,
            }
        }
    }

    componentDidMount(){
        
    }
    componentDidUpdate(prevProps){

        if (this.props.svg !== prevProps.svg){
            this.setState({
                position: {...this.state.position,
                left: this.props.svg.left,
                top: this.props.svg.top,
                }
            })
        }
    }


    render(){
        // if (!this.props.imgBar.show) return null
        if (!this.props.annos.image) return null
        return(
        // <Draggable handle=".handle">
        <div style={{
            position:'fixed', 
            top: this.state.position.top + 5, 
            left:this.state.position.left + 5,
            }}>
                {/* <div className="handle" style={{cursor: 'grab'}}>Drag</div> */}
            <Fade in={this.props.imgBar.show}> 
            <Toast style={{minWidth:"600px"}} >
            <ToastBody>
            {/* <ToastHeader><Button close /></ToastHeader> */}
                <Row>
                    <Col xs='5' sm='5' lg='5'>
                        <Input></Input>
                    </Col>
                    <Col xs='2' sm='2' lg='2'>
                    <FontAwesomeIcon icon={faArrowRight} /> {this.props.annos.image.number} / {this.props.annos.image.amount}
                    </Col>
                    <Col xs='4' sm='4' lg='4'>
                         {this.props.annos.image.url.split('/').pop()} (ID: {this.props.annos.image.id})
                    </Col>
                    <Col xs='1' sm='1' lg='1'>
                         <Button close onClick={() => this.props.siaShowImgBar(false)} />
                    </Col>
                </Row>
                </ToastBody>
            </Toast>
            </Fade>
        </div>
        // </Draggable>
        )
    }
}

function mapStateToProps(state) {
    return ({
        annos: state.sia.annos,
        layoutUpdate: state.sia.layoutUpdate,
        uiConfig: state.sia.uiConfig,
        imgBar: state.sia.imgBar,
        svg: state.sia.svg
    })
}
export default connect(mapStateToProps, 
    {siaShowImgBar}
)(ImgBar)