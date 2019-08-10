import React, {Component} from 'react'
import { Icon, Menu, Popup, Checkbox, Dimmer, Button, Header} from 'semantic-ui-react'
import {connect} from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faDrawPolygon, faVectorSquare, faWaveSquare, faDotCircle, 
    faArrowRight, faArrowLeft , faExpandArrowsAlt, faCheck, faPaperPlane
} from '@fortawesome/free-solid-svg-icons'
import { 
    faImage
} from '@fortawesome/free-regular-svg-icons'
import Draggable from 'react-draggable';
// import SIASettingModal from './SIASettingModal'
import SIASettingButton from './SIASettingButton'
import { createHashHistory } from 'history'

import actions from '../../actions'
import * as TOOLS from './types/tools'
const { 
    siaSelectTool, siaGetNextImage, siaGetPrevImage, 
    siaSetFullscreen, siaSetImageLoaded,
    selectAnnotation, siaShowImgBar, siaSetTaskFinished,siaLayoutUpdate
} = actions

class ToolBar extends Component{

    constructor(props) {
        super(props)
        this.state = {
            fullscreenMode: false,
            position: {
                left: 0,
                top: 0,
                width: 40
            },
            showFinishPrompt: false
        }
        this.history = createHashHistory()

    }

    componentDidMount(){
        
    }
    componentDidUpdate(prevProps, prevState){
        if (prevState.fullscreenMode !== this.state.fullscreenMode){
            this.props.siaSetFullscreen(this.state.fullscreenMode)
        }

        if (this.props.layoutUpdate !== prevProps.layoutUpdate){
            const container = this.props.container.current.getBoundingClientRect()
            console.log('Toolbar container', container)
            this.setState({
                position: {...this.state.position,
                left: 0,
                top: container.top,
                }
            })
        }
    }

    onClick(e, tool){
        this.props.siaSelectTool(tool)
    }

    getNextImg(){
        // this.props.siaSetImageLoaded(false)
        this.props.selectAnnotation(undefined)
        this.props.siaGetNextImage(this.props.currentImage.id)
    }

    getPrevImg(){
        // this.props.siaSetImageLoaded(false)
        this.props.selectAnnotation(undefined)
        this.props.siaGetPrevImage(this.props.currentImage.id)
    }

    setFinished(){
        this.props.siaSetTaskFinished()
        this.history.push('/dashboard')
        
    }

    toggleFinishPrompt(){
        this.setState({
            showFinishPrompt: !this.state.showFinishPrompt
        })
    }

    toggleFullscreen(){
        // this.props.selectAnnotation(undefined)
        this.setState({
            fullscreenMode: !this.state.fullscreenMode
        })
        // this.props.siaSetFullscreen(!this.props.fullscreenMode)
    }

    toggleImgBar(){
        this.props.siaShowImgBar(!this.props.imgBar.show)
    }

    renderPointIcon(){
        return (
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" 
                // x="0px" y="0px"
                // width="1190.549px" height="841.891px" 
                viewBox="0 0 1190.549 841.891" 
            >
                <path fill="currentColor" d="M748.197,408.286c0,151.355-122.699,274.058-274.059,274.058c-151.357,0-274.057-122.703-274.057-274.058
                    c0-151.356,122.7-274.057,274.057-274.057C625.497,134.229,748.197,256.929,748.197,408.286z"/>
            </svg>
        )
    }

    renderLineIcon(){
        return (
            <svg version="1.1" id="Linie" xmlns="http://www.w3.org/2000/svg"
                // xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                // width="1190.549px" height="841.891px" 
                viewBox="0 0 1190.549 841.891" 
                // enable-background="new 0 0 1190.549 841.891"
                // xml:space="preserve"
                >
                <path fill="currentColor" d="M986.331,109.582c7.141-10.669,28.926-51.179-2.968-85.299S891.011,8.972,891.011,8.972L539.125,133.474
                    L63.239,302.022c-21.503,7.998-53.586,30.072-60.956,61.716s-2.116,58.538,22.414,96.79S211.33,752.213,228.564,777.28
                    c26.453,36.868,62.16,58.042,105.507,57.154s365.665-7.485,365.665-7.485l331.7-8.325l89.453-2.293c0,0,70.998-7.179,69.861-60.287
                    c-1.135-53.108-74.618-62.721-74.618-62.721s-733.215,15.553-749.148,15.576c-22.688,0.201-45.355-15.278-54.146-28.928
                    s-175.79-272.956-175.79-272.956l600.587-212.338c0,0-73.179,67.087-99.315,100.041s-30.56,74.565-5.053,95.237
                    c31.188,24.081,91.974-3.708,123.127-39.312C782.35,323.912,979.191,120.251,986.331,109.582z"/>
            </svg>
        )
    }

    renderBBoxIcon(){
        return (
            <svg version="1.1" id="Linie" xmlns="http://www.w3.org/2000/svg"
                // xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                // width="1190.549px" height="841.891px" 
                viewBox="0 0 1190.549 841.891" 
                // enable-background="new 0 0 1190.549 841.891"
                // xml:space="preserve"
                >
                <path fill="none" stroke="currentColor" stroke-width="120" stroke-miterlimit="10" d="M929.775,710.655
                    c0,23.386-19.134,42.52-42.52,42.52H278.991c-23.386,0-42.52-19.134-42.52-42.52V102.392c0-23.386,19.134-42.52,42.52-42.52
                    h608.264c23.386,0,42.52,19.134,42.52,42.52V710.655z"/>
            </svg>
        )
    }

    renderPolygonIcon(){
        return (
            <svg version="1.1" id="Linie" xmlns="http://www.w3.org/2000/svg"
                // xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                // width="1190.549px" height="841.891px" 
                viewBox="0 0 1190.549 841.891" 
                // enable-background="new 0 0 1190.549 841.891"
                // xml:space="preserve"
                >
                <path fill="none" stroke="currentColor" stroke-width="120" stroke-miterlimit="10" d="M342.327,769.938
                    c-23.379,0.548-52.922-15.056-65.65-34.674L65.479,409.738c-12.729-19.619-5.085-41.998,16.984-49.732L917.331,67.421
                    c22.07-7.734,26.86-0.275,10.645,16.576L691.761,329.475c-16.216,16.852-14.503,42.542,3.807,57.092l425.212,337.901
                    c18.31,14.549,14.16,26.901-9.219,27.449L342.327,769.938z"/>
            </svg>
        )
    }

    renderToolButtons(){
        if (!this.props.allowedActions.drawing) return null
        let btns = []
        if (this.props.allowedTools.point){
            btns.push(
                <Menu.Item name='dot circle' key={TOOLS.POINT}
                    active={false} 
                    onClick={e => this.onClick(e, TOOLS.POINT)}
                >
                    {/* <Icon name='dot circle' /> */}
                    {this.renderPointIcon()}
                </Menu.Item>
                // <Button key={TOOLS.POINT} outline onClick={e => this.onClick(e, TOOLS.POINT)} color="primary">
                //     <FontAwesomeIcon icon={faDotCircle} size='1x' />
                // </Button>
            )
        }
        if (this.props.allowedTools.line){
            btns.push(
                <Menu.Item name='paint brush' key={TOOLS.LINE}
                    active={false} 
                    onClick={e => this.onClick(e, TOOLS.LINE)}
                >
                    {/* <Icon name='paint brush' /> */}
                    {/* <FontAwesomeIcon icon={faWaveSquare} size="1x"/> */}
                    {this.renderLineIcon()}
                </Menu.Item>
                // <Button key={TOOLS.LINE} outline onClick={e => this.onClick(e, TOOLS.LINE)} color="secondary">
                //     <FontAwesomeIcon icon={faWaveSquare} size="1x"/>
                // </Button>
            )
        }
        if (this.props.allowedTools.bbox){
            btns.push(
                <Menu.Item name='square outline' key={TOOLS.BBOX}
                    active={false} 
                    onClick={e => this.onClick(e, TOOLS.BBOX)}
                >
                    {/* <Icon name='square outline' /> */}
                    {this.renderBBoxIcon()}
                </Menu.Item>
                // <Button key={TOOLS.BBOX} outline onClick={e => this.onClick(e, TOOLS.BBOX)} color="success">
                //     <FontAwesomeIcon icon={faVectorSquare} size="1x"/>
                // </Button>
            )
        }
        if (this.props.allowedTools.polygon){
            btns.push(
                <Menu.Item name='pencil alternate' key={TOOLS.POLYGON}
                    active={false} 
                    onClick={e => this.onClick(e, TOOLS.POLYGON)}
                >
                    {/* <Icon name='pencil alternate' /> */}
                    {/* <FontAwesomeIcon icon={faDrawPolygon} size="1x"/> */}
                    {this.renderPolygonIcon()}
                </Menu.Item>
                // <Button key={TOOLS.POLYGON} outline onClick={e => this.onClick(e, TOOLS.POLYGON)} color="info">
                //     <FontAwesomeIcon icon={faDrawPolygon} size="1x"/>
                // </Button>
            )
        }
        return btns
    }

    renderFinishPrompt(){
        return (
            <Dimmer page active={this.state.showFinishPrompt}>
                <Header as="h3" inverted>
                    <Icon name='paper plane outline'></Icon>
                    Do you wish to FINISH this SIA Task?
                </Header>
                <Button basic color="green" inverted
                    onClick={() => this.setFinished()}
                >
                    <Icon name='check'></Icon>
                    Yes
                </Button>
                <Button basic color="red" inverted
                    onClick={() => this.toggleFinishPrompt()}
                >
                    <Icon name='ban'></Icon> No
                </Button>
            </Dimmer>
        )
    }
    /**
     * Render next and prev image buttons 
     *
     */
    renderNavigation(){
        let btns = []
        if (this.props.currentImage){
            if (this.props.currentImage.isLast){
                btns.push(
                    <Menu.Item name='paper plane outline' key='finish'
                        active={false} 
                        onClick={() => this.toggleFinishPrompt()}
                    >
                        <Icon name='paper plane outline' />
                        {this.renderFinishPrompt()}
                    </Menu.Item>
                    // <Button key='finish' outline onClick={() => this.setFinished()} color="primary" >
                    //     <FontAwesomeIcon icon={faPaperPlane} />
                    // </Button>
                )
            } else {
                btns.push(
                    <Menu.Item name='arrow right'  key='next'
                        active={false} 
                        onClick={() => this.getNextImg()}
                    >
                        <Icon name='arrow right' />

                    </Menu.Item>
                    // <Button key='next' outline onClick={() => this.getNextImg()} color="primary">
                    //     <FontAwesomeIcon icon={faArrowRight} />
                    // </Button>
                )
            }
            btns.push(
                    <Menu.Item name='arrow left' key='prev'
                        active={false} 
                        onClick={() => this.getPrevImg()}
                    >
                        <Icon name='arrow left' />
                    </Menu.Item>
                // <Button key='prev' outline onClick={() => this.getPrevImg()} color="primary" disabled={!this.props.currentImage ? false : this.props.currentImage.isFirst}>
                //     <FontAwesomeIcon icon={faArrowLeft} />
                // </Button>
            )
        }
           
            
        return btns
    }


    render(){
        console.log('Toobar state', this.state, this.props.currentImage)
        return(
        // <Draggable handle=".handle">
        <div style={{position:'fixed', top: this.state.position.top, left:this.state.position.left}}>
                {/* <div className="handle" style={{cursor: 'grab'}}>Drag</div> */}
            <Menu icon inverted vertical>

                <Menu.Item name='image' 
                    active={this.props.imgBar.show} 
                    onClick={() => this.toggleImgBar()}
                >
                    <Icon name='image' />
                </Menu.Item>
                {this.renderToolButtons()}
                {this.renderNavigation()}
                <Menu.Item name='expand arrows alternate' 
                    active={this.props.fullscreenMode} 
                    onClick={() => this.toggleFullscreen()}
                >
                    <Icon name='expand arrows alternate' />
                </Menu.Item>
                <SIASettingButton></SIASettingButton>
               
               
            </Menu>
                {/* <Card><CardBody>
            <div style={{width:this.state.position.width}}>
                <Button outline onClick={() => this.toggleImgBar()} color="primary" active={this.props.imgBar.show}>
                    <FontAwesomeIcon icon={faImage} size='1x'/>
                </Button>
                {this.renderToolButtons()}
                {this.renderNavigation()}
                <Button outline onClick={() => this.toggleFullscreen()} color="secondary"
                    active={this.props.fullscreenMode}>
                    <FontAwesomeIcon icon={faExpandArrowsAlt} />
                </Button>
            </div>
            </CardBody></Card> */}
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
        layoutUpdate: state.sia.layoutUpdate,
        imgBar: state.sia.imgBar,
        allowedTools: state.sia.config.tools,
        allowedActions: state.sia.config.actions
    })
}
export default connect(mapStateToProps, 
    {siaSelectTool, siaGetNextImage, siaGetPrevImage, 
        siaSetFullscreen, 
        // siaSetImageLoaded, 
        selectAnnotation, siaShowImgBar, siaSetTaskFinished, siaLayoutUpdate}
)(ToolBar)