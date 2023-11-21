import React, { useState, useEffect, useRef } from 'react'
import { Icon, Menu, Button, Card } from 'semantic-ui-react'
import SIASettingButton from './SIASettingButton'
import SIAFilterButton from './SIAFilterButton'
import Prompt from './Prompt'

import * as TOOLS from './types/tools'
import * as siaIcons from './utils/siaIcons'
import * as tbe from './types/toolbarEvents'

const ToolBar = (props) => {
    const [position, setPosition] = useState({
        left: 0,
        top: 5,
        width: 40,
    })
    const [showFinishPrompt, setShowFinishPrompt] = useState(false)
    const [showHelp, setShowHelp] = useState(false)

    const toolBarGroup = useRef(null)

    const toolbarItemStyle = { background: '#1b1c1d' }

    // if (prevState.fullscreenMode !== this.state.fullscreenMode){
    //     this.props.siaSetFullscreen(this.state.fullscreenMode)
    // }

    useEffect(() => {
        calcPosition()
    }, [props.layoutUpdate, props.svg])

    const onClick = (e, tool) => {
        triggerToolBarEvent(tbe.TOOL_SELECTED, tool)
    }

    const calcPosition = () => {
        if (!props.enabled) return
        const tb = toolBarGroup.current.getBoundingClientRect()
        if (tb) {
            if (props.svg) {
                let toolBarTop = props.svg.top + props.svg.height / 6
                setPosition({
                    ...position,
                    left: props.svg.left - 55,
                    top: toolBarTop,
                })
            }
        }
    }

    const getNextImg = () => {
        // this.props.siaGetNextImage(this.props.imageMeta.id)
        triggerToolBarEvent(tbe.GET_NEXT_IMAGE)
    }

    const getPrevImg = () => {
        // this.props.siaGetPrevImage(this.props.imageMeta.id)
        triggerToolBarEvent(tbe.GET_PREV_IMAGE)
    }

    const setFinished = () => {
        // this.props.siaSetTaskFinished()
        triggerToolBarEvent(tbe.TASK_FINISHED)
    }

    const toggleFinishPrompt = () => {
        setShowFinishPrompt(!showFinishPrompt)
    }

    const toggleFullscreen = () => {
        // this.setState({
        //     fullscreenMode: !this.state.fullscreenMode
        // })
        triggerToolBarEvent(tbe.SET_FULLSCREEN)
    }

    const toggleImgLabelInput = () => {
        // this.props.siaShowImgLabelInput(!this.props.imgLabelInput.show)
        triggerToolBarEvent(tbe.SHOW_IMAGE_LABEL_INPUT)
    }

    const toggleJunk = () => {
        // this.props.siaImgIsJunk(!this.props.isJunk)
        triggerToolBarEvent(tbe.IMG_IS_JUNK)
    }

    const toggleHelp = () => {
        setShowHelp(!showHelp)
    }

    const handleOnDeleteAllAnnos = () => {
        triggerToolBarEvent(tbe.DELETE_ALL_ANNOS)
    }

    const handleSave = () => {
        triggerToolBarEvent(tbe.SAVE)
    }

    const triggerToolBarEvent = (event, data) => {
        if (props.onToolBarEvent) {
            props.onToolBarEvent(event, data)
        }
    }

    const renderToolButtons = () => {
        if (!props.canvasConfig) return null
        if (!props.enabled.toolSelection) return null
        if (!props.canvasConfig.annos.actions.draw) return null
        let btns = []
        if (props.canvasConfig.tools.point) {
            btns.push(
                <Menu.Item name='dot circle' key={TOOLS.POINT}
                    active={props.active.selectedTool === TOOLS.POINT}
                    onClick={(e) => onClick(e, TOOLS.POINT)}
                    style={toolbarItemStyle}
                >
                    {siaIcons.pointIcon()}
                </Menu.Item>
            )
        }
        if (props.canvasConfig.tools.line) {
            btns.push(
                <Menu.Item name='paint brush' key={TOOLS.LINE}
                    active={props.active.selectedTool === TOOLS.LINE}
                    onClick={(e) => onClick(e, TOOLS.LINE)}
                    style={toolbarItemStyle}
                >
                    {siaIcons.lineIcon()}
                </Menu.Item>
            )
        }
        if (props.canvasConfig.tools.bbox) {
            btns.push(
                <Menu.Item name='square outline' key={TOOLS.BBOX}
                    active={props.active.selectedTool === TOOLS.BBOX}
                    onClick={(e) => onClick(e, TOOLS.BBOX)}
                    style={toolbarItemStyle}
                >
                    {siaIcons.bBoxIcon()}
                </Menu.Item>
            )
        }
        if (props.canvasConfig.tools.polygon) {
            btns.push(
                <Menu.Item name='pencil alternate' key={TOOLS.POLYGON}
                    active={props.active.selectedTool === TOOLS.POLYGON}
                    onClick={(e) => onClick(e, TOOLS.POLYGON)}
                    style={toolbarItemStyle}
                >
                    {siaIcons.polygonIcon()}
                </Menu.Item>
            )
        }
        return btns
    }

    const renderFinishPrompt = () => {
        return (
            <Prompt active={showFinishPrompt}
                header={<div>
                    <Icon name='paper plane outline'></Icon>
                    Do you wish to FINISH this SIA Task?
                </div>}
                content={<div>
                    <Button basic color="green" inverted onClick={() => setFinished()}>
                        <Icon name='check'></Icon>
                        Yes
                    </Button>
                    <Button basic color="red" inverted onClick={() => toggleFinishPrompt()}>
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
    const renderNavigation = () => {
        let btns = []
        if (!props.enabled.nextPrev) return null
        if (props.imageMeta) {
            if (props.imageMeta.isLast) {
                btns.push(
                    <Menu.Item name='paper plane outline' key='finish'
                        active={false}
                        onClick={() => toggleFinishPrompt()}
                        style={toolbarItemStyle}
                    >
                        <Icon name='paper plane outline' />
                        {renderFinishPrompt()}
                    </Menu.Item>
                )
            } else {
                btns.push(
                    <Menu.Item name='arrow right' key='next'
                        active={false}
                        onClick={() => getNextImg()}
                        style={toolbarItemStyle}
                    >
                        <Icon name='arrow right' />
                    </Menu.Item>
                )
            }
            btns.push(
                <Menu.Item name='arrow left' key='prev'
                    active={false}
                    onClick={() => getPrevImg()}
                    disabled={props.imageMeta.isFirst}
                    style={toolbarItemStyle}
                >
                    <Icon name='arrow left' />
                </Menu.Item>
            )
        }
        return btns
    }

    const renderJunkButton = () => {
        if (!props.enabled.junk) return null
        return (
            <Menu.Item name='ban' key='junk'
                active={props.active.isJunk}
                onClick={() => toggleJunk()}
                style={toolbarItemStyle}
            >
                <Icon name='ban' />
            </Menu.Item>
        )
    }

    const renderDeleteAllAnnosButton = () => {
        if (!props.enabled.deleteAll) return null
        return (
            <Menu.Item name='trash alternate outline' key='deleteAllAnnos'
                onClick={() => handleOnDeleteAllAnnos()}
                style={toolbarItemStyle}
            >
                <Icon name='trash alternate outline' />
            </Menu.Item>
        )
    }

    const renderSaveButton = () => {
        if (!props.enabled.save) return null
        return (
            <Menu.Item name='save' key='save' onClick={() => handleSave()} style={toolbarItemStyle}>
                <Icon name='save' />
            </Menu.Item>
        )
    }

    const renderHelpButton = () => {
        if (!props.enabled.help) return null
        return (
            <Menu.Item name='help' key='help'
                active
                onClick={() => toggleHelp()}
                style={toolbarItemStyle}
            >
                <Icon name='help' />
                <Prompt
                    active={showHelp}
                    content={
                        <div>
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
                                    <Card.Content description='1.) Select an annotation with LEFT CLICK 2.) Hit ENTER 3.) Type into the input field 4.) Hit ENTER to confirm 5.) Hit ESCAPE to close the input field' />
                                </Card>
                                <Card>
                                    <Card.Content header='Undo/ Redo' />
                                    <Card.Content description='Undo: Hit STRG + Z' />
                                    <Card.Content description='Redo: Hit STRG + R' />
                                </Card>
                                <Card>
                                    <Card.Content header='Add a node to Line/Polygon' />
                                    <Card.Content description='Hit STRG + Click left on the line' />
                                </Card>
                                <Card>
                                    <Card.Content header='Remove a node from Line/Polygon in create mode' />
                                    <Card.Content description='Press DELETE or BACKSPACE' />
                                </Card>
                                <Card>
                                    <Card.Content header='Edit Line/Polygon' />
                                    <Card.Content description='1.) Click on the Annotation you want to edit.' />
                                    <Card.Content description='2.) Press "e". New nodes can now be added using right click' />
                                </Card>
                                <Card>
                                    <Card.Content header='Zoom/ Move Canvas' />
                                    <Card.Content description='Zoom: Use MOUSE WHEEL to zoom in/out' />
                                    <Card.Content description='Move: Hold MOUSE WHEEL and move mouse. Or Use W/A/S/D keys to move camera up/left/down/right' />
                                </Card>
                                <Card>
                                    <Card.Content header='TAB navigation' />
                                    <Card.Content description='You can traverse all visible annotation by hitting TAB.' />
                                </Card>
                                <Card>
                                    <Card.Content header='Next/Prev image navigation' />
                                    <Card.Content description='Get next image by hitting ARROW_RIGHT key. Get previous image by hitting ARROW_LEFT key.' />
                                </Card>
                                <Card>
                                    <Card.Content header='Copy and Paste annotations' />
                                    <Card.Content description='Copy: 1.) Select annotation 2.) Hit STRG + C' />
                                    <Card.Content description='Paste: STRG + V' />
                                </Card>
                                <Card>
                                    <Card.Content header='Mark image as junk' />
                                    <Card.Content description='1.) Press J key' />
                                </Card>
                                <Card>
                                    <Card.Content header='Assign a comment to a 2D annoation' />
                                    <Card.Content description='1.) Select annotation 2.) Hit C key' />
                                </Card>
                            </Card.Group>
                        </div>}
                />
            </Menu.Item>
        )
    }

    const renderImgLabelInput = () => {
        if (!props.enabled.imgLabel) return null
        if (props.canvasConfig.img.actions.label) {
            return <Menu.Item name='img label input'
                // active={this.props.imgLabelInput.show} 
                onClick={() => toggleImgLabelInput()}
                style={toolbarItemStyle}
            >
                {siaIcons.textIcon()}
            </Menu.Item>
        }
    }

    const renderFullscreenBtn = () => {
        if (!props.enabled.fullscreen) return null
        return (
            <Menu.Item name='expand arrows alternate'
                active={props.active.fullscreen}
                onClick={() => toggleFullscreen()}
                style={toolbarItemStyle}
            >
                <Icon name='expand arrows alternate' />
            </Menu.Item>
        )
    }

    const renderSettingBtn = () => {
        if (!props.enabled.settings) return null
        return <SIASettingButton
            enabled={props.enabled.settings}
            uiConfig={props.uiConfig}
            onSettingEvent={(e, data) => triggerToolBarEvent(e, data)}
            toolbarItemStyle={toolbarItemStyle}
        />
    }

    const renderFilterBtn = () => {
        if (!props.enabled.filter) return null
        if (!props.filter) return null
        return <SIAFilterButton
            enabled={props.enabled.filter}
            onFilterEvent={(e, data) => triggerToolBarEvent(e, data)}
            filter={props.filter}
            imageMeta={props.imageMeta}
            toolbarItemStyle={toolbarItemStyle}
        />
    }

    if (!props.enabled) return null

    return (
        <div
            ref={toolBarGroup}
            style={{ position: 'fixed', top: position.top, left: position.left }}>
            <Menu icon inverted vertical>
                {renderSettingBtn()}
                {renderFilterBtn()}
                {renderSaveButton()}
                {renderImgLabelInput()}
                {renderNavigation()}
                {renderToolButtons()}
                {renderJunkButton()}
                {renderDeleteAllAnnosButton()}
                {renderFullscreenBtn()}
                {renderHelpButton()}
            </Menu>
        </div>
    )
}

export default ToolBar
