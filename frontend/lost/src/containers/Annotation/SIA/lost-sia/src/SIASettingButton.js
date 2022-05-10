import React, {Component} from 'react'

import { Popup, Icon, Menu, Divider, Checkbox } from 'semantic-ui-react'
import * as tbe from './types/toolbarEvents'
class SIASettingButton extends Component{

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    triggerEvent(e, data){
        if (this.props.onSettingEvent){
            this.props.onSettingEvent(e, data)
        }
    }
    toggleAnnoDetails(){
        this.triggerEvent(tbe.SHOW_ANNO_DETAILS)
    }

    toggleLabelInfo(){
        this.triggerEvent(tbe.SHOW_LABEL_INFO)
    }

    toggleAnnoStats(){
        this.triggerEvent(tbe.SHOW_ANNO_STATS)
    }

    handleStrokeWidthChange(e){
        this.triggerEvent(tbe.EDIT_STROKE_WIDTH, parseInt(e.target.value))
    }

    handleNodeRadiusChange(e){
        this.triggerEvent(tbe.EDIT_NODE_RADIUS, parseInt(e.target.value))
    }

    renderInfoBoxContent(){
        return <div>
            <Divider horizontal>Info Boxes</Divider>
            <Checkbox 
                checked={this.props.uiConfig.annoDetails.visible} 
                label="Annotation Details" toggle
                onClick={() => this.toggleAnnoDetails()}
                />
            <Checkbox 
                checked={this.props.uiConfig.labelInfo.visible} 
                label="Label Info" toggle
                onClick={() => this.toggleLabelInfo()}
                />
            <Checkbox 
                checked={this.props.uiConfig.annoStats.visible} 
                label="Anno Stats" toggle
                onClick={() => this.toggleAnnoStats()}
                />
        </div>
    }
    renderInfoBoxes(){
        if (!this.props.enabled) return null
        if (this.props.enabled == true){
            return this.renderInfoBoxContent()
        } else {
            if (this.props.enabled.infoBoxes){
                return this.renderInfoBoxContent()
            }
        }
    }

    renderAnnoStyle(){
        if (!this.props.enabled) return null
        if (this.props.enabled == true){
            return this.renderAnnoStyleContent()
        } else {
            if (this.props.enabled.annoStyle){
                return this.renderAnnoStyleContent()
            }
        }
    }
    renderAnnoStyleContent(){
        return <div>
            <Divider horizontal>Anno Appearance</Divider>
            <div>Stroke width: {this.props.uiConfig.strokeWidth}</div>
            <input
                type='range'
                min={1}
                max={10}
                value={this.props.uiConfig.strokeWidth}
                onChange={e => this.handleStrokeWidthChange(e)}
                />
            <div>Node radius: {this.props.uiConfig.nodeRadius}</div>
            <input
                type='range'
                min={1}
                max={10}
                value={this.props.uiConfig.nodeRadius}
                onChange={e => this.handleNodeRadiusChange(e)}
                />
        </div>
    }

    render(){

        if (!this.props.uiConfig) return null
        const popupContent = <div >
            {this.renderInfoBoxes()}
            {this.renderAnnoStyle()}
        </div>
        return(
            <Popup trigger={ 
                <Menu.Item name='setting'>
                    <Icon name='setting' />
                </Menu.Item>
                }
                content={popupContent}
                position={"right center"}
                pinned
                on="click"
                style={{zIndex:7000}}
            />
        )
    }
}

export default SIASettingButton