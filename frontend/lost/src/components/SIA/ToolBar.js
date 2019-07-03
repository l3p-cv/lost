import React, {Component} from 'react'
import { Button } from 'reactstrap';
import {connect} from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faDrawPolygon, faVectorSquare, faWaveSquare, faDotCircle, 
    faArrowRight, faArrowLeft 
} from '@fortawesome/free-solid-svg-icons'
import Draggable from 'react-draggable';
import actions from '../../actions'
import * as TOOLS from './types/tools'
const { siaSelectTool, siaGetNextImage, siaGetPrevImage } = actions

class ToolBar extends Component{

    onClick(e, tool){
        this.props.siaSelectTool(tool)
    }

    getNextImg(){
        this.props.siaGetNextImage(this.props.currentImage.id)
    }

    getPrevImg(){
        this.props.siaGetPrevImage(this.props.currentImage.id)
    }

    render(){
        return(
        <Draggable handle=".handle">
        <div>
        <div>
          <div className="handle" style={{cursor: 'grab'}}>Drag from here</div>
        </div>
                <Button onClick={e => this.onClick(e, TOOLS.POINT)} color="primary">
                    Point <FontAwesomeIcon icon={faDotCircle} />
                </Button>{' '}
                <Button onClick={e => this.onClick(e, TOOLS.LINE)} color="secondary">
                    Line <FontAwesomeIcon icon={faWaveSquare} />
                </Button>{' '}
                <Button onClick={e => this.onClick(e, TOOLS.BBOX)} color="success">
                    BBox <FontAwesomeIcon icon={faVectorSquare} size="3x"/>
                </Button>{' '}
                <Button onClick={e => this.onClick(e, TOOLS.POLYGON)} color="info">
                    <FontAwesomeIcon icon={faDrawPolygon} size="3x"/>
                </Button>{' '}
                <Button onClick={() => this.getNextImg()} color="primary">
                    <FontAwesomeIcon icon={faArrowRight} />
                </Button>{' '}
                <Button onClick={() => this.getPrevImg()} color="primary">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>{' '}
            </div>
        </Draggable>)
    }
}

function mapStateToProps(state) {
    return ({
        currentImage: state.sia.annos.image
    })
}
export default connect(mapStateToProps, 
    {siaSelectTool, siaGetNextImage, siaGetPrevImage}
)(ToolBar)