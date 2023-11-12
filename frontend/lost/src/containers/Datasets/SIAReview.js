import axios from 'axios'
import { API_URL } from '../../../src/lost_settings'
import React, { useState, useEffect } from 'react'
import '../Annotation/SIA/lost-sia/src/SIA.scss'
import * as tbe from '../Annotation/SIA/lost-sia/src/types/toolbarEvents'
import * as canvasActions from '../Annotation/SIA/lost-sia/src/types/canvasActions'
import { useNavigate } from 'react-router-dom'
import { NotificationManager, NotificationContainer, } from 'react-notifications'
import * as Notification from '../../components/Notification'
import 'react-notifications/lib/notifications.css'
import * as notificationType from '../Annotation/SIA/lost-sia/src/types/notificationType'
import Sia from '../Annotation/SIA/lost-sia/src/Sia'
import * as reviewApi from '../../actions/dataset/dataset_review_api'

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

const SIAReview = ({ datasetId }) => {

    const { data: reviewPageData, mutate: loadNextReviewPage } = reviewApi.useReview()
    const { data: reviewOptions, refetch: getReviewOptions } = reviewApi.useReviewOptions()
    const { data: reviewImage, mutate: loadReviewImage } = reviewApi.useGetImage()
    const { data: uiConfig, refetch: getUIConfig } = reviewApi.useGetUIConfig()

    const [imgLabelInputVisible, setImgLabelInputVisible] = useState(false)
    const [annos, setAnnos] = useState()
    const [annosChanged, setAnnosChanged] = useState(false)
    const [nextPrev, setNextPrev] = useState()
    const [imageMeta, setImageMeta] = useState()
    const [imgBlob, setImgBlob] = useState()
    const [canvas, setCanvas] = useState()
    const [isJunk, setIsJunk] = useState(false)
    const [selectedTool, setSelectedTool] = useState()
    const navigate = useNavigate()

    const handleToolSelected = (tool) => {
        setSelectedTool(tool)
    }

    // @TODO add functionality for placeholder method
    const layoutUpdate = () => {
        console.log("LAYOUT UPDATE");
    }

    useEffect(() => {
        if (nextPrev) {
            if (annosChanged) {
                saveRequestModal()
            } else {
                handleNextPrevImage(nextPrev.imgId, nextPrev.cmd)
            }
        }

    }, [nextPrev])

    useEffect(() => {
        window.addEventListener('resize', layoutUpdate)

        const data = {
            direction: 'first',
            image_anno_id: null,
            iteration: null
        }
        getReviewOptions()
        loadNextReviewPage([datasetId, data])

        return () => {
            window.removeEventListener('resize', layoutUpdate)
        }
    }, [])

    useEffect(() => {
        if (reviewPageData) {
            requestImageFromBackend(reviewPageData.image.id)

            // @TODO support junk option
            // props.siaImgIsJunk(reviewPageData.image.isJunk)
        }

    }, [reviewPageData])

    useEffect(() => {
        if (reviewImage === undefined) return

        setImgBlob(reviewImage)
    }, [reviewImage])

    const requestImageFromBackend = (imageId) => {
        if (canvas) {
            canvas.resetZoom()
            canvas.unloadImage()
        }

        loadReviewImage(imageId)
    }

    const handleNextPrevImage = (imgId, direction) => {
        const data = {
            direction: direction,
            image_anno_id: imgId,
            iteration: null
        }
        getReviewOptions()
        loadNextReviewPage([datasetId, data])

        setNextPrev(undefined)
        setAnnosChanged(false)
    }

    const handleSaveAnnos = async () => {
        try {
            const pipeElementId = window.location.pathname.split('/').slice(-1)[0]
            const newAnnos = canvas.getAnnos()
            const response = await axios.post(
                API_URL + '/sia/reviewupdate/' + pipeElementId,
                newAnnos,
            )
            console.log('REQUEST: siaReviewUpdate ', response)
            handleNotification({
                title: 'Saved',
                message: 'Annotations have been saved!',
                type: notificationType.INFO,
            })
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
        if (!reviewPageData || !reviewPageData.image) return

        switch (e.key) {
            case 'ArrowLeft':
                if (!reviewPageData.image.isFirst) {
                    setNextPrev({ imgId: reviewPageData.image.id, cmd: 'previous' })
                } else {
                    handleNotification({
                        title: 'No previous image',
                        message: 'This is the first image!',
                        type: notificationType.WARNING,
                    })
                }
                break
            case 'ArrowRight':
                if (!reviewPageData.image.isLast) {
                    setNextPrev({ imgId: reviewPageData.image.id, cmd: 'next' })
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
                handleNextPrevImage(reviewPageData.image.id, 'next')
                break
            case tbe.GET_PREV_IMAGE:
                handleNextPrevImage(reviewPageData.image.id, 'previous')
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
                //     ...uiConfig,
                //     annoDetails: {
                //         ...uiConfig.annoDetails,
                //         visible: !uiConfig.annoDetails.visible,
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
                callback: () => { handleNextPrevImage(nextPrev.imgId, nextPrev.cmd) },
            },
        })
    }

    const renderSia = () => {
        if (!reviewPageData) return 'No Review Data!'
        if (!reviewOptions) return 'No Review Data!'
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
                    ...uiConfig,
                    imgBarVisible: true,
                    imgLabelInputVisible: imgLabelInputVisible,
                    centerCanvasInContainer: true,
                    maxCanvas: true,
                }}
                // nextAnnoId={state.nextAnnoId}
                annos={reviewPageData.annotations}
                imageMeta={reviewPageData.image}
                imageBlob={imgBlob}
                possibleLabels={reviewOptions.possible_labels}
                // exampleImg={props.exampleImg}
                layoutUpdate={layoutUpdate}
                selectedTool={selectedTool}
                isJunk={isJunk}
                // blocked={state.blockCanvas}
                onToolBarEvent={(e, data) => handleToolBarEvent(e, data)}
                // svg={props.svg}
                // filter={props.filter}
                toolbarEnabled={{
                    save: true,
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

export default SIAReview
