import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import 'semantic-ui-css/semantic.min.css'
import { Button } from 'reactstrap'
import { createHashHistory } from 'history'
import Canvas from '../SIA/lost-sia/src/Canvas'
import {dummyAnnos, uiConfig, possibleLabels, imageBlob, canvasConfig} from './dummyData'
import ToolBar from './ToolBar'



const { 
    siaLayoutUpdate, getSiaAnnos,
    getSiaLabels, getSiaConfig, siaSetSVG, getSiaImage, 
    siaUpdateAnnos, siaSendFinishToBackend,
    selectAnnotation, siaShowImgLabelInput, siaImgIsJunk, getWorkingOnAnnoTask,
    siaGetNextImage, siaGetPrevImage, getSiaReviewAnnos, getSiaReviewOptions
} = actions

class SIAReview extends Component {

    constructor(props) {
        super(props)
        this.state = {
            layoutOffset: {
                left: 20,
                top: 0,
                bottom: 5,
                right: 5
            },
            svg: undefined,
            tool: 'bBox',
            imgLabelInputVisible: false,
            isJunk: false,
            image:{id:null, data:null}
        }
        this.siteHistory = createHashHistory()
        this.container = React.createRef()
        this.canvas = React.createRef()

    }

    resetCanvas(){
        this.setState({
            imgLabelInputVisible: false
        })
    }
    handleSetSVG(svg){
        this.setState({svg: {...svg}})
    }
    handleToolSelected(tool){
        this.setState({tool: tool})
    }
    handleToggleImgLabelInput(){
        this.setState({imgLabelInputVisible: !this.state.imgLabelInputVisible})
    }
    handleToggleJunk(){
        this.setState({isJunk: !this.state.isJunk})
    }
   
    componentDidMount() {
        // const pipeElementId = 3
        //direction: 'next', 'previous', 'first'

        const test_data = {direction: 'first', image_anno_id: null, iteration: null, pe_id: this.props.pipeElementId}
        this.props.getSiaReviewOptions(this.props.pipeElementId)
        this.props.getSiaReviewAnnos(test_data)
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.annos){
            if (prevProps.annos){
                if(this.props.annos.image.id !== prevProps.annos.image.id){
                    this.requestImageFromBackend()
                }
            } else {
                this.requestImageFromBackend()
            }
        }
    }

    requestImageFromBackend(){
        this.props.getSiaImage(this.props.annos.image.url).then(response=>
            {
                this.setState({image: {
                    // ...this.state.image, 
                    id: this.props.annos.image.id, 
                    data:window.URL.createObjectURL(response)
                }})
            }
        )
    }

    render() {
        if (!this.props.annos) return "No Review Data!"
        return (
            <div className={this.state.fullscreenCSS} ref={this.container}>
                <ToolBar 
                    svg={this.state.svg}
                    onToolSelected={tool => this.handleToolSelected(tool)}
                    onToggleImgLabelInput={() => this.handleToggleImgLabelInput()}
                    onToggleJunk={() => this.handleToggleJunk()}
                />
                <Canvas
                    ref={this.canvas} 
                    imgBarVisible={true}
                    imgLabelInputVisible={this.state.imgLabelInputVisible}
                    container={this.container}
                    annos={this.props.annos}
                    image={this.state.image}
                    uiConfig={this.props.uiConfig}
                    layoutUpdate={this.props.layoutUpdate}
                    selectedTool={this.state.tool}
                    canvasConfig={canvasConfig}
                    possibleLabels={possibleLabels.labels}
                    onSVGUpdate={svg => this.handleSetSVG(svg)}
                    // onAnnoSelect={anno => this.props.selectAnnotation(anno)}
                    layoutOffset={this.state.layoutOffset}
                    isJunk={false}
                    onImgLabelInputClose={() => this.handleToggleImgLabelInput()}
                    centerCanvasInContainer={false}
                    // onNotification={(messageObj) => this.handleNotification(messageObj)}
                    // onKeyDown={ e => this.handleCanvasKeyDown(e)}
                    // defaultLabel='no label'
                />
             </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        fullscreenMode: state.sia.fullscreenMode,
        selectedAnno: state.sia.selectedAnno,
        getNextImage: state.sia.getNextImage,
        getPrevImage: state.sia.getPrevImage,
        uiConfig: state.sia.uiConfig,
        layoutUpdate: state.sia.layoutUpdate,
        selectedTool: state.sia.selectedTool,
        appliedFullscreen: state.sia.appliedFullscreen,
        imageLoaded: state.sia.imageLoaded,
        requestAnnoUpdate: state.sia.requestAnnoUpdate,
        taskFinished: state.sia.taskFinished,
        possibleLabels: state.sia.possibleLabels,
        imgLabelInput: state.sia.imgLabelInput,
        canvasConfig: state.sia.config,
        isJunk: state.sia.isJunk,
        currentImage: state.sia.annos.image,
        pipeElementId: state.siaReview.elementId,
        annos: state.siaReview.annos,
    })
}

export default connect(
    mapStateToProps,
    {
        siaLayoutUpdate, getSiaAnnos,
        getSiaConfig, getSiaLabels, siaSetSVG, getSiaImage,
        siaUpdateAnnos, siaSendFinishToBackend,
        selectAnnotation,
        getWorkingOnAnnoTask,
        siaGetNextImage, siaGetPrevImage,
        getSiaReviewAnnos, getSiaReviewOptions
    }
    , null,
    {})(SIAReview)

