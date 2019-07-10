import React, {Component} from 'react'
import { Button, CardHeader, Card, CardBody } from 'reactstrap';
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
const { 
    siaSelectTool, siaGetNextImage, siaGetPrevImage, 
    siaSetFullscreen, siaSetImageLoaded, siaRequestAnnoUpdate } = actions

class ToolBar extends Component{

    constructor(props) {
        super(props)
        this.state = {
            fullscreenMode: false,
            position: {
                left: 0,
                top: 0,
                width: 50
            }
        }
    }

    componentDidMount(){
        
    }
    componentDidUpdate(prevProps){
        if (prevProps.annos !== this.props.annos){
            this.props.siaSetFullscreen(this.state.fullscreenMode)
        }

        if (this.props.layoutUpdate !== prevProps.layoutUpdate){
            const container = this.props.container.current.getBoundingClientRect()
            console.log('Toolbar container', container)
            this.setState({
                position: {...this.state.position,
                left: container.left + 10,
                top: container.top + 10,
                }
            })
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
        console.log('Toobar state', this.state)
        return(
        // <Draggable handle=".handle">
        <div style={{position:'fixed', top: this.state.position.top, left:this.state.position.left}}>
                {/* <div className="handle" style={{cursor: 'grab'}}>Drag</div> */}
            <div style={{width:this.state.position.width}}>
                <Button outline onClick={e => console.log('Add caption')} color="primary">
                    <FontAwesomeIcon icon={faImage} size='1x'/>
                </Button>{' '}
                <Button outline onClick={e => this.onClick(e, TOOLS.POINT)} color="primary">
                    <FontAwesomeIcon icon={faDotCircle} size='1x' />
                </Button>{' '}
                <Button outline onClick={e => this.onClick(e, TOOLS.LINE)} color="secondary">
                    <FontAwesomeIcon icon={faWaveSquare} size="1x"/>
                </Button>{' '}
                <Button outline onClick={e => this.onClick(e, TOOLS.BBOX)} color="success">
                    <FontAwesomeIcon icon={faVectorSquare} size="1x"/>
                </Button>{' '}
                <Button outline onClick={e => this.onClick(e, TOOLS.POLYGON)} color="info">
                    <FontAwesomeIcon icon={faDrawPolygon} size="1x"/>
                </Button>{' '}
                <Button outline onClick={() => this.getNextImg()} color="primary">
                    <FontAwesomeIcon icon={faArrowRight} />
                </Button>{' '}
                <Button outline onClick={() => this.getPrevImg()} color="primary">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>{' '}
                <Button outline onClick={() => this.toggleFullscreen()} color="secondary">
                    <FontAwesomeIcon icon={faExpandArrowsAlt} />
                </Button>{' '}
            </div>
        </div>
        // </Draggable>
        )
    }
}

function mapStateToProps(state) {
    return ({
        currentImage: state.sia.annos.image,
        fullscreenMode: state.sia.fullscreenMode,
        annos: state.sia.annos,
        appliedFullscreen: state.sia.appliedFullscreen,
        layoutUpdate: state.sia.layoutUpdate
    })
}
export default connect(mapStateToProps, 
    {siaSelectTool, siaGetNextImage, siaGetPrevImage, 
        siaSetFullscreen, siaSetImageLoaded, siaRequestAnnoUpdate}
)(ToolBar)