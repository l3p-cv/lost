import React, {Component} from 'react'
// import {connect} from 'react-redux'
import AnnoDetails from './AnnoDetails'
import AnnoStats from './AnnoStats'
import LabelInfo from './LabelInfo'
// import actions from '../../../../actions'
// const { siaShowImgBar, siaSetUIConfig } = actions

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
        this.updateLayout()
        
    }

    componentDidUpdate(prevProps){

        if (this.props.layoutUpdate !== prevProps.layoutUpdate){
            this.updateLayout()
        }
        if (this.props.commentInputTrigger !== prevProps.commentInputTrigger){
            if (!this.props.uiConfig.annoDetails.visible){
                this.showAnnoDetails(true)
            }
        }
    }

    updateLayout(){
        if (this.props.container.current){
            const container = this.props.container.current.getBoundingClientRect()
            this.setState({
                position: {...this.state.position,
                left: container.right - 250,
                top: container.top,
                }
            })
        }
    }

    showAnnoDetails(show=true){
        this.props.onUiConfigUpdate(
            {...this.props.uiConfig,
                annoDetails: {
                    ...this.props.uiConfig.annoDetails,
                    visible: show
                }
            }
        )
    }

    onDismiss(type){
        if (this.props.onUiConfigUpdate){
            switch (type){
                case 'AnnoDetails':
                    this.showAnnoDetails(false)
                    break
                case 'LabelInfo':
                    this.props.onUiConfigUpdate(
                        {...this.props.uiConfig,
                            labelInfo: {
                                ...this.props.uiConfig.labelInfo,
                                visible: false
                            }
                        }
                    )
                    break
                case 'AnnoStats':
                    this.props.onUiConfigUpdate(
                        {...this.props.uiConfig,
                            annoStats: {
                                ...this.props.uiConfig.annoStats,
                                visible: false
                            }
                        }
                    )
                    break
                default:
                    break
            }
        }
    }

    onCommentUpdate(comment){
        if (this.props.onCommentUpdate){
            this.props.onCommentUpdate(comment)
        }
    }

    onMarkExample(anno){
        if (this.props.onMarkExample){
            this.props.onMarkExample(anno)
        }
    }

    onHideLbl(lbl, hide){
        if(this.props.onHideLbl){
            this.props.onHideLbl(lbl, hide)
        }
    }

    render(){
        if (!this.props.annos) return null
        // if (!this.props.selectedAnno) return null
        return(
        <div >
        <LabelInfo selectedAnno={this.props.selectedAnno}
            possibleLabels={this.props.possibleLabels}
            defaultPos={this.state.position}
            onDismiss={() => this.onDismiss('LabelInfo')}
            visible={this.props.uiConfig.labelInfo.visible}
            onGetAnnoExample={(exampleArgs) => this.props.onGetAnnoExample ? this.props.onGetAnnoExample(exampleArgs):{} }
            exampleImg={this.props.exampleImg}
        />
        <AnnoDetails anno={this.props.selectedAnno} 
            possibleLabels={this.props.possibleLabels}
            defaultPos={{
                left: this.state.position.left - 300,
                top: this.state.position.top
            }}
            onDismiss={() => this.onDismiss('AnnoDetails')}
            onCommentUpdate={(comment) => this.onCommentUpdate(comment)}
            onMarkExample={(anno) => this.onMarkExample(anno)}
            allowedToMarkExample={this.props.allowedToMarkExample}
            commentInputTrigger={this.props.commentInputTrigger}
            visible={this.props.uiConfig.annoDetails.visible}
        />
        <AnnoStats selectedAnno={this.props.selectedAnno}
            annos={this.props.annos}
            possibleLabels={this.props.possibleLabels}
            defaultPos={{
                left: this.state.position.left,
                top: this.state.position.top + 400
            }}
            // defaultPos={this.state.position}
            onDismiss={() => this.onDismiss('AnnoStats')}
            onHideLbl={(lbl, hide) => this.onHideLbl(lbl, hide)}
            visible={this.props.uiConfig.annoStats.visible}
            imgLoadCount={this.props.imgLoadCount}
        />
        </div>
        )
    }
}

export default InfoBoxes