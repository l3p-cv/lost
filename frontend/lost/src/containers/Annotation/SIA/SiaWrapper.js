import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../../actions'
import 'semantic-ui-css/semantic.min.css'
import * as tbe from './lost-sia/src/types/toolbarEvents'

// import from npm package
//import Canvas from 'lost-sia'
//import 'lost-sia/dist/index.css'

// import from source code
import Canvas from './lost-sia/src/Canvas'

import './sia-container.scss';

import ToolBar from './ToolBar'
import {NotificationManager, NotificationContainer } from 'react-notifications'
import { withRouter } from 'react-router-dom';
import InfoBoxArea from './lost-sia/src/InfoBoxes/InfoBoxArea'
import 'react-notifications/lib/notifications.css';

import * as notificationType from './lost-sia/src/types/notificationType'
import * as transform from './lost-sia/src/utils/transform'
import * as filterTools from './filterTools'
import * as annoConversion from './lost-sia/src/utils/annoConversion'
import AnnoDetails from './lost-sia/src/InfoBoxes/AnnoDetails'
import * as annoActions from './lost-sia/src/types/canvasActions'


const { 
    siaLayoutUpdate, getSiaAnnos, siaSelectTool,
    getSiaLabels, getSiaConfig, siaSetSVG, getSiaImage, 
    siaUpdateAnnos, siaSendFinishToBackend, siaSetFullscreen,
    siaSetUIConfig, siaGetNextAnnoId, siaAllowedToMarkExample,
    selectAnnotation, siaShowImgLabelInput, siaImgIsJunk, getWorkingOnAnnoTask,
    siaGetNextImage, siaGetPrevImage, siaFilterImage, siaApplyFilter
} = actions

class SiaWrapper extends Component {

    constructor(props) {
        super(props)
        this.state = {
            fullscreenCSS: '',
            didMount: false,
            image: {
                id: undefined,
                data: undefined,
            },
            annos: {
                image: undefined,
                annotations: undefined
            },
            layoutOffset: {
                left: 20,
                top: 0,
                bottom: 5,
                right: 5
            },
            notification: undefined,
            filteredData: undefined,
            currentRotation: 0,
            blockCanvas: false,
            nextAnnoId: undefined,
            allowedToMark: false
        }
        
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
        this.getNextAnnoId()
        this.allowedToMarkExample()
        // console.warn('We are not using real SIA config')
    }
    componentWillUnmount() {
        document.body.style.overflow = ""
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
            const newAnnos = this.undoAnnoRotationForUpdate(this.props.filter)
            this.props.siaUpdateAnnos(newAnnos).then(()=>{
                this.props.siaSendFinishToBackend().then(()=>{
                    this.props.history.push('dashboard')

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
            this.setState({image:{
                ...this.state.image,
                data: this.state.filteredData
            }})
        }
        if(prevProps.annos !== this.props.annos){
            this.setState({annos:this.props.annos})
        }
        if(prevProps.filter != this.props.filter){
            if (this.props.filter){
                this.filterImage(this.props.filter)
            }
        }
    }


    getNextAnnoId(){
        this.props.siaGetNextAnnoId().then(response => {
            this.setState({nextAnnoId: response.data})
        })
    }
    allowedToMarkExample(){
        this.props.siaAllowedToMarkExample().then(response => {
            if (response !== undefined){
                this.setState({allowedToMark: response.data})
            } else {
                console.warn('Failed to call AllowedToMarkExample webservice!')
            }
        })
    }
    getNewImage(imageId, direction){
        this.canvas.current.resetZoom()
        const newAnnos = this.undoAnnoRotationForUpdate(this.props.filter)
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

    handleToolBarEvent(e, data){
        console.log('handleToolBarEvent: ', e, data)
        switch(e){
            case tbe.DELETE_ALL_ANNOS:
                this.canvas.current.deleteAllAnnos()
                break
            case tbe.TOOL_SELECTED:
                this.props.siaSelectTool(data)
                break
            case tbe.GET_NEXT_IMAGE:
                this.props.siaGetNextImage(this.props.currentImage.id)
                break
            case tbe.GET_PREV_IMAGE:
                this.props.siaGetPrevImage(this.props.currentImage.id)
                break
            case tbe.TASK_FINISHED:
                this.props.siaSetTaskFinished()
                break
            case tbe.SHOW_IMAGE_LABEL_INPUT:
                this.props.siaShowImgLabelInput(!this.props.imgLabelInput.show)
                break
            case tbe.IMG_IS_JUNK:
                this.props.siaImgIsJunk(!this.props.isJunk)
                break
            case tbe.SET_FULLSCREEN:
                this.props.siaSetFullscreen(!this.props.fullscreenMode)
                break
            default:
                break
        }
    }

    handleCanvasKeyDown(e){
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
            case 'j':
            case 'J':
                this.props.siaImgIsJunk(!this.props.isJunk)
                break
            default:
                break
        }
    }
    
    handleAutoSave(){
        if (this.canvas.current){
            const newAnnos = this.undoAnnoRotationForUpdate(false)
            this.props.siaUpdateAnnos(newAnnos, true)
            this.handleNotification({
                title: "Performed AutoSave",
                message: "Saved SIA annotations",
                type: notificationType.INFO
            })
        }
    }

    handleAnnoPerformedAction(anno, annos, action){
        console.log('annoPerformedAction', anno, annos, action)
        switch(action){
            case annoActions.ANNO_CREATED:
            case annoActions.ANNO_CREATED_FINAL_NODE:
                // console.log('ANNO CREATED!')
                this.getNextAnnoId()
                break
            case annoActions.ANNO_SELECTED:
                console.log('anno selected')
                this.props.selectAnnotation(anno)
                break
            default:
                break
        }
    }

    handleCanvasEvent(action, data){
        console.log('Handle canvas event', action, data)
        switch(action){
            case annoActions.CANVAS_AUTO_SAVE:
                this.handleAutoSave()
                break
            case annoActions.CANVAS_SVG_UPDATE:
                this.props.siaSetSVG(data)
                break
            case annoActions.CANVAS_UI_CONFIG_UPDATE:
                this.props.siaSetUIConfig(data)
                break
            case annoActions.CANVAS_LABEL_INPUT_CLOSE:
                this.handleImgLabelInputClose()
                break
            default:
                break
        }

    }

    undoAnnoRotationForUpdate(saveState=true){
        if (this.state.currentRotation!== 0){
            // const currentRotation = this.state.currentRotation
            // this.setState({currentRotation:0})
            return this.rotateAnnos(0, true, saveState)
        }
        // if (currentFilter){
        //     if (currentFilter.rotate){
        //         if (currentFilter.rotate.angle !== 0){
        //             return this.rotateAnnos(-currentFilter.rotate.angle, true)
        //         }
        //     } 
        // }
        return this.canvas.current.getAnnos(undefined, true)
    }

    rotateAnnos(absAngle, removeFrontendIds=false, saveState=true){
        const angle = absAngle - this.state.currentRotation
        const bAnnos = this.canvas.current.getAnnos(undefined, removeFrontendIds)
        const svg = this.canvas.current.state.image
        let sAnnos = annoConversion.backendAnnosToCanvas(bAnnos.annotations, svg)
        let pivotPoint = {x:svg.width/2.0, y:svg.height/2.0}
        sAnnos = sAnnos.map(el => {
            return {
                ...el,
                data: transform.rotateAnnotation(
                    el.data, 
                    pivotPoint, 
                    // {x:0.0,y:0.0},
                    angle)
            }
        })
        // translate annotations into origin of new coordinate system
        let imageCorners = [
            {x:0, y:0},{x:0, y:svg.height}, 
            {x:svg.width,y:0}, {x:svg.width,y:svg.height}
        ]
        imageCorners = transform.rotateAnnotation(
            imageCorners, 
            pivotPoint, 
            angle)
    
        let transPoint = transform.getMostLeftPoint(transform.getTopPoint(imageCorners))[0]
        // let transPoint = transform.getTopPoint(transform.getMostLeftPoint(imageCorners))[0]
        // if (angle==180 || angle===-180){
        //     transPoint={x:0.0,y:0.0}
        // }

        // transPoint = transform.rotateAnnotation([transPoint], pivotPoint, angle)[0]
        sAnnos = sAnnos.map(el => {
            return {
                ...el,
                data: transform.move(el.data, -transPoint.x, -transPoint.y)
            }
        })

        // sAnnos = transform.rotateAnnotation(sAnnos, {x:svg.width/2, y:svg.height/2}, angle)
        let newSize, minCorner, maxCorner
        [minCorner, maxCorner] = transform.getMinMaxPoints(imageCorners)
        newSize = {
            width: maxCorner.x - minCorner.x, 
            height: maxCorner.y - minCorner.y
        }
        // newSize
        // if (angle==90 || angle==-90){
        //     newSize = {width:svg.height, height:svg.width}
        // } else {
        //     newSize = svg
        // }
        let bAnnosNew = {
            ...bAnnos,
            annotations: annoConversion.canvasToBackendAnnos(sAnnos, newSize)
        }
        if (saveState){
            this.setState({currentRotation:absAngle})
        }
        // this.setState({
        //     annos: {
        //         image: {...this.state.image},
        //         annotations: bAnnosNew.annotations
        //     }
        // })
        return bAnnosNew
    }

    // {
    //     'clahe' : {'clipLimit':2.0},
    //     'rotate':{'angle':angle}
    // }

    /**
     * Filter image via backend service
     * @param {*} filter The image filter to apply e.g.
     * {
     *   'clahe' : {'clipLimit':2.0},
     *   'rotate':{'angle':90}
     * }
     */
    filterImage(filter){
        // if (filterTools.active(filter)){
        const data = {
            ...filter,
            'imageId': this.props.annos.image.id
        }
        this.canvas.current.unloadImage()
        this.props.siaFilterImage(data).then(response => {
            // var blob = new Blob([response.request.response], { type: response.headers['content-type'] });
            // var url = URL.createObjectURL(blob);

            // var blob = Buffer.from(response.data, 'binary').toString('base64')
            // var url = blob

            // var b64Response = btoa(response.data);
            // var url = 'data:image/png;base64,'+b64Response;
            
            let bAnnosNew
            if (filter.rotate !== undefined){
                bAnnosNew = this.rotateAnnos(filter.rotate.angle, false)
            } else {
                bAnnosNew = this.canvas.current.getAnnos(undefined, false)
            }
            this.setState({
                filteredData: response.data,
                blockCanvas: false,
                annos: {
                    image: {...this.props.annos.image},
                    annotations: bAnnosNew.annotations
                }
        })
        //     var img = new Image();
        //     img.src = url;
        //     document.body.appendChild(img);
        })
        this.canvas.current.resetZoom()
        // }
    }

    requestImageFromBackend(){
        this.props.getSiaImage(this.props.annos.image.id).then(response=>
            {
                this.setState({
                    image: {
                        // ...this.state.image, 
                        id: this.props.annos.image.id, 
                        data:response ? response.data : this.failedToLoadImage(),
                        // data:window.URL.createObjectURL(response),
                    },
                    blockCanvas: filterTools.active(this.props.filter)
                })
            }
        )
        this.props.getWorkingOnAnnoTask()
        if (filterTools.active(this.props.filter)){
            this.filterImage(this.props.filter)
        }       
    }

    failedToLoadImage(){
        const message = 
                        {
                            title: "Load image error",
                            message: 'Failed to load image',
                            type: notificationType.ERROR
                        }
        this.handleNotification(message)
        return undefined
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
                <Canvas
                    ref={this.canvas} 
                    container={this.container}

                    onAnnoEvent={(anno, annos, action) => this.handleAnnoPerformedAction(anno, annos, action)}
                    onNotification={(messageObj) => this.handleNotification(messageObj)}
                    onKeyDown={ e => this.handleCanvasKeyDown(e)}
                    onCanvasEvent={(action, data) => this.handleCanvasEvent(action, data)}
                    onGetAnnoExample={(exampleArgs) => this.props.onGetAnnoExample ? this.props.onGetAnnoExample(exampleArgs):{} }

                    canvasConfig={{
                        ...this.props.canvasConfig,
                        annos: {...this.props.canvasConfig.annos, maxAnnos:null},
                        autoSaveInterval:60,
                        allowedToMarkExample:this.state.allowedToMark
                    }}

                    uiConfig={{...this.props.uiConfig,
                        layoutOffset:this.state.layoutOffset,
                        imgBarVisible: true,
                        imgLabelInputVisible: this.props.imgLabelInput.show,
                        centerCanvasInContainer: true,
                        maxCanvas: true
                    }}

                    nextAnnoId={this.state.nextAnnoId}
                    annos={this.state.annos.annotations}
                    imageMeta={this.state.annos.image}
                    imageBlob={this.state.image.data}
                    possibleLabels={this.props.possibleLabels}
                    exampleImg={this.props.exampleImg}

                    layoutUpdate={this.props.layoutUpdate}
                    selectedTool={this.props.selectedTool}
                    isJunk={this.props.isJunk}
                    blocked={this.state.blockCanvas}
                    // defaultLabel='no label'
                />
                <ToolBar 
                    ref={this.toolbar} 
                    onToolBarEvent={(e, data) => this.handleToolBarEvent(e, data)}
                    imageMeta={this.state.annos.image}
                    layoutUpdate={this.props.layoutUpdate}

                    svg={this.props.svg}
                    active={{
                        isJunk: this.props.isJunk,
                        selectedTool: this.props.selectedTool,
                        fullscreen: this.props.fullscreenMode
                    }}
                    canvasConfig={this.props.canvasConfig}
                    />
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
        currentImage: state.sia.annos.image,
        filter: state.sia.filter
    })
}

export default connect(
    mapStateToProps,
    {
        siaLayoutUpdate, getSiaAnnos,
        getSiaConfig, getSiaLabels, siaSetSVG, getSiaImage,
        siaUpdateAnnos, siaSendFinishToBackend,
        selectAnnotation,
        siaShowImgLabelInput, siaSetFullscreen,
        siaImgIsJunk, siaSetUIConfig, siaAllowedToMarkExample,
        getWorkingOnAnnoTask, siaGetNextAnnoId, siaSelectTool,
        siaGetNextImage, siaGetPrevImage, siaFilterImage, siaApplyFilter
    }
    , null,
    {})(withRouter((SiaWrapper)))
