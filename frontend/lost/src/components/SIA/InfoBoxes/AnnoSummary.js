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
import actions from '../../../actions'
import * as TOOLS from '../types/tools'
const { siaShowImgBar } = actions

class AnnoSummary extends Component{

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount(){
        
    }
    componentDidUpdate(prevProps){

    }


    render(){
        // if (!this.props.imgBar.show) return null
        if (!this.props.annos.image) return null
        return(
        <Draggable handle=".handle">
        <Card>
            <CardHeader>
            <div className="handle" style={{cursor: 'grab'}}>Annotation Summary</div> 

            </CardHeader>
            <CardBody>
                Bla Bla
            </CardBody>
        </Card>
        
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
)(AnnoSummary)