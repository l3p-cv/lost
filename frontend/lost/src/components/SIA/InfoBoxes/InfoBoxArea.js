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
import AnnoDetails from './AnnoDetails'
import actions from '../../../actions'
import * as TOOLS from '../types/tools'
const { siaShowImgBar } = actions

class InfoBoxes extends Component{

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

        if (this.props.layoutUpdate !== prevProps.layoutUpdate){
            const container = this.props.container.current.getBoundingClientRect()
            console.log('ImgBar layout update container', container)
            this.setState({
                position: {...this.state.position,
                left: container.right - 400,
                top: container.top,
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
            width: 250
            }}>
        <AnnoDetails anno={this.props.selectedAnno}></AnnoDetails> 
        {/* <InfoBox></InfoBox> */}
            
        </div>
        // </Draggable>
        )
    }
}

function mapStateToProps(state) {
    return ({
        annos: state.sia.annos,
        selectedAnno: state.sia.selectedAnno,
        layoutUpdate: state.sia.layoutUpdate,
        uiConfig: state.sia.uiConfig,
        imgBar: state.sia.imgBar
    })
}
export default connect(mapStateToProps, 
    {siaShowImgBar}
)(InfoBoxes)