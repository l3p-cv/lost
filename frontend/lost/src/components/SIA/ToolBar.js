import React, {Component} from 'react'
import { Icon, Menu, Popup, Checkbox, Divider} from 'semantic-ui-react'
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
        }
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
        this.props.siaSetImageLoaded(false)
        this.props.selectAnnotation(undefined)
        this.props.siaGetNextImage(this.props.currentImage.id)
    }

    getPrevImg(){
        this.props.siaSetImageLoaded(false)
        this.props.selectAnnotation(undefined)
        this.props.siaGetPrevImage(this.props.currentImage.id)
    }

    setFinished(){
        this.props.siaSetTaskFinished()
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

    renderToolButtons(){
        if (!this.props.allowedActions.drawing) return null
        let btns = []
        if (this.props.allowedTools.point){
            btns.push(
                <Menu.Item name='dot circle' key={TOOLS.POINT}
                    active={false} 
                    onClick={e => this.onClick(e, TOOLS.POINT)}
                >
                    <Icon name='dot circle' />
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
                    <FontAwesomeIcon icon={faWaveSquare} size="1x"/>
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
                    <Icon name='square outline' />
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
                    <FontAwesomeIcon icon={faDrawPolygon} size="1x"/>
                </Menu.Item>
                // <Button key={TOOLS.POLYGON} outline onClick={e => this.onClick(e, TOOLS.POLYGON)} color="info">
                //     <FontAwesomeIcon icon={faDrawPolygon} size="1x"/>
                // </Button>
            )
        }
        return btns
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
                        onClick={() => this.setFinished()}
                    >
                        <Icon name='paper plane outline' />
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
        siaSetFullscreen, siaSetImageLoaded, 
        selectAnnotation, siaShowImgBar, siaSetTaskFinished, siaLayoutUpdate}
)(ToolBar)