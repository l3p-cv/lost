import React, {Component} from 'react'
import { Icon, Menu, Button, Card } from 'semantic-ui-react'
import SIASettingButton from './SIASettingButton'
import SIAFilterButton from './SIAFilterButton'
import Prompt from './Prompt'

import * as TOOLS from './types/tools'
import * as siaIcons from './utils/siaIcons'
import * as tbe from './types/toolbarEvents'

class ToolBar extends Component{

    constructor(props) {
        super(props)
        this.state = {
            // fullscreenMode: false,
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
        // if (prevState.fullscreenMode !== this.state.fullscreenMode){
        //     this.props.siaSetFullscreen(this.state.fullscreenMode)
        // }

        if (this.props.layoutUpdate !== prevProps.layoutUpdate){
            this.calcPosition()
        }
        if (this.props.svg !== prevProps.svg){
            this.calcPosition()
        }

    }

    onClick(e, tool){
        this.triggerToolBarEvent(tbe.TOOL_SELECTED, tool)
    }

    calcPosition(){
        if (!this.props.enabled) return
        const tb = this.toolBarGroup.current.getBoundingClientRect()
        if (tb){
            if (this.props.svg){
                let toolBarTop = undefined
                toolBarTop = this.props.svg.top + (this.props.svg.height)/6
                this.setState({
                    position: {...this.state.position,
                    left: this.props.svg.left - 55,
                    top: toolBarTop,
                    }
                })
            }
        }
    }
    getNextImg(){
        // this.props.siaGetNextImage(this.props.imageMeta.id)
        this.triggerToolBarEvent(tbe.GET_NEXT_IMAGE)
    }

    getPrevImg(){
        // this.props.siaGetPrevImage(this.props.imageMeta.id)
        this.triggerToolBarEvent(tbe.GET_PREV_IMAGE)
    }

    setFinished(){
        // this.props.siaSetTaskFinished()
        this.triggerToolBarEvent(tbe.TASK_FINISHED)
        
    }

    toggleFinishPrompt(){
        this.setState({
            showFinishPrompt: !this.state.showFinishPrompt
        })
    }

    toggleFullscreen(){
        // this.setState({
        //     fullscreenMode: !this.state.fullscreenMode
        // })
        this.triggerToolBarEvent(tbe.SET_FULLSCREEN)
    }

    toggleImgLabelInput(){
        // this.props.siaShowImgLabelInput(!this.props.imgLabelInput.show)
        this.triggerToolBarEvent(tbe.SHOW_IMAGE_LABEL_INPUT)
    }

    toggleJunk(){
        // this.props.siaImgIsJunk(!this.props.isJunk)
        this.triggerToolBarEvent(tbe.IMG_IS_JUNK)
    }

    toggleHelp(){
        this.setState({showHelp: !this.state.showHelp})
    }

    handleOnDeleteAllAnnos(){
        this.triggerToolBarEvent(tbe.DELETE_ALL_ANNOS)
    }

    handleSave(){
        this.triggerToolBarEvent(tbe.SAVE)
    }

    triggerToolBarEvent(event, data){
        if (this.props.onToolBarEvent){
            this.props.onToolBarEvent(event, data)
        }
    }

    renderToolButtons(){
        if (!this.props.canvasConfig) return null
        if (!this.props.enabled.toolSelection) return null
        if (!this.props.canvasConfig.annos.actions.draw) return null
        let btns = []
        if (this.props.canvasConfig.tools.point){
            btns.push(
                <Menu.Item name='dot circle' key={TOOLS.POINT}
                    active={this.props.active.selectedTool===TOOLS.POINT} 
                    onClick={e => this.onClick(e, TOOLS.POINT)}
                >
                    {siaIcons.pointIcon()}
                </Menu.Item>
            )
        }
        if (this.props.canvasConfig.tools.line){
            btns.push(
                <Menu.Item name='paint brush' key={TOOLS.LINE}
                    active={this.props.active.selectedTool===TOOLS.LINE} 
                    onClick={e => this.onClick(e, TOOLS.LINE)}
                >
                    {siaIcons.lineIcon()}
                </Menu.Item>
            )
        }
        if (this.props.canvasConfig.tools.bbox){
            btns.push(
                <Menu.Item name='square outline' key={TOOLS.BBOX}
                    active={this.props.active.selectedTool===TOOLS.BBOX} 
                    onClick={e => this.onClick(e, TOOLS.BBOX)}
                >
                    {siaIcons.bBoxIcon()}
                </Menu.Item>
            )
        }
        if (this.props.canvasConfig.tools.polygon){
            btns.push(
                <Menu.Item name='pencil alternate' key={TOOLS.POLYGON}
                    active={this.props.active.selectedTool===TOOLS.POLYGON} 
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
        if (!this.props.enabled.nextPrev) return null
        if (this.props.imageMeta){
            if (this.props.imageMeta.isLast){
                btns.push(
                    <Menu.Item name='paper plane outline' key='finish'
                        active={false} 
                        onClick={() => this.toggleFinishPrompt()}
                    >
                        <Icon name='paper plane outline' />
                        {this.renderFinishPrompt()}
                    </Menu.Item>
                )
            } else {
                btns.push(
                    <Menu.Item name='arrow right'  key='next'
                        active={false} 
                        onClick={() => this.getNextImg()}
                    >
                        <Icon name='arrow right' />
                    </Menu.Item>
                )
            }
            btns.push(
                    <Menu.Item name='arrow left' key='prev'
                        active={false} 
                        onClick={() => this.getPrevImg()}
                        disabled={this.props.imageMeta.isFirst}
                    >
                        <Icon name='arrow left' />
                    </Menu.Item>
            )
        }
        return btns
    }

    renderJunkButton(){
        if (!this.props.enabled.junk) return null
        return <Menu.Item name='ban' key='junk'
            active={this.props.active.isJunk} 
            onClick={() => this.toggleJunk()}
        >
            <Icon name='ban' />
        </Menu.Item>
    }

    renderDeleteAllAnnosButton(){
        if (!this.props.enabled.deleteAll) return null
        return <Menu.Item name='trash alternate outline' key='deleteAllAnnos'
            onClick={() => this.handleOnDeleteAllAnnos()}
        >
            <Icon name='trash alternate outline' />
        </Menu.Item>
    }

    renderSaveButton(){
        if (!this.props.enabled.save) return null
        return <Menu.Item name='save'  key='save'
                onClick={() => this.handleSave()}
            >
                {/* <Icon name='save'  color='red'/> */}
                <Icon name='save' />
        </Menu.Item>
    }

    renderHelpButton(){
        if (!this.props.enabled.help) return null
        return <Menu.Item name='help' key='help'
            active={false} 
            onClick={() => this.toggleHelp()}
        >
            <Icon name='help' />
            <Prompt active={this.state.showHelp}
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
                        <Card.Content header='Remove a node from Line/Polygon in create mode' />
                        <Card.Content description='Press DELETE or BACKSPACE'/>
                    </Card>
                    <Card>
                        <Card.Content header='Edit Line/Polygon' />
                        <Card.Content description='1.) Click on the Annotation you want to edit.'/>
                        <Card.Content description='2.) Press "e". New nodes can now be added using right click'/>
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
                    <Card>
                        <Card.Content header='Copy and Paste annotations' />
                        <Card.Content description='Copy: 1.) Select annotation 2.) Hit STRG + C'/>
                        <Card.Content description='Paste: STRG + V'/>
                    </Card>
                    <Card>
                        <Card.Content header='Mark image as junk' />
                        <Card.Content description='1.) Press J key'/>
                    </Card>
                    <Card>
                        <Card.Content header='Assign a comment to a 2D annoation' />
                        <Card.Content description='1.) Select annotation 2.) Hit C key'/>
                    </Card>
                    </Card.Group>
                </div>}
            />
        </Menu.Item>
    }

    
    renderImgLabelInput(){
        if (!this.props.enabled.imgLabel) return null
        if (this.props.canvasConfig.img.actions.label){
            return <Menu.Item name='img label input' 
                // active={this.props.imgLabelInput.show} 
                onClick={() => this.toggleImgLabelInput()}
            >
                {/* <Icon name='pencil' /> */}
                {siaIcons.textIcon()}
                
            </Menu.Item>
        }
    }

    renderFullscreenBtn(){
        if (!this.props.enabled.fullscreen) return null
        return <Menu.Item name='expand arrows alternate' 
                    active={this.props.active.fullscreen} 
                    onClick={() => this.toggleFullscreen()}
                >
                    <Icon name='expand arrows alternate' />
                </Menu.Item>
    }

    renderSettingBtn(){
        if (!this.props.enabled.settings) return null
        return <SIASettingButton 
                    enabled= {this.props.enabled.settings}
                    uiConfig={this.props.uiConfig}
                    onSettingEvent={(e,data) => this.triggerToolBarEvent(e, data)}/>
    }

    renderFilterBtn(){
        // console.log('filter', this.props.filter)
        if (!this.props.enabled.filter) return null
        if (!this.props.filter) return null
        return <SIAFilterButton 
                    enabled={this.props.enabled.filter}
                    onFilterEvent={(e, data) => this.triggerToolBarEvent(e, data)}
                    filter={this.props.filter}
                    imageMeta={this.props.imageMeta}
                />
    }

    render(){
        if (!this.props.enabled) return null
        return(
        <div
            ref={this.toolBarGroup}
            style={{position:'fixed', top: this.state.position.top, left:this.state.position.left}}>
            <Menu icon inverted vertical>
                {this.renderSettingBtn()}
                {this.renderFilterBtn()}
                {this.renderSaveButton()}
                {this.renderImgLabelInput()}
                {this.renderNavigation()}
                {this.renderToolButtons()}
                {this.renderJunkButton()}
                {this.renderDeleteAllAnnosButton()}
                {this.renderFullscreenBtn()}
                {this.renderHelpButton()}
            </Menu>
        </div>
        )
    }
}

export default ToolBar