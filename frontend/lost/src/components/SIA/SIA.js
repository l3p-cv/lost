import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import 'semantic-ui-css/semantic.min.css'

// import from npm package
//import Canvas from 'lost-sia'
//import 'lost-sia/dist/index.css'

// import from source code
import Canvas from './lost-sia/src/Canvas'

import './sia-container.scss';

import ToolBar from './ToolBar'
import {NotificationManager, NotificationContainer } from 'react-notifications'
import { createHashHistory } from 'history'
import InfoBoxArea from './InfoBoxes/InfoBoxArea'
import 'react-notifications/lib/notifications.css';

import * as notificationType from './lost-sia/src/types/notificationType'
import { toSia } from './lost-sia/src/utils/transform'

const { 
    siaLayoutUpdate, getSiaAnnos,
    getSiaLabels, getSiaConfig, siaSetSVG, getSiaImage, 
    siaUpdateAnnos, siaSendFinishToBackend,
    selectAnnotation, siaShowImgLabelInput, siaImgIsJunk, getWorkingOnAnnoTask,
    siaGetNextImage, siaGetPrevImage, siaFilterImage
} = actions

class SIA extends Component {

    constructor(props) {
        super(props)
        this.state = {
            fullscreenCSS: '',
            didMount: false,
            image: {
                id: undefined,
                data: undefined,
            },
            layoutOffset: {
                left: 20,
                top: 0,
                bottom: 5,
                right: 5
            },
            notification: undefined,
            filteredData: undefined
        }
        this.siteHistory = createHashHistory()
        
        this.container = React.createRef()
        this.canvas = React.createRef()
    }

    componentDidMount() {
        document.body.style.overflow = "hidden"
        this.setState({didMount:true})
        window.addEventListener("resize", this.props.siaLayoutUpdate);
        this.props.getSiaAnnos(-1)
        this.props.getSiaLabels()
        this.props.getSiaConfig()
        // console.warn('We are not using real SIA config')
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.props.siaLayoutUpdate);
    }

    componentDidUpdate(prevProps, prevState) {
        this.setFullscreen(this.props.fullscreenMode)
        if (prevState.fullscreenCSS !== this.state.fullscreenCSS){
            // this.props.siaAppliedFullscreen(this.props.fullscreenMode)
            this.props.siaLayoutUpdate()
        }
        if (prevState.notification !== this.state.notification){
            const notifyTimeOut = 5000
            if (this.state.notification){
                switch(this.state.notification.type){
                    case notificationType.WARNING:
                        NotificationManager.warning(
                            this.state.notification.message,
                            this.state.notification.title,
                            notifyTimeOut
                        )
                        break
                    case notificationType.INFO:
                        NotificationManager.info(
                            this.state.notification.message,
                            this.state.notification.title,
                            notifyTimeOut
                        )
                        break
                    case notificationType.ERROR:
                        NotificationManager.error(
                            this.state.notification.message,
                            this.state.notification.title,
                            notifyTimeOut
                        )
                        break
                    case notificationType.SUCCESS:
                        NotificationManager.success(
                            this.state.notification.message,
                            this.state.notification.title,
                            notifyTimeOut
                        )
                        break
                    default:
                        break
                }
            }
        }
        if (prevProps.getNextImage !== this.props.getNextImage){
            if (this.props.getNextImage){
                this.getNewImage(this.props.getNextImage, 'next')
            }
        }
        if (prevProps.getPrevImage !== this.props.getPrevImage){
            if (this.props.getPrevImage){
                this.getNewImage(this.props.getPrevImage, 'prev')
            }
        }
        if (prevProps.annos !== this.props.annos){
            this.props.siaImgIsJunk(this.props.annos.image.isJunk)
        }
        if (prevProps.taskFinished !== this.props.taskFinished){
            const newAnnos = this.canvas.current.getAnnos()
            this.props.siaUpdateAnnos(newAnnos).then(()=>{
                this.props.siaSendFinishToBackend().then(()=>{
                    this.siteHistory.push('/dashboard')

                })
            })
        }
        if(this.props.annos.image){
            if (prevProps.annos.image){
                if(this.props.annos.image.id !== prevProps.annos.image.id){
                    this.requestImageFromBackend()
                }
            } else {
                this.requestImageFromBackend()
            }
        }
        if(prevState.filteredData != this.state.filteredData){
            console.log('Filtered Data changed')
            this.setState({image:{
                ...this.state.image,
                data: this.state.filteredData
            }})
        }
    }

    getNewImage(imageId, direction){
        this.canvas.current.resetZoom()
        const newAnnos = this.canvas.current.getAnnos()
        this.canvas.current.unloadImage()
        this.setState({image: {
            id: undefined, 
            data:undefined
        }})
        this.props.siaImgIsJunk(false)
        this.props.siaUpdateAnnos(newAnnos).then(() => {
            this.props.getSiaAnnos(imageId, direction)
        })
    }
    // handleImgBarClose(){
    //     this.props.siaShowImgBar(false)
    // }

    handleImgLabelInputClose(){
        this.props.siaShowImgLabelInput(!this.props.imgLabelInput.show)
    }

    handleNotification(messageObj){
        this.setState({
            notification: messageObj
        })
    }

    handleCanvasKeyDown(e){
        console.log('Canvas keyDown: ', e.key)
        switch(e.key){
            case 'ArrowLeft':
                if (!this.props.currentImage.isFirst){
                    this.props.siaGetPrevImage(this.props.currentImage.id)
                } else {
                    this.setState({notification:
                        {
                            title: "No previous image",
                            message: 'This is the first image!',
                            type: notificationType.WARNING
                        }
                    })
                }
                break
            case 'ArrowRight':
                if (!this.props.currentImage.isLast){
                    this.props.siaGetNextImage(this.props.currentImage.id)
                } else {
                    this.setState({notification:
                        {
                            title: "No next image",
                            message: 'This is the last image!',
                            type: notificationType.WARNING
                        }
                    })
                }
                break
            default:
                break
        }
    }


    filterImage(angle){
        this.props.siaFilterImage({
            'imageId': this.props.annos.image.id,
            'clahe' : {'clipLimit':2.0},
            'rotate':{'angle':angle}
        }).then(response => {
            console.log('filterImage response', response)
            // var blob = new Blob([response.request.response], { type: response.headers['content-type'] });
            // var url = URL.createObjectURL(blob);
            // console.log('filterImage createObjectURL',url)

            // var blob = Buffer.from(response.data, 'binary').toString('base64')
            // var url = blob
            // console.log('filterImage createObjectURL',url)

            // var b64Response = btoa(response.data);
            // var url = 'data:image/png;base64,'+b64Response;

            this.setState({filteredData: response.data})
        //     var img = new Image();
        //     img.src = url;
        //     document.body.appendChild(img);
        })
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
        this.props.getWorkingOnAnnoTask()       
    }

    setFullscreen(fullscreen = true) {
        if (fullscreen) {
            if (this.state.fullscreenCSS !== 'sia-fullscreen') {
                this.setState({ 
                    fullscreenCSS: 'sia-fullscreen',
                    layoutOffset: {
                        ...this.state.layoutOffset,
                        left: 50,
                        top: 5,
                    } 
                })
            }
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

    render() {
        return (
            <div className={this.state.fullscreenCSS} ref={this.container}>
                <img 
                    src={this.state.filteredData}
                    width="100%" height="100%"
                />
                <Canvas
                    ref={this.canvas} 
                    imgBarVisible={true}
                    imgLabelInputVisible={this.props.imgLabelInput.show}
                    container={this.container}
                    annos={this.props.annos}
                    image={this.state.image}
                    uiConfig={this.props.uiConfig}
                    layoutUpdate={this.props.layoutUpdate}
                    selectedTool={this.props.selectedTool}
                    canvasConfig={this.props.canvasConfig}
                    possibleLabels={this.props.possibleLabels}
                    onSVGUpdate={svg => this.props.siaSetSVG(svg)}
                    onAnnoSelect={anno => this.props.selectAnnotation(anno)}
                    layoutOffset={this.state.layoutOffset}
                    isJunk={this.props.isJunk}
                    onImgLabelInputClose={() => this.handleImgLabelInputClose()}
                    centerCanvasInContainer={true}
                    onNotification={(messageObj) => this.handleNotification(messageObj)}
                    onKeyDown={ e => this.handleCanvasKeyDown(e)}
                    // defaultLabel='no label'
                    />
                <ToolBar 
                    ref={this.toolbar} 
                    onDeleteAllAnnos={() => this.canvas.current.deleteAllAnnos()}
                    />
                <InfoBoxArea container={this.container}></InfoBoxArea>
                <NotificationContainer/>
             </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        fullscreenMode: state.sia.fullscreenMode,
        selectedAnno: state.sia.selectedAnno,
        svg: state.sia.svg,
        annos: state.sia.annos,
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
        currentImage: state.sia.annos.image
    })
}

export default connect(
    mapStateToProps,
    {
        siaLayoutUpdate, getSiaAnnos,
        getSiaConfig, getSiaLabels, siaSetSVG, getSiaImage,
        siaUpdateAnnos, siaSendFinishToBackend,
        selectAnnotation,
        siaShowImgLabelInput,
        siaImgIsJunk,
        getWorkingOnAnnoTask,
        siaGetNextImage, siaGetPrevImage, siaFilterImage
    }
    , null,
    {})(SIA)

