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
const { siaShowImgBar, siaSetUIConfig } = actions

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
                left: container.right - 250,
                top: container.top,
                }
            })
        }
    }

    onDismiss(type){
        switch (type){
            case 'AnnoDetails':
                console.log('InfoBoxArea Dismiss AnnoDetails')
                this.props.siaSetUIConfig(
                    {...this.props.uiConfig,
                        annoDetails: {
                            ...this.props.uiConfig.annoDetails,
                            visible: false
                        }
                    }
                )
                break
            default:
                break
        }
    }

    render(){
        if (!this.props.annos.image) return null
        return(
        // <Draggable handle=".handle">
        <div>
        <AnnoDetails anno={this.props.selectedAnno} 
            svg={this.props.svg}
            defaultPos={this.state.position}
            onDismiss={() => this.onDismiss('AnnoDetails')}
            visible={this.props.uiConfig.annoDetails.visible}
        />
            
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
        imgBar: state.sia.imgBar,
        svg: state.sia.svg
    })
}
export default connect(mapStateToProps, 
    {siaShowImgBar, siaSetUIConfig}
)(InfoBoxes)