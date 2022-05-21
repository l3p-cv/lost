import axios from 'axios'
import { API_URL } from '../../../../src/lost_settings'
import { useHistory } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import actions from '../../../../src/actions'
import '../SIA/lost-sia/src/SIA.scss'
import * as tbe from '../SIA/lost-sia/src/types/toolbarEvents'
import * as canvasActions from '../SIA/lost-sia/src/types/canvasActions'

import { NotificationManager, NotificationContainer,  } from 'react-notifications'
import * as Notification from '../../../components/Notification'
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
    const [annosChanged, setAnnosChanged] = useState(false)
    const [nextPrev, setNextPrev] = useState()
    const [imageMeta, setImageMeta] = useState()
    const [imgBlob, setImgBlob] = useState()
    const [canvas, setCanvas] = useState()
    const [isJunk, setIsJunk] = useState(false)
    const [selectedTool, setSelectedTool] = useState()
    const history = useHistory()

    const handleToolSelected = (tool) =>  {
        setSelectedTool(tool)
        // setState({ tool: tool })
    }
    
    useEffect(() => {
        if (nextPrev){
            if (annosChanged){
                saveRequestModal()
            } else {
                handleNextPrevImage(nextPrev.imgId, nextPrev.cmd)
            }
        }

    }, [nextPrev])
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
            props.siaImgIsJunk(props.annos.image.isJunk)
        }

    }, [props.annos])

    const requestImageFromBackend = () => {
        if (canvas){
            canvas.resetZoom()
            canvas.unloadImage()
        }
        props.getSiaImage(props.annos.image.id).then((response) => {
            setImgBlob(response.data)
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
        setNextPrev(undefined)
        setAnnosChanged(false)
    }

    const handleSaveAnnos = async () => {
        try {
            const pipeElementId = history.location.pathname.split('/').slice(-1)[0]
            const newAnnos = canvas.getAnnos()
            // const camName = history.location.pathname.split('/').slice(-1)[0]
            const response = await axios.post(
                API_URL + '/sia/reviewupdate/' + pipeElementId,
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
            setAnnosChanged(false)
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
                    setNextPrev({imgId: props.annos.image.id, cmd: 'previous'})
                    // handleNextPrevImage(props.annos.image.id, 'previous')
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
                    setNextPrev({imgId: props.annos.image.id, cmd: 'next'})
                    // handleNextPrevImage(props.annos.image.id, 'next')
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
        switch (e) {
            case tbe.SAVE:
                handleSaveAnnos()
                break
            case tbe.DELETE_ALL_ANNOS:
                canvas.deleteAllAnnos()
                break
            case tbe.TOOL_SELECTED:
                handleToolSelected(data)
                break
            case tbe.GET_NEXT_IMAGE:
                handleNextPrevImage(props.annos.image.id, 'next')
                break
            case tbe.GET_PREV_IMAGE:
                handleNextPrevImage(props.annos.image.id, 'previous')
                break
            case tbe.TASK_FINISHED:
                break
            case tbe.SHOW_IMAGE_LABEL_INPUT:
                setImgLabelInputVisible(true)
                break
            case tbe.IMG_IS_JUNK:
                setIsJunk(!isJunk)
                break
            case tbe.APPLY_FILTER:
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
                break
            case tbe.SHOW_ANNO_STATS:
                break
            case tbe.EDIT_STROKE_WIDTH:
                break
            case tbe.EDIT_NODE_RADIUS:
                break
            default:
                break
        }
    }
    
    const handleCanvasEvent = (action, data) => {
        // console.log('Handle canvas event', action, data)
        switch (action) {
            case canvasActions.CANVAS_AUTO_SAVE:
                // this.handleAutoSave()
                break
            case canvasActions.CANVAS_SVG_UPDATE:
                // this.props.siaSetSVG(data)
                break
            case canvasActions.CANVAS_UI_CONFIG_UPDATE:
                // this.props.siaSetUIConfig(data)
                break
            case canvasActions.CANVAS_LABEL_INPUT_CLOSE:
                setImgLabelInputVisible(false)
                break
            default:
                break
        }
    }
    const handleAnnoPerformedAction = (anno, annos, action) => {
        switch (action) {
            case canvasActions.ANNO_CREATED:
            case canvasActions.ANNO_CREATED_FINAL_NODE:
            case canvasActions.ANNO_DELETED:
            case canvasActions.ANNO_MOVED:
            case canvasActions.ANNO_LABEL_UPDATE:
            case canvasActions.ANNO_COMMENT_UPDATE:
                setAnnosChanged(true)
                break
            default:
                break
        }

    }

    const saveRequestModal = () => {
        Notification.showDecision({
            title: 'Annotation have been changed! Do you want to save these changes?',
            option1: {
                text: 'Save Changes',
                callback: () => {
                    handleSaveAnnos()
                    handleNextPrevImage(nextPrev.imgId, nextPrev.cmd)
                },
            },
            option2: {
                text: 'Don\'t Save',
                callback: () => {handleNextPrevImage(nextPrev.imgId, nextPrev.cmd)},
            },
        })
    }

    const renderSia = () => {
        if (!props.annos) return 'No Review Data!'
        if (!props.filterOptions) return 'No Review Data!'
        return <div>
                <Sia
                    onAnnoEvent={(anno, annos, action) =>
                        handleAnnoPerformedAction(anno, annos, action)
                    }
                    onNotification={(messageObj) => handleNotification(messageObj)}
                    onCanvasKeyDown={(e) => handleCanvasKeyDown(e)}
                    onCanvasEvent={(action, data) => handleCanvasEvent(action, data)}
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
                        imgLabelInputVisible: imgLabelInputVisible,
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
                    isJunk={isJunk}
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
        // isJunk: state.sia.isJunk,
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
