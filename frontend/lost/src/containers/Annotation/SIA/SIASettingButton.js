import React, {Component} from 'react'

import {connect} from 'react-redux'
import { Popup, Icon, Menu, Divider, Checkbox } from 'semantic-ui-react'
import actions from '../../../actions'
const { siaSetUIConfig } = actions

class SIASettingButton extends Component{

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    toggleAnnoDetails(){
        this.props.siaSetUIConfig(
            {...this.props.uiConfig,
                annoDetails: {
                    ...this.props.uiConfig.annoDetails,
                    visible: !this.props.uiConfig.annoDetails.visible
                }
            }
        )
    }

    toggleLabelInfo(){
        this.props.siaSetUIConfig(
            {...this.props.uiConfig,
                labelInfo: {
                    ...this.props.uiConfig.labelInfo,
                    visible: !this.props.uiConfig.labelInfo.visible
                }
            }
        )
    }

    toggleAnnoStats(){
        this.props.siaSetUIConfig(
            {...this.props.uiConfig,
                annoStats: {
                    ...this.props.uiConfig.annoStats,
                    visible: !this.props.uiConfig.annoStats.visible
                }
            }
        )
    }

    handleStrokeWidthChange(e){
        this.props.siaSetUIConfig({
            ...this.props.uiConfig,
            strokeWidth: parseInt(e.target.value)
        })
    }

    handleNodeRadiusChange(e){
        this.props.siaSetUIConfig({
            ...this.props.uiConfig,
            nodeRadius: parseInt(e.target.value)
        })
    }

    render(){
        if (!this.props.annos.image) return null
        const popupContent = <div >
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
            />
        )
    }
}

function mapStateToProps(state) {
    return ({
        uiConfig: state.sia.uiConfig,
        annos: state.sia.annos
    })
}
export default connect(mapStateToProps, 
    {siaSetUIConfig}
)(SIASettingButton)