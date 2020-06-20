import React, {Component} from 'react'
import { Icon, Menu, Button, Card } from 'semantic-ui-react'
import {connect} from 'react-redux'
import SIASettingButton from '../SIA/SIASettingButton'
import Prompt from '../SIA/lost-sia/src/Prompt'

import actions from '../../actions'
import * as TOOLS from '../SIA/lost-sia/src/types/tools'
import * as siaIcons from '../SIA/lost-sia/src/utils/siaIcons'

const { 
    siaGetNextImage, siaGetPrevImage, 
    siaSetFullscreen, selectAnnotation, siaShowImgLabelInput, 
    siaSetTaskFinished, siaLayoutUpdate, siaImgIsJunk
} = actions

class ToolBar extends Component{

    constructor(props) {
        super(props)
        this.state = {
            fullscreenMode: false,
            position: {
                left: 0,
                top: 5,
                width: 40
            },
            showFinishPrompt: false,
            showHelp: false
        }
        this.toolBarGroup = React.createRef()
    }

    componentDidMount(){
        
    }
    componentDidUpdate(prevProps, prevState){
        if (prevState.fullscreenMode !== this.state.fullscreenMode){
            this.props.siaSetFullscreen(this.state.fullscreenMode)
        }

        if (this.props.layoutUpdate !== prevProps.layoutUpdate){
            this.calcPosition()
        }
        if (this.props.svg !== prevProps.svg){
            this.calcPosition()
        }

    }

    onClick(e, tool){
        // this.props.siaSelectTool(tool)
        if (this.props.onToolSelected){
            this.props.onToolSelected(tool)
        }
    }

    calcPosition(){
        const tb = this.toolBarGroup.current.getBoundingClientRect()
        if (tb){
            if (this.props.svg){
                let toolBarTop = undefined
                toolBarTop = this.props.svg.top //+ (this.props.svg.height - tb.height)/2
                this.setState({
                    position: {...this.state.position,
                    left: this.props.svg.left - 50,
                    top: toolBarTop,
                    }
                })
            }
        }
    }
    getNextImg(){
        // this.props.siaSetImageLoaded(false)
        // this.props.selectAnnotation(undefined)
        // this.props.siaGetNextImage(this.props.currentImage.id)
        if (this.props.onNextImage){
            this.props.onNextImage(this.props.currentImage.id)
        }
    }

    getPrevImg(){
        // this.props.siaSetImageLoaded(false)
        // this.props.selectAnnotation(undefined)
        // this.props.siaGetPrevImage(this.props.currentImage.id)
        if (this.props.onPrevImage){
            this.props.onPrevImage(this.props.currentImage.id)
        }
    }

    setFinished(){
        this.props.siaSetTaskFinished()
        
    }

    toggleFinishPrompt(){
        this.setState({
            showFinishPrompt: !this.state.showFinishPrompt
        })
    }

    toggleFullscreen(){
        // this.props.selectAnnotation(undefined)
        // this.setState({
        //     fullscreenMode: !this.state.fullscreenMode
        // })
        // this.props.siaSetFullscreen(!this.props.fullscreenMode)
        if (this.props.onToggleFullscreen){
            this.props.onToggleFullscreen()
        }
    }

    toggleImgLabelInput(){
        // this.props.siaShowImgLabelInput(!this.props.imgLabelInput.show)
        if (this.props.onToggleImgLabelInput){
            this.props.onToggleImgLabelInput()
        }
    }

    toggleJunk(){
        if (this.props.onToggleJunk){
            this.props.onToggleJunk()
        }
    }

    toggleHelp(){
        this.setState({showHelp: !this.state.showHelp})
    }

    handleOnDeleteAllAnnos(){
        if(this.props.onDeleteAllAnnos){
            this.props.onDeleteAllAnnos()
        }
    }

    renderToolButtons(){
        if (!this.props.allowedActions.draw) return null
        let btns = []
        if (this.props.allowedTools.point){
            btns.push(
                <Menu.Item name='dot circle' key={TOOLS.POINT}
                    active={this.props.selectedTool===TOOLS.POINT} 
                    onClick={e => this.onClick(e, TOOLS.POINT)}
                >
                    {siaIcons.pointIcon()}
                </Menu.Item>
            )
        }
        if (this.props.allowedTools.line){
            btns.push(
                <Menu.Item name='paint brush' key={TOOLS.LINE}
                    active={this.props.selectedTool===TOOLS.LINE} 
                    onClick={e => this.onClick(e, TOOLS.LINE)}
                >
                    {siaIcons.lineIcon()}
                </Menu.Item>
            )
        }
        if (this.props.allowedTools.bbox){
            btns.push(
                <Menu.Item name='square outline' key={TOOLS.BBOX}
                    active={this.props.selectedTool===TOOLS.BBOX} 
                    onClick={e => this.onClick(e, TOOLS.BBOX)}
                >
                    {siaIcons.bBoxIcon()}
                </Menu.Item>
            )
        }
        if (this.props.allowedTools.polygon){
            btns.push(
                <Menu.Item name='pencil alternate' key={TOOLS.POLYGON}
                    active={this.props.selectedTool===TOOLS.POLYGON} 
                    onClick={e => this.onClick(e, TOOLS.POLYGON)}
                >
                    {siaIcons.polygonIcon()}
                </Menu.Item>
            )
        }
        return btns
    }

    renderFinishPrompt(){
        return (
            <Prompt active={this.state.showFinishPrompt}
                header={<div>
                    <Icon name='paper plane outline'></Icon>
                    Do you wish to FINISH this SIA Task?
                </div>}
                content={<div>
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
                </div>}
            />
        )
    }
    /**
     * Render next and prev image buttons 
     *
     */
    renderNavigation(){
        let btns = []
        if (this.props.currentImage){
            // if (this.props.currentImage.isLast){
            //     // btns.push(
            //     //     <Menu.Item name='paper plane outline' key='finish'
            //     //         active={false} 
            //     //         onClick={() => this.toggleFinishPrompt()}
            //     //     >
            //     //         <Icon name='paper plane outline' />
            //     //         {this.renderFinishPrompt()}
            //     //     </Menu.Item>
            //     // )
            // } else {
                btns.push(
                    <Menu.Item name='arrow right'  key='next'
                        active={false} 
                        onClick={() => this.getNextImg()}
                        disabled={this.props.currentImage.isLast}
                    >
                        <Icon name='arrow right' />

                    </Menu.Item>
                    // <Button key='next' outline onClick={() => this.getNextImg()} color="primary">
                    //     <FontAwesomeIcon icon={faArrowRight} />
                    // </Button>
                )
            // }
            btns.push(
                    <Menu.Item name='arrow left' key='prev'
                        active={false} 
                        onClick={() => this.getPrevImg()}
                        disabled={this.props.currentImage.isFirst}
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

    renderJunkButton(){
        return <Menu.Item name='ban' key='junk'
            active={this.props.isJunk} 
            onClick={() => this.toggleJunk()}
        >
            <Icon name='ban' />
        </Menu.Item>
    }

    renderDeleteAllAnnosButton(){
        return <Menu.Item name='trash alternate outline' key='deleteAllAnnos'
            onClick={() => this.handleOnDeleteAllAnnos()}
        >
            <Icon name='trash alternate outline' />
        </Menu.Item>
    }

    renderHelpButton(){
        return <Menu.Item name='help' key='help'
            active={false} 
            onClick={() => this.toggleHelp()}
        >
            <Icon name='help' />
            <Prompt active={this.state.showHelp}
                // header={<div><Icon name='help' /> Help</div>}
                content={<div>
                    <Card.Group>
                    <Card>
                        <Card.Content header='How to draw?' />
                        <Card.Content description='1.) Select a Tool in the toolbar 2.) Draw with RIGHT CLICK on Canvas' />
                    </Card>
                    <Card>
                        <Card.Content header='How to delete an annotation?' />
                        <Card.Content description='1.) Select an annotation with LEFT CLICK 2.) Press DELETE or BACKSPACE' />
                    </Card>
                    <Card>
                        <Card.Content header='How to assign a label?' />
                        <Card.Content description='1.) Select an annotation with LEFT CLICK 2.) Hit ENTER 3.) Type into the input field 4.) Hit ENTER to confirm 5.) Hit ESCAPE to close the input field'/>
                    </Card>
                    <Card>
                        <Card.Content header='Undo/ Redo' />
                        <Card.Content description='Undo: Hit STRG + Z'/>
                        <Card.Content description='Redo: Hit STRG + R'/>
                    </Card>
                    <Card>
                        <Card.Content header='Add a node to Line/Polygon' />
                        <Card.Content description='Hit STRG + Click left on the line'/>
                    </Card>
                    <Card>
                        <Card.Content header='Zoom/ Move Canvas' />
                        <Card.Content description='Zoom: Use MOUSE WHEEL to zoom in/out'/>
                        <Card.Content description='Move: Hold MOUSE WHEEL and move mouse. Or Use W/A/S/D keys to move camera up/left/down/right'/>
                    </Card>
                    <Card>
                        <Card.Content header='TAB navigation' />
                        <Card.Content description='You can traverse all visible annotation by hitting TAB.'/>
                    </Card>
                    <Card>
                        <Card.Content header='Next/Prev image navigation' />
                        <Card.Content description='Get next image by hitting ARROW_RIGHT key. Get previous image by hitting ARROW_LEFT key.'/>
                    </Card>
                    </Card.Group>
                </div>}
            />
        </Menu.Item>
    }

    
    renderImgLabelInput(){
        if (this.props.canvasConfig.img.actions.label){
            return <Menu.Item name='img label input' 
                active={this.props.imgLabelInput.show} 
                onClick={() => this.toggleImgLabelInput()}
            >
                {/* <Icon name='pencil' /> */}
                {siaIcons.textIcon()}
                
            </Menu.Item>
        }
    }

    render(){
        return(
        <div
            ref={this.toolBarGroup}
            style={{position:'fixed', top: this.state.position.top, left:this.state.position.left}}>
            <Menu icon inverted vertical>
                {this.renderImgLabelInput()}
                {this.renderNavigation()}
                {this.renderToolButtons()}
                <Menu.Item name='expand arrows alternate' 
                    active={this.props.fullscreenMode} 
                    onClick={() => this.toggleFullscreen()}
                >
                    <Icon name='expand arrows alternate' />
                </Menu.Item>
                {this.renderJunkButton()}
                {this.renderDeleteAllAnnosButton()}
                <SIASettingButton></SIASettingButton>
                {this.renderHelpButton()}
            </Menu>
        </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        // currentImage: state.sia.annos.image,
        fullscreenMode: state.sia.fullscreenMode,
        annos: state.sia.annos,
        appliedFullscreen: state.sia.appliedFullscreen,
        layoutUpdate: state.sia.layoutUpdate,
        imgLabelInput: state.sia.imgLabelInput,
        allowedTools: state.sia.config.tools,
        allowedActions: state.sia.config.annos.actions,
        selectedTool: state.sia.selectedTool,
        isJunk: state.sia.isJunk,
        canvasConfig: state.sia.config,
    })
}
export default connect(mapStateToProps, 
    {siaGetNextImage, siaGetPrevImage, 
        siaSetFullscreen, 
        // siaSetImageLoaded, 
        selectAnnotation, siaShowImgLabelInput, siaSetTaskFinished, siaLayoutUpdate,
        siaImgIsJunk
    }
)(ToolBar)