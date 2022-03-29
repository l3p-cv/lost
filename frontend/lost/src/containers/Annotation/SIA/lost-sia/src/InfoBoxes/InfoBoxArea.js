import React, {Component} from 'react'
// import {connect} from 'react-redux'
import AnnoDetails from './AnnoDetails'
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
        />
        <AnnoDetails anno={this.props.selectedAnno} 
            possibleLabels={this.props.possibleLabels}
            defaultPos={{
                left: this.state.position.left,
                top: this.state.position.top + 150
            }}
            onDismiss={() => this.onDismiss('AnnoDetails')}
            onCommentUpdate={(comment) => this.onCommentUpdate(comment)}
            commentInputTrigger={this.props.commentInputTrigger}
            visible={this.props.uiConfig.annoDetails.visible}
        />
        </div>
        )
    }
}

// function mapStateToProps(state) {
//     return ({
//         annos: state.sia.annos,
//         selectedAnno: state.sia.selectedAnno,
//         layoutUpdate: state.sia.layoutUpdate,
//         uiConfig: state.sia.uiConfig,
//         imgBar: state.sia.imgBar,
//         svg: state.sia.svg,
//         possibleLabels: state.sia.possibleLabels
//     })
// }
// export default connect(mapStateToProps, 
//     {siaShowImgBar, siaSetUIConfig}
// )(InfoBoxes)
export default InfoBoxes