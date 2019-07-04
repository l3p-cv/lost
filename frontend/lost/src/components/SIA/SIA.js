import React, {Component} from 'react'

import { 
    Col,
    Row
} from 'reactstrap'

import Canvas from './Canvas'
import NavBar from './NavBar'
import ToolBar from './ToolBar'


class SIA extends Component{

  
    
    render(){
        return(
            <React.Fragment>
                <Row>
                    <Col xs='1' sm='1' lg='1'>
                        <ToolBar></ToolBar>
                    </Col>
                    <Col xs='11' sm='11' lg='11'>
                        <Canvas></Canvas>
                    </Col>
                    
                </Row>
                <Row>
                    <Col>
                        <NavBar></NavBar>
                    </Col>
                </Row>
            </React.Fragment>
        )
    }
}



export default SIA
