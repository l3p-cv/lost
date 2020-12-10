import React, {Component} from 'react'

import {connect} from 'react-redux'
import { Popup, Icon, Menu, Divider, Checkbox } from 'semantic-ui-react'
import actions from '../../actions'
const { siaApplyFilter } = actions

class SIAFilterButton extends Component{

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

    rotateImg(angle){
        if (this.props.filter){
            console.log('Angle', angle == this.props.filter.angle ? 0 : angle)
            this.props.siaApplyFilter({
                ...this.props.filter,
                rotate: angle == this.props.filter.rotate ? 0 : angle
            })
        } else {
            this.props.siaApplyFilter({rotate:angle})
        }
        
    }

    claheFilter(clipLimit){
        const filter = {'clahe' : {'clipLimit':clipLimit}}
        if (this.props.filter){
            this.props.siaApplyFilter({
                ...this.props.filter,
                ...filter
            })
        } else {
            this.props.siaApplyFilter(filter)
        }
        
    }

    render(){
        const filter = this.props.filter
        if (!this.props.annos.image) return null
        const popupContent = <div >
            <Divider horizontal>Rotate</Divider>
            <Checkbox 
                checked={filter ? filter.rotate === 90: false} 
                label="Rotate 90" toggle
                onClick={() => this.rotateImg(90)}
                />
            <Checkbox 
                checked={filter ? filter.rotate === -90: false} 
                label="Rotate -90" toggle
                onClick={() => this.rotateImg(-90)}
                />
            <Checkbox 
                checked={filter ? filter.rotate === 180: false} 
                label="Rotate 180" toggle
                onClick={() => this.rotateImg(180)}
                />
            <Divider horizontal>Appearance Filter</Divider>
            <Checkbox 
                checked={filter ? filter.clahe !== undefined: false} 
                label="Histogram equalization" toggle
                onClick={() => this.claheFilter(3)}
                />
            <div>Stroke width: {this.props.uiConfig.strokeWidth}</div>
            <input
                type='range'
                min={0}
                max={40}
                value={this.props.uiConfig.strokeWidth}
                onChange={e => this.handleStrokeWidthChange(e)}
                />
        </div>
        return(
            <Popup trigger={ 
                <Menu.Item name='filter'>
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
        annos: state.sia.annos,
        filter: state.sia.filter
    })
}
export default connect(mapStateToProps, 
    {siaApplyFilter}
)(SIAFilterButton)