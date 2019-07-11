import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import './SIA.scss';

import {
    Col,
    Row
} from 'reactstrap'

import Canvas from './Canvas'
import ToolBar from './ToolBar'
import ImgBar from './ImgBar'

const { 
    siaAppliedFullscreen, siaLayoutUpdate
} = actions

class SIA extends Component {

    constructor(props) {
        super(props)
        this.state = {
            fullscreenCSS: '',
            didMount: false
        }
        this.container = React.createRef()
    }

    componentDidMount() {
        document.body.style.overflow = "hidden"
        this.setState({didMount:true})
        //document.body.style.position = "fixed"
        window.addEventListener("resize", this.props.siaLayoutUpdate);
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.props.siaLayoutUpdate);
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('Sia did update', this.container.current.getBoundingClientRect())
        this.setFullscreen(this.props.fullscreenMode)
        if (prevState.fullscreenCSS !== this.state.fullscreenCSS){
            this.props.siaAppliedFullscreen(this.props.fullscreenMode)
            this.props.siaLayoutUpdate()
        }
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
        console.log('Sia renders')
        return (
            <div className={this.state.fullscreenCSS} ref={this.container}>
                {/* <Row>
                <Col xs='1' sm='1' lg='1'>
                    <ToolBar></ToolBar>
                </Col>
                <Col xs='10' sm='10' lg='10' >
                    <Canvas ></Canvas>
                </Col>
                
                </Row> */}
                {/* <div style={{float:'left', paddingLeft:'10px', width:'60px'}}>
                    
                </div>
                <div> */}
                    <ToolBar container={this.container}></ToolBar>
                
                    <Canvas container={this.container}></Canvas>
                    <ImgBar container={this.container}></ImgBar>
                
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
    {siaAppliedFullscreen, siaLayoutUpdate}
    , null,
    {})(SIA)

