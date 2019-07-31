import React, {Component} from 'react'

import {connect} from 'react-redux'
import { Popup, Icon, Menu, Divider, Checkbox, Card } from 'semantic-ui-react'
import actions from '../../actions'
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

    render(){
        if (!this.props.annos.image) return null
        const popupContent = <div >
            <Divider horizontal>Info Boxes</Divider>
            <Checkbox 
                checked={this.props.uiConfig.annoDetails.visible} 
                label="Annotation Details" toggle
                onClick={() => this.toggleAnnoDetails()}
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