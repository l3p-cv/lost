import React, {Component} from 'react'
import { Button } from 'reactstrap';
import {connect} from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faDrawPolygon, faVectorSquare, faWaveSquare, faDotCircle, 
    faArrowRight, faArrowLeft , faExpandArrowsAlt
} from '@fortawesome/free-solid-svg-icons'
import Draggable from 'react-draggable';
import actions from '../../actions'
import * as TOOLS from './types/tools'
const { 
    siaSelectTool, siaGetNextImage, siaGetPrevImage, 
    siaSetFullscreen, siaSetImageLoaded, siaRequestAnnoUpdate } = actions

class ToolBar extends Component{

    constructor(props) {
        super(props)
        this.state = {
            fullscreenMode: false
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.annos !== this.props.annos){
            this.props.siaSetFullscreen(this.state.fullscreenMode)
        }
    }

    onClick(e, tool){
        this.props.siaSelectTool(tool)
    }

    getNextImg(){
        this.props.siaSetImageLoaded(false)
        this.props.siaGetNextImage(this.props.currentImage.id)
    }

    getPrevImg(){
        this.props.siaSetImageLoaded(false)
        this.props.siaGetPrevImage(this.props.currentImage.id)
    }

    toggleFullscreen(){
        this.props.siaRequestAnnoUpdate()
        this.setState({
            fullscreenMode: !this.state.fullscreenMode
        })
        // this.props.siaSetFullscreen(!this.props.fullscreenMode)
    }

    render(){
        return(
        <Draggable handle=".handle">
        <div>
        <div>
          <div className="handle" style={{cursor: 'grab'}}>Drag from here</div>
        </div>
                <Button onClick={e => this.onClick(e, TOOLS.POINT)} color="primary">
                    <FontAwesomeIcon icon={faDotCircle} />
                </Button>{' '}
                <Button onClick={e => this.onClick(e, TOOLS.LINE)} color="secondary">
                    <FontAwesomeIcon icon={faWaveSquare} />
                </Button>{' '}
                <Button onClick={e => this.onClick(e, TOOLS.BBOX)} color="success">
                    <FontAwesomeIcon icon={faVectorSquare} size="1x"/>
                </Button>{' '}
                <Button onClick={e => this.onClick(e, TOOLS.POLYGON)} color="info">
                    <FontAwesomeIcon icon={faDrawPolygon} size="1x"/>
                </Button>{' '}
                <Button onClick={() => this.getNextImg()} color="primary">
                    <FontAwesomeIcon icon={faArrowRight} />
                </Button>{' '}
                <Button onClick={() => this.getPrevImg()} color="primary">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>{' '}
                <Button outline onClick={() => this.toggleFullscreen()} color="secondary">
                    <FontAwesomeIcon icon={faExpandArrowsAlt} />
                </Button>{' '}
            </div>
        </Draggable>)
    }
}

function mapStateToProps(state) {
    return ({
        currentImage: state.sia.annos.image,
        fullscreenMode: state.sia.fullscreenMode,
        annos: state.sia.annos
    })
}
export default connect(mapStateToProps, 
    {siaSelectTool, siaGetNextImage, siaGetPrevImage, 
        siaSetFullscreen, siaSetImageLoaded, siaRequestAnnoUpdate}
)(ToolBar)