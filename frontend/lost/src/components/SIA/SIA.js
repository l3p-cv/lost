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
            container: undefined,
            fullscreenCSS: ''
        }
        this.container = React.createRef()
    }

    componentDidMount() {
        document.body.style.overflow = "hidden"
        //document.body.style.position = "fixed"

        this.setState({
            container: this.container.current.getBoundingClientRect()
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.fullscreenCSS !== this.state.fullscreenCSS) {
            this.setState({
                container: this.container.current.getBoundingClientRect()
            })
        }
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
                <div ref={this.container}>
                    <Canvas container={this.state.container}></Canvas>
                    </div>
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

