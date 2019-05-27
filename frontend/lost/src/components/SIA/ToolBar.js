import React, {Component} from 'react'
import { Button } from 'reactstrap';
import {connect} from 'react-redux'
import actions from '../../actions'
import * as TOOLS from './types/tools'
const { siaSelectTool } = actions

class ToolBar extends Component{

    onClick(e, tool){
        this.props.siaSelectTool(tool)
    }

    render(){
        return(<div>
                <Button onClick={e => this.onClick(e, TOOLS.POINT)} color="primary">Point</Button>{' '}
                <Button onClick={e => this.onClick(e, TOOLS.LINE)} color="secondary">Line</Button>{' '}
                <Button onClick={e => this.onClick(e, TOOLS.BBOX)} color="success">BBox</Button>{' '}
                <Button onClick={e => this.onClick(e, TOOLS.POLYGON)} color="info">Polygon</Button>{' '}
            </div>)
    }
}

export default connect(null, 
    {siaSelectTool}
)(ToolBar)