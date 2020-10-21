import React, {Component} from 'react'

import {connect} from 'react-redux'
import { Popup, Icon, Menu, Divider, Checkbox } from 'semantic-ui-react'
import actions from '../../actions'
const { siaSetUIConfig } = actions

class ImageFilter extends Component{

    constructor(props) {
        super(props)
    }

    toggleEqualizeHist(){
        this.props.siaSetUIConfig(
            {...this.props.uiConfig,
                imageFilter: {
                    equalizeHist: !this.props.uiConfig.imageFilter.equalizeHist,
                    isRemember: this.props.uiConfig.imageFilter.isRemember
                }
            }
        )
    }

    toggleRememberImageFilter(){
        this.props.siaSetUIConfig(
            {...this.props.uiConfig,
                imageFilter: {
                    equalizeHist:this.props.uiConfig.imageFilter.equalizeHist,
                    isRemember: !this.props.uiConfig.imageFilter.isRemember
                }
            }
        )
    }

    render(){
        if (!this.props.annos.image) return null
        const popupContent = <div >
            <Checkbox 
                checked={this.props.uiConfig.imageFilter.isRemember} 
                label="Remember Filter" toggle
                onClick={() => this.toggleRememberImageFilter()}
                />
            <Divider horizontal>Filter</Divider>
            <Checkbox 
                checked={this.props.uiConfig.imageFilter.equalizeHist} 
                label="Equalize Histogram" toggle
                onClick={() => this.toggleEqualizeHist()}
                />

        </div>
        return(
            <Popup trigger={ 
                <Menu.Item name='setting'>
                    <Icon name='filter' />
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
)(ImageFilter)