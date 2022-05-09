import axios from 'axios'
import { API_URL } from '../../../../src/lost_settings'
import { useHistory } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import actions from '../../../../src/actions'
import 'semantic-ui-css/semantic.min.css'
import '../SIA/lost-sia/src/SIA.scss'
import FilterInfoBox from './FilterInfoBox'
import * as tbe from '../SIA/lost-sia/src/types/toolbarEvents'

import { NotificationManager, NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import * as notificationType from '../SIA/lost-sia/src/types/notificationType'
import Sia from '../SIA/lost-sia/src/Sia'

const {
    siaLayoutUpdate,
    getSiaImage,
    siaImgIsJunk,
    getSiaReviewAnnos,
    getSiaReviewOptions,
    siaReviewResetAnnos,
} = actions

const CANVAS_CONFIG = {
                        tools: {
                            point: true,
                            line: true,
                            polygon: true,
                            bbox: true,
                            junk: true,
                        },
                        annos: {
                            minArea: 20,
                            multilabels: true,
                            actions: {
                                draw: true,
                                label: true,
                                edit: true,
                            },
                        },
                        img: {
                            multilabels: true,
                            actions: {
                                label: true,
                            },
                        },
                    }

const SIAReview = (props) => {
    const [imgLabelInputVisible, setImgLabelInputVisible] = useState(false)
    const [annos, setAnnos] = useState()
    const [imageMeta, setImageMeta] = useState()
    const [imgBlob, setImgBlob] = useState()
    const [canvas, setCanvas] = useState()
    const [selectedTool, setSelectedTool] = useState()
    const history = useHistory()
    // constructor(props) {
    //     super(props)
    //     state = {
    //         fullscreenCSS: '',
    //         layoutOffset: {
    //             left: 20,
    //             top: 0,
    //             bottom: 5,
    //             right: 5,
    //         },
    //         svg: undefined,
    //         tool: 'bBox',
    //         imgLabelInputVisible: false,
    //         isJunk: false,
    //         image: { id: null, data: null },
    //         iteration: null,
    //     }
    //     container = React.createRef()
    //     // canvas = React.createRef()
    // }

    // const resetCanvas = () => {
    //     setState({
    //         imgLabelInputVisible: false,
    //     })
    // }

    // const handleSetSVG = (svg) => {
    //     setState({ svg: { ...svg } })
    // }

    const handleToolSelected = (tool) =>  {
        setSelectedTool(tool)
        // setState({ tool: tool })
    }

    const handleToggleImgLabelInput = () =>  {
        setImgLabelInputVisible(!imgLabelInputVisible)
        // setState({ imgLabelInputVisible: !state.imgLabelInputVisible })
    }
    const handleToggleJunk = () => {
        props.siaImgIsJunk(!props.isJunk)
    }

    useEffect(() => {
        window.addEventListener('resize', props.siaLayoutUpdate)
        // document.body.style.overflow = "hidden"

        const pipeElementId = history.location.pathname.split('/').slice(-1)[0]
        //direction: 'next', 'previous', 'first'
        const data = {
            direction: 'first',
            image_anno_id: null,
            iteration: null,
            pe_id: pipeElementId,
        }
        props.getSiaReviewOptions(pipeElementId)
        props.getSiaReviewAnnos(data)
        // props.getSiaConfig()
        return () => {
            window.removeEventListener('resize', props.siaLayoutUpdate)
        }
    }, [])

    useEffect(() => {
        if (props.annos) {
            requestImageFromBackend()
            // if (props.annos.image){
            //     if (prevProps.annos) {
            //         if (props.annos.image.id !== prevProps.annos.image.id) {
            //             requestImageFromBackend()
            //         }
            //     } else {
            //         requestImageFromBackend()
            //     }
            // } 
            props.siaImgIsJunk(props.annos.image.isJunk)
        }

    }, [props.annos])

    // componentDidUpdate(prevProps, prevState) {
    //     if (props.annos) {
    //         if (!props.annos.image) return
    //         if (prevProps.annos) {
    //             if (props.annos.image.id !== prevProps.annos.image.id) {
    //                 requestImageFromBackend()
    //             }
    //         } else {
    //             requestImageFromBackend()
    //         }
    //     }
    //     // if (state.fullscreenCSS !== prevState.fullscreenCSS) {
    //     //     props.siaLayoutUpdate()
    //     // }
    //     if (prevProps.annos !== props.annos) {
    //         if (props.annos) {
    //             props.siaImgIsJunk(props.annos.image.isJunk)
    //         }
    //     }
    // }

    const requestImageFromBackend = () => {
        if (canvas){
            canvas.resetZoom()
            canvas.unloadImage()
        }
        props.getSiaImage(props.annos.image.id).then((response) => {
            setImgBlob(response.data)
            // setImageMeta(                
            //     {
            //         // ...state.image,
            //         id: props.annos.image.id,
            //         data: response.data,
            //     })
            // setState({
            //     image: {
            //         // ...state.image,
            //         id: props.annos.image.id,
            //         data: response.data,
            //     },
            // })
            // if (canvas.current) {
            //     canvas.current.resetZoom()
            // }
        })
    }

    const handleNextPrevImage = (imgId, direction) => {
        const pipeElementId = history.location.pathname.split('/').slice(-1)[0]
        const data = {
            direction: direction,
            image_anno_id: imgId,
            iteration: null,
            pe_id: pipeElementId,
        }
        // props.getSiaReviewOptions(props.pipeElementId)
        props.getSiaReviewOptions(pipeElementId)
        props.getSiaReviewAnnos(data)
    }

    const handleSaveAnnos = async () => {
        try {
            const newAnnos = canvas.getAnnos()
            // const camName = history.location.pathname.split('/').slice(-1)[0]
            const response = await axios.post(
                API_URL + '/sia/reviewupdate/' + props.pipeElementId,
                newAnnos,
            )
            console.log('REQUEST: siaReviewUpdate ', response)
            // props.siaUpdateAnnos(newAnnos).then(
            handleNotification({
                title: 'Saved',
                message: 'Annotations have been saved!',
                type: notificationType.INFO,
            })
            // )
        } catch (e) {
            console.error(e)
            handleNotification({
                title: 'Could not save!!!',
                message: 'Server Error',
                type: notificationType.ERROR,
            })
        }
    }

    const handleNotification = (notification) => {
        const notifyTimeOut = 5000
        if (notification) {
            switch (notification.type) {
                case notificationType.WARNING:
                    NotificationManager.warning(
                        notification.message,
                        notification.title,
                        notifyTimeOut,
                    )
                    break
                case notificationType.INFO:
                    NotificationManager.info(
                        notification.message,
                        notification.title,
                        notifyTimeOut,
                    )
                    break
                case notificationType.ERROR:
                    NotificationManager.error(
                        notification.message,
                        notification.title,
                        notifyTimeOut,
                    )
                    break
                case notificationType.SUCCESS:
                    NotificationManager.success(
                        notification.message,
                        notification.title,
                        notifyTimeOut,
                    )
                    break
                default:
                    break
            }
        }
    }

    const handleCanvasKeyDown = (e) => {
        console.log('Canvas keyDown: ', e.key)
        if (!props.annos) return
        if (!props.annos.image) return
        switch (e.key) {
            case 'ArrowLeft':
                if (!props.annos.image.isFirst) {
                    handleNextPrevImage(props.annos.image.id, 'previous')
                } else {
                    handleNotification({
                        title: 'No previous image',
                        message: 'This is the first image!',
                        type: notificationType.WARNING,
                    })
                }
                break
            case 'ArrowRight':
                if (!props.annos.image.isLast) {
                    handleNextPrevImage(props.annos.image.id, 'next')
                } else {
                    handleNotification({
                        title: 'No next image',
                        message: 'This is the last image!',
                        type: notificationType.WARNING,
                    })
                }
                break
            default:
                break
        }
    }

    // const handleIterationChange = (iteration) => {
    //     setState({ iteration: iteration })
    //     console.log('iteration', iteration)
    //     const data = {
    //         direction: 'first',
    //         image_anno_id: null,
    //         iteration: iteration,
    //         pe_id: props.pipeElementId,
    //     }
    //     props.siaReviewResetAnnos()
    //     props.getSiaReviewAnnos(data)
    // }

    // const renderFilter = () => {
    //     if (!props.filterOptions) return null
    //     return (
    //         <FilterInfoBox
    //             visible={true}
    //             options={props.filterOptions}
    //             onIterationChange={(iter) => handleIterationChange(iter)}
    //         />
    //     )
    // }

    const handleGetFunction = (canvas) => {
        setCanvas(canvas)
    }

    const handleToolBarEvent = (e, data) => {
        console.log('action, data', e, data)
        switch (e) {
            case tbe.SAVE:
                handleSaveAnnos()
                // canvas.deleteAllAnnos()
                break
            case tbe.DELETE_ALL_ANNOS:
                canvas.deleteAllAnnos()
                break
            case tbe.TOOL_SELECTED:
                handleToolSelected(data)
                // props.siaSelectTool(data)
                break
            case tbe.GET_NEXT_IMAGE:
                handleNextPrevImage(props.annos.image.id, 'next')
                // onPrevImage={(imgId) => handleNextPrevImage(imgId, 'previous')}
                // props.siaGetNextImage(props.currentImage.id)
                break
            case tbe.GET_PREV_IMAGE:
                handleNextPrevImage(props.annos.image.id, 'previous')
                // props.siaGetPrevImage(props.currentImage.id)
                break
            case tbe.TASK_FINISHED:
                // props.siaSetTaskFinished()
                break
            case tbe.SHOW_IMAGE_LABEL_INPUT:
                // props.siaShowImgLabelInput(!props.imgLabelInput.show)
                break
            case tbe.IMG_IS_JUNK:
                // props.siaImgIsJunk(!props.isJunk)
                break
            case tbe.APPLY_FILTER:
                // props.siaApplyFilter(data)
                break
            case tbe.SHOW_ANNO_DETAILS:
                // props.siaSetUIConfig({
                //     ...props.uiConfig,
                //     annoDetails: {
                //         ...props.uiConfig.annoDetails,
                //         visible: !props.uiConfig.annoDetails.visible,
                //     },
                // })
                break
            case tbe.SHOW_LABEL_INFO:
                // props.siaSetUIConfig({
                //     ...props.uiConfig,
                //     labelInfo: {
                //         ...props.uiConfig.labelInfo,
                //         visible: !props.uiConfig.labelInfo.visible,
                //     },
                // })
                break
            case tbe.SHOW_ANNO_STATS:
                // props.siaSetUIConfig({
                //     ...props.uiConfig,
                //     annoStats: {
                //         ...props.uiConfig.annoStats,
                //         visible: !props.uiConfig.annoStats.visible,
                //     },
                // })
                break
            case tbe.EDIT_STROKE_WIDTH:
                // props.siaSetUIConfig({
                //     ...props.uiConfig,
                //     strokeWidth: data,
                // })
                break
            case tbe.EDIT_NODE_RADIUS:
                // props.siaSetUIConfig({
                //     ...props.uiConfig,
                //     nodeRadius: data,
                // })
                break
            default:
                break
        }
    }
    
    const renderSia = () => {
        if (!props.annos) return 'No Review Data!'
        if (!props.filterOptions) return 'No Review Data!'
        return <div>
                <Sia
                    // onAnnoEvent={(anno, annos, action) =>
                    //     handleAnnoPerformedAction(anno, annos, action)
                    // }
                    onNotification={(messageObj) => handleNotification(messageObj)}
                    onCanvasKeyDown={(e) => handleCanvasKeyDown(e)}
                    // onCanvasEvent={(action, data) => handleCanvasEvent(action, data)}
                    // onGetAnnoExample={(exampleArgs) =>
                    //     props.onGetAnnoExample
                    //         ? props.onGetAnnoExample(exampleArgs)
                    //         : {}
                    // }
                    onGetFunction={(canvasFunc) => handleGetFunction(canvasFunc)}
                    canvasConfig={
                        CANVAS_CONFIG
                        // {
                        // ...props.canvasConfig,
                        // annos: { ...props.canvasConfig.annos, maxAnnos: null },
                        // autoSaveInterval: 60,
                        // allowedToMarkExample: state.allowedToMark,
                        // }
                    }
                    uiConfig={{
                        ...props.uiConfig,
                        imgBarVisible: true,
                        imgLabelInputVisible: false,
                        centerCanvasInContainer: true,
                        maxCanvas: true,
                    }}
                    // nextAnnoId={state.nextAnnoId}
                    annos={props.annos.annotations}
                    imageMeta={props.annos.image}
                    imageBlob={imgBlob}
                    possibleLabels={props.filterOptions.possible_labels}
                    // exampleImg={props.exampleImg}
                    layoutUpdate={props.layoutUpdate}
                    selectedTool={selectedTool}
                    // isJunk={props.isJunk}
                    // blocked={state.blockCanvas}
                    onToolBarEvent={(e, data) => handleToolBarEvent(e, data)}
                    // svg={props.svg}
                    // filter={props.filter}
                    toolbarEnabled={{
                        save:true,
                        imgLabel: true,
                        nextPrev: true,
                        toolSelection: true,
                        fullscreen: true,
                        junk: true,
                        deleteAll: true,
                        settings: true,
                        filter: false,
                        help: true
                    }}
                />
            </div>
    }

    return (
        <div>
            {renderSia()}
            <NotificationContainer />
        </div>
    )
    
}

function mapStateToProps(state) {
    return {
        uiConfig: state.sia.uiConfig,
        layoutUpdate: state.sia.layoutUpdate,
        isJunk: state.sia.isJunk,
        pipeElementId: state.siaReview.elementId,
        annos: state.siaReview.annos,
        filterOptions: state.siaReview.options,
    }
}

export default connect(
    mapStateToProps,
    {
        siaLayoutUpdate,
        getSiaImage,
        getSiaReviewAnnos,
        getSiaReviewOptions,
        siaImgIsJunk,
        siaReviewResetAnnos,
    },
    null,
    {},
)(SIAReview)
