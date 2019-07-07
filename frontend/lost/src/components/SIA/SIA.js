import React, { Component } from 'react'
import { connect } from 'react-redux'
import './SIA.scss';

import {
    Col,
    Row
} from 'reactstrap'

import Canvas from './Canvas'
import NavBar from './NavBar'
import ToolBar from './ToolBar'


class SIA extends Component {

    constructor(props) {
        super(props)
        this.state = {
            fullscreenCSS: ''
        }
    }

    componentDidMount() {
        document.body.style.overflow = "hidden"
        //document.body.style.position = "fixed"
    }

    componentDidUpdate(prevProps, prevState) {
        this.setFullscreen(this.props.fullscreenMode)
    }

    setFullscreen(fullscreen = true) {
        if (fullscreen) {
            if (this.state.fullscreenCSS !== 'sia-fullscreen') {
                this.setState({ fullscreenCSS: 'sia-fullscreen' })
            }
        } else {
            if (this.state.fullscreenCSS !== '') {
                this.setState({
                    fullscreenCSS: ''
                })
            }
        }
    }
    render() {
        return (
            <div className={this.state.fullscreenCSS}>
                <Row>
                <Col xs='1' sm='1' lg='1'>
                    <ToolBar></ToolBar>
                </Col>
                <Col xs='10' sm='10' lg='10' >
                    <Canvas ></Canvas>
                </Col>
                </Row>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        fullscreenMode: state.sia.fullscreenMode
    })
}

export default connect(
    mapStateToProps,
    {}
    , null,
    {})(SIA)

