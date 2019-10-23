import React, {Component} from 'react'
import {connect} from 'react-redux'
import AnnoDetails from './AnnoDetails'
import LabelInfo from './LabelInfo'
import actions from '../../../actions'
const { siaShowImgBar, siaSetUIConfig } = actions

class InfoBoxes extends Component{

    constructor(props) {
        super(props)
        this.state = {
            position: {
                top: 0,
                left: 0,
            }
        }
    }

    componentDidMount(){
        
    }
    componentDidUpdate(prevProps){

        if (this.props.layoutUpdate !== prevProps.layoutUpdate){
            const container = this.props.container.current.getBoundingClientRect()
            console.log('ImgBar layout update container', container)
            this.setState({
                position: {...this.state.position,
                left: container.right - 250,
                top: container.top,
                }
            })
        }
    }

    onDismiss(type){
        switch (type){
            case 'AnnoDetails':
                console.log('InfoBoxArea Dismiss AnnoDetails')
                this.props.siaSetUIConfig(
                    {...this.props.uiConfig,
                        annoDetails: {
                            ...this.props.uiConfig.annoDetails,
                            visible: false
                        }
                    }
                )
                break
            case 'LabelInfo':
                this.props.siaSetUIConfig(
                    {...this.props.uiConfig,
                        labelInfo: {
                            ...this.props.uiConfig.labelInfo,
                            visible: false
                        }
                    }
                )
                break
            default:
                break
        }
    }

    render(){
        if (!this.props.annos.image) return null
        return(
        <div>
        <LabelInfo selectedLabelIds={this.props.selectedAnno.labelIds}
            possibleLabels={this.props.possibleLabels}
            defaultPos={this.state.position}
            onDismiss={() => this.onDismiss('LabelInfo')}
            visible={this.props.uiConfig.labelInfo.visible}
        />
        <AnnoDetails anno={this.props.selectedAnno} 
            svg={this.props.svg}
            defaultPos={{
                left: this.state.position.left - 255,
                top: this.state.position.top
            }}
            onDismiss={() => this.onDismiss('AnnoDetails')}
            visible={this.props.uiConfig.annoDetails.visible}
        />
        </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        annos: state.sia.annos,
        selectedAnno: state.sia.selectedAnno,
        layoutUpdate: state.sia.layoutUpdate,
        uiConfig: state.sia.uiConfig,
        imgBar: state.sia.imgBar,
        svg: state.sia.svg,
        possibleLabels: state.sia.possibleLabels
    })
}
export default connect(mapStateToProps, 
    {siaShowImgBar, siaSetUIConfig}
)(InfoBoxes)