import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import 'semantic-ui-css/semantic.min.css'
import { Button } from 'reactstrap'
import { createHashHistory } from 'history'
import Canvas from '../SIA/lost-sia/src/Canvas'
import '../SIA/lost-sia/src/SIA.scss';
import FilterBar from './FilterBar'

import {dummyAnnos, uiConfig, possibleLabels, imageBlob, canvasConfig} from './dummyData'
import ToolBar from './ToolBar'
import {NotificationManager, NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css';
import * as notificationType from '../SIA/lost-sia/src/types/notificationType'

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
            fullscreenCSS: '',
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
            image:{id:null, data:null},
            iteration: null
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
        // this.setState({isJunk: !this.state.isJunk})
        this.props.siaImgIsJunk(!this.props.isJunk)
    }
   
    componentDidMount() {
        window.addEventListener("resize", this.props.siaLayoutUpdate);
        // document.body.style.overflow = "hidden"

        //direction: 'next', 'previous', 'first'
        const data = {
            direction: 'first', 
            image_anno_id: null, 
            iteration: null, 
            pe_id: this.props.pipeElementId
        }
        this.props.getSiaReviewOptions(this.props.pipeElementId)
        this.props.getSiaReviewAnnos(data)
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.props.siaLayoutUpdate);
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
        if(this.state.fullscreenCSS!==prevState.fullscreenCSS){
            this.props.siaLayoutUpdate()
        }
        if (prevProps.annos !== this.props.annos){
            this.props.siaImgIsJunk(this.props.annos.image.isJunk)
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
                if (this.canvas.current){
                    this.canvas.current.resetZoom()
                }
            }
        )
    }

    handleNextPrevImage(imgId, direction){
        const data = {direction: direction, image_anno_id: imgId, iteration: this.state.iteration, pe_id: this.props.pipeElementId}
        this.props.getSiaReviewOptions(this.props.pipeElementId)
        this.props.getSiaReviewAnnos(data)
    }

    handleNotification(notification){
        const notifyTimeOut = 5000
            if (notification){
                switch(notification.type){
                    case notificationType.WARNING:
                        NotificationManager.warning(
                            notification.message,
                            notification.title,
                            notifyTimeOut
                        )
                        break
                    case notificationType.INFO:
                        NotificationManager.info(
                            notification.message,
                            notification.title,
                            notifyTimeOut
                        )
                        break
                    case notificationType.ERROR:
                        NotificationManager.error(
                            notification.message,
                            notification.title,
                            notifyTimeOut
                        )
                        break
                    case notificationType.SUCCESS:
                        NotificationManager.success(
                            notification.message,
                            notification.title,
                            notifyTimeOut
                        )
                        break
                    default:
                        break
                }
            }
    }

    toggleFullscreen() {
        console.log('Toggle Fullscreen')
        if (this.state.fullscreenCSS !== 'sia-fullscreen') {
            this.setState({ 
                fullscreenCSS: 'sia-fullscreen',
                layoutOffset: {
                    ...this.state.layoutOffset,
                    left: 50,
                    top: 5,
                } 
            })
        } else {
            if (this.state.fullscreenCSS !== '') {
                this.setState({
                    fullscreenCSS: '',
                    layoutOffset: {
                        ...this.state.layoutOffset,
                        left: 20,
                        top: 0,
                    } 
                })
            }
        }
    }

    handleCanvasKeyDown(e){
        console.log('Canvas keyDown: ', e.key)
        if (!this.props.annos) return
        switch(e.key){
            case 'ArrowLeft':
                if (!this.props.annos.image.isFirst){
                    this.handleNextPrevImage(this.props.annos.image.id, 'previous')
                } else {
                    this.handleNotification(
                        {
                            title: "No previous image",
                            message: 'This is the first image!',
                            type: notificationType.WARNING
                        })
                }
                break
            case 'ArrowRight':
                if (!this.props.annos.image.isLast){
                    this.handleNextPrevImage(this.props.annos.image.id, 'next')
                } else {
                    this.handleNotification(
                        {
                            title: "No next image",
                            message: 'This is the last image!',
                            type: notificationType.WARNING
                        }
                    )
                }
                break
            default:
                break
        }
    }

    handleIterationChange(iteration){
        this.setState({iteration: iteration})
        console.log('iteration', iteration)
        const data = {
            direction: 'first', 
            image_anno_id: null, 
            iteration: iteration, 
            pe_id: this.props.pipeElementId
        }
        this.props.getSiaReviewAnnos(data)

    }

    render() {
        if (!this.props.annos) return "No Review Data!"
        if (!this.props.filterOptions) return "No Review Data!"
        return (
            <div class={this.state.fullscreenCSS} ref={this.container}>
                <ToolBar 
                    svg={this.state.svg}
                    currentImage={this.props.annos.image}
                    onToolSelected={tool => this.handleToolSelected(tool)}
                    onToggleImgLabelInput={() => this.handleToggleImgLabelInput()}
                    onToggleJunk={() => this.handleToggleJunk()}
                    onNextImage={imgId => this.handleNextPrevImage(imgId, 'next')}
                    onPrevImage={imgId => this.handleNextPrevImage(imgId, 'previous')}
                    onToggleFullscreen={() => this.toggleFullscreen()}
                    onDeleteAllAnnos={() => this.canvas.current.deleteAllAnnos()}
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
                    canvasConfig={{
                        "tools": {
                            "point": true,
                            "line": true,
                            "polygon": true,
                            "bbox": true,
                            "junk": true
                        },
                        "annos": {
                            "minArea": 20,
                            "multilabels": true,
                            "actions": {
                                "draw": false,
                                "label": false,
                                "edit": false
                            }
                        },
                        "img": {
                            "multilabels": true,
                            "actions": {
                                "label": false
                            }
                        }
                    }}
                    possibleLabels={this.props.filterOptions.possible_labels}
                    onSVGUpdate={svg => this.handleSetSVG(svg)}
                    // onAnnoSelect={anno => this.props.selectAnnotation(anno)}
                    layoutOffset={this.state.layoutOffset}
                    isJunk={this.props.isJunk}
                    onImgLabelInputClose={() => this.handleToggleImgLabelInput()}
                    centerCanvasInContainer={false}
                    onNotification={(messageObj) => this.handleNotification(messageObj)}
                    onKeyDown={ e => this.handleCanvasKeyDown(e)}
                    // defaultLabel='no label'
                />
                <FilterBar
                    svg={this.state.svg}
                    visible
                    options={this.props.filterOptions}
                    onIterationChange={iter => this.handleIterationChange(iter)}
                />
                <NotificationContainer/>
             </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        // fullscreenMode: state.sia.fullscreenMode,
        // selectedAnno: state.sia.selectedAnno,
        // getNextImage: state.sia.getNextImage,
        // getPrevImage: state.sia.getPrevImage,
        uiConfig: state.sia.uiConfig,
        layoutUpdate: state.sia.layoutUpdate,
        // selectedTool: state.sia.selectedTool,
        // appliedFullscreen: state.sia.appliedFullscreen,
        // imageLoaded: state.sia.imageLoaded,
        // requestAnnoUpdate: state.sia.requestAnnoUpdate,
        // taskFinished: state.sia.taskFinished,
        // possibleLabels: state.sia.possibleLabels,
        // imgLabelInput: state.sia.imgLabelInput,
        // canvasConfig: state.sia.config,
        isJunk: state.sia.isJunk,
        // currentImage: state.sia.annos.image,
        pipeElementId: state.siaReview.elementId,
        annos: state.siaReview.annos,
        filterOptions: state.siaReview.options
    })
}

export default connect(
    mapStateToProps,
    {
        siaLayoutUpdate, 
        // getSiaAnnos,
        // getSiaConfig, getSiaLabels, siaSetSVG, 
        getSiaImage,
        // siaUpdateAnnos, siaSendFinishToBackend,
        // selectAnnotation,
        // getWorkingOnAnnoTask,
        // siaGetNextImage, siaGetPrevImage,
        getSiaReviewAnnos, getSiaReviewOptions,siaImgIsJunk
    }
    , null,
    {})(SIAReview)

