import React, { useState, useEffect, useLayoutEffect } from 'react'
import '../Annotation/SIA/lost-sia/src/SIA.scss'
import * as tbe from '../Annotation/SIA/lost-sia/src/types/toolbarEvents'
import * as canvasActions from '../Annotation/SIA/lost-sia/src/types/canvasActions'
import { NotificationManager, NotificationContainer, } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import * as notificationType from '../Annotation/SIA/lost-sia/src/types/notificationType'
import Sia from '../Annotation/SIA/lost-sia/src/Sia'
import * as reviewApi from '../../actions/dataset/dataset_review_api'
import SIAImageSearchModal from './SIAImageSearchModal'

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
    const { data: uiConfig } = reviewApi.useGetUIConfig()
    const { data: updateAnnotationResponse, mutate: updateAnnotation } = reviewApi.useUpdateAnnotation()

    const [imgLabelInputVisible, setImgLabelInputVisible] = useState(false)
    const [isImgSearchModalVisible, setIsImgSearchModalVisible] = useState(false)
    const [annoSaveResponse, setAnnoSaveResponse] = useState(false)
    const [nextPrev, setNextPrev] = useState()
    const [imgBlob, setImgBlob] = useState()
    const [canvas, setCanvas] = useState()
    const [isJunk, setIsJunk] = useState(false)
    const [selectedTool, setSelectedTool] = useState()
    const [updateSize, setUpdateSize] = useState()
    const [layoutUpdateInt, setLayoutUpdateInt] = useState(0)

    const handleToolSelected = (tool) => {
        setSelectedTool(tool)
    }

    useEffect(() => {
        setLayoutUpdateInt(layoutUpdateInt + 1)
    }, [updateSize])

    useEffect(() => {
        if (nextPrev === undefined) return

        handleNextPrevImage(nextPrev.imgId, nextPrev.cmd)
    }, [nextPrev])

    useLayoutEffect(() => {
        const windowSizeUpdate = () => {
            setUpdateSize([window.innerWidth, window.innerHeight])
        }

        window.addEventListener('resize', windowSizeUpdate)
        windowSizeUpdate()

        return () => window.removeEventListener('resize', windowSizeUpdate)
    }, [])

    useEffect(() => {
        const data = {
            direction: 'first',
            imageAnnoId: null,
            iteration: null
        }
        getReviewOptions()
        loadNextReviewPage([datasetId, data])
    }, [])

    useEffect(() => {
        if (!reviewPageData) return

        requestImageFromBackend(reviewPageData.image.id)

        // check if image is junk
        const { isJunk } = reviewPageData.image
        setIsJunk(isJunk)
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
            imageAnnoId: imgId,
            iteration: null,
            annotaskIdx: (reviewPageData.current_annotask_idx === undefined ? null : reviewPageData.current_annotask_idx)
        }

        getReviewOptions()
        loadNextReviewPage([datasetId, data])

        setNextPrev(undefined)
    }

    useEffect(() => {
        // dont show a notification on initialisation
        if (updateAnnotationResponse === undefined) return

        const [isSuccessful, response] = updateAnnotationResponse

        // make sure the type is a boolean
        if (isSuccessful === true) {
            console.log('handleAnnoSaveResponse ', response)
            setAnnoSaveResponse(response)
        } else {
            console.warn(response)
            handleNotification({
                title: 'Could not save!!!',
                message: 'Server Error',
                type: notificationType.ERROR,
            })
        }

    }, [updateAnnotationResponse])

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
            case tbe.DELETE_ALL_ANNOS:
                canvas.deleteAllAnnos()
                break
            case tbe.TOOL_SELECTED:
                handleToolSelected(data)
                break
            case tbe.GET_NEXT_IMAGE:
                setNextPrev({ imgId: reviewPageData.image.id, cmd: 'next' })
                break
            case tbe.GET_PREV_IMAGE:
                setNextPrev({ imgId: reviewPageData.image.id, cmd: 'previous' })
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

    const onImgageSearchClicked = () => {
        setIsImgSearchModalVisible(true)
    }

    const switchSIAImage = (annotaskId, imageAnnoId) => {
        const data = {
            direction: 'specificImage',
            annotaskIdx: annotaskId,
            imageAnnoId: imageAnnoId,
            iteration: null
        }

        loadNextReviewPage([datasetId, data])
    }

    const renderSia = () => {
        if (!reviewPageData) return 'No Review Data!'
        if (!reviewOptions) return 'No Review Data!'

        return <div>
            <Sia
                annoTaskId={reviewPageData.current_annotask_idx}
                annoSaveResponse={annoSaveResponse}
                onNotification={(messageObj) => handleNotification(messageObj)}
                onCanvasKeyDown={(e) => handleCanvasKeyDown(e)}
                onCanvasEvent={(action, data) => handleCanvasEvent(action, data)}
                // onGetAnnoExample={(exampleArgs) =>
                //     props.onGetAnnoExample
                //         ? props.onGetAnnoExample(exampleArgs)
                //         : {}
                // }
                onGetFunction={(canvasFunc) => handleGetFunction(canvasFunc)}
                onAnnoSaveEvent={updateAnnotation}
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
                layoutUpdate={layoutUpdateInt}
                selectedTool={selectedTool}
                isJunk={isJunk}
                // blocked={state.blockCanvas}
                onToolBarEvent={(e, data) => handleToolBarEvent(e, data)}
                onImgageSearchClicked={onImgageSearchClicked}
                // svg={props.svg}
                // filter={props.filter}
                toolbarEnabled={{
                    imgLabel: true,
                    imgSearch: true,
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
            <SIAImageSearchModal
                datasetId={datasetId}
                isVisible={isImgSearchModalVisible}
                setIsVisible={setIsImgSearchModalVisible}
                onChooseImage={switchSIAImage}
            />
            {renderSia()}
            <NotificationContainer />
        </div>
    )

}

export default SIAReview
