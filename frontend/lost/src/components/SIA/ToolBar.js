import React, {Component} from 'react'
import { Button } from 'reactstrap';
import {connect} from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDrawPolygon, faVectorSquare, faWaveSquare, faDotCircle } from '@fortawesome/free-solid-svg-icons'
import actions from '../../actions'
import * as TOOLS from './types/tools'
const { siaSelectTool } = actions

class ToolBar extends Component{

    onClick(e, tool){
        this.props.siaSelectTool(tool)
    }

    render(){
        return(<div>
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
            </div>)
    }
}

export default connect(null, 
    {siaSelectTool}
)(ToolBar)