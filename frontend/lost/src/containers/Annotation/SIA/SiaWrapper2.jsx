import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import actions from '../../../actions'

import { useDispatch } from 'react-redux'
import siaActions from '../../../actions/sia'

import {
    useGetSiaAnnos,
    useGetSiaImage,
    useEditAnnotation,
    useCreateAnnotation,
} from '../../../actions/sia/sia_api'

import withRouter from '../../../utils/withRouter'

import {
    Sia2,
    canvasActions as annoActions,
    annoConversion,
    filterTools,
    notificationType,
    toolbarEvents as tbe,
    transform,
} from 'lost-sia'
import { useNavigate } from 'react-router-dom'
import { CBadge, CButton } from '@coreui/react'
import {
    INFERENCE_MODEL_TYPE,
    useTritonInference,
} from '../../../actions/inference-model/model-api'
import {
    showError,
    showInfo,
    showSuccess,
    showWarning,
} from '../../../components/Notification'
import NavigationButtons from './NavigationButtons'

import { AnnotationStatus, AnnotationTool } from 'lost-sia/models'

// import * as filterTools from './lost-sia/src/filterTools'
// import * as notificationType from './lost-sia/src/types/notificationType'

const {
    siaLayoutUpdate,
    // getSiaAnnos,
    siaSelectTool,
    siaSetTaskFinished,
    getSiaLabels,
    getSiaConfig,
    siaSetSVG,
    // getSiaImage,
    siaSendFinishToBackend,
    siaSetFullscreen,
    siaSetUIConfig,
    siaGetNextAnnoId,
    siaAllowedToMarkExample,
    selectAnnotation,
    siaShowImgLabelInput,
    siaImgIsJunk,
    getWorkingOnAnnoTask,
    // siaGetNextImage,
    // siaGetPrevImage,
    siaFilterImage,
    siaApplyFilter,
    siaUpdateOneThing,
} = actions

const SiaWrapper = (props) => {
    const navigate = useNavigate()

    const dispatch = useDispatch()

    const [image, setImage] = useState({ id: undefined, data: undefined })
    const [backendImage, setBackendImage] = useState({ id: undefined, data: undefined })
    const [canvasImgLoaded, setCanvasImgLoaded] = useState(0)
    const [annos, setAnnos] = useState({ image: undefined, annotations: undefined })
    const [blockNextImageTrigger, setBlockNextImageTrigger] = useState(false)
    const [filteredData, setFilteredData] = useState()
    const [currentRotation, setCurrentRotation] = useState(0)
    const [blockCanvas, setBlockCanvas] = useState(false)
    const [canvas, setCanvas] = useState()
    const [allowedToMark, setAllowedToMark] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    const [annoSaveResponse, setAnnoSaveResponse] = useState()
    const [blockImageChange, setBlockImageChange] = useState(false)
    const [localTaskFinished, setLocalTaskFinished] = useState(false)
    const [samPoints, setSamPoints] = useState([])
    const [samBBox, setSamBBox] = useState(null)

    const { mutate: inferAnnotations, isLoading: isInferenceLoading } =
        useTritonInference()

    const [annotations, setAnnotations] = useState()

    // image nr in annotask
    const [annotationRequestData, setAnnotationRequestData] = useState({
        direction: 'next',
        imageId: -1,
    })

    // image id in filesystem
    const [imageId, setImageId] = useState()

    // requests will automatically refetched when their state (parameter) changes
    const { data: annoData } = useGetSiaAnnos(annotationRequestData)
    const { data: imageBlobRequest } = useGetSiaImage(imageId)
    const [imageBlob, setImageBlob] = useState()

    // move this to an external state to be able to unload the image
    useEffect(() => {
        setImageBlob(imageBlobRequest)
    }, [imageBlobRequest])

    // @TODO check if request worked
    const { data: createAnnotationResponse, mutate: createAnnotation } =
        useCreateAnnotation()
    const { data: editAnnotationResponse, mutate: editAnnotation } = useEditAnnotation()

    // @TODO convert old API/backend style to new SIA format
    // while this is not finished, we'll convert the API response here
    const convertAnnoToolType = (annotationTypeString) => {
        switch (annotationTypeString) {
            case 'bBoxes':
                return AnnotationTool.BBox
            case 'lines':
                return AnnotationTool.Line
            case 'points':
                return AnnotationTool.Point
            case 'polygons':
                return AnnotationTool.Polygon
        }
    }

    const unconvertAnnoToolType = (annotationType) => {
        switch (annotationType) {
            case AnnotationTool.BBox:
                return 'bBox'
            case AnnotationTool.Line:
                return 'line'
            case AnnotationTool.Point:
                return 'point'
            case AnnotationTool.Polygon:
                return 'polygon'
        }
    }

    const unconvertAnnotationStatus = (annotationStatus) => {
        switch (annotationStatus) {
            case AnnotationStatus.NEW:
                return 'new'
            case AnnotationStatus.DELETED:
                return 'deleted'
            case AnnotationStatus.DATABASE:
                return 'database'
            case AnnotationStatus.CHANGED:
                return 'changed'
        }
    }

    // convert an annotation from SIA into the older Database format
    const convertAnnoToOldFormat = (annotation) => {
        // copy without reference
        const annotationInOldFormat = { ...annotation }

        // rename external id
        annotationInOldFormat.id = annotationInOldFormat.externalId
        annotationInOldFormat.externalId = null

        // default (just rename coordinates key)
        annotationInOldFormat.data = annotation.coordinates

        // handle special annotation types that were used in the old format
        if (annotation.type === AnnotationTool.BBox) {
            // get top left point + height and width instead of just two points
            const topLeft = annotation.coordinates[0]
            const downRight = annotation.coordinates[1]

            const width = downRight.x - topLeft.x
            const height = downRight.y - topLeft.y

            const oldFormat = {
                x: topLeft.x,
                y: topLeft.y,
                w: width,
                h: height,
            }

            annotationInOldFormat.data = oldFormat
        }

        if (annotation.type === AnnotationTool.Point) {
            // list -> single point
            annotationInOldFormat.data = annotation.coordinates[0]
        }

        // finish renaming
        annotationInOldFormat.coordinates = null

        // change the type value back
        annotationInOldFormat.type = unconvertAnnoToolType(annotation.type)

        // change the status value back
        annotationInOldFormat.status = unconvertAnnotationStatus(annotation.status)

        return annotationInOldFormat
    }

    useEffect(() => {
        // react query throws a state update with undefined right before the actual data is set when the query cache is disabled
        if (annoData?.image === undefined || annoData?.annotations === undefined) return

        // @TODO use the old api style (annos separated by type) for now, but convert it here to the new style
        const collectedAnnoData = Object.entries(annoData.annotations).flatMap(
            ([type, items]) =>
                items.map((annotation) => {
                    const convertedAnnoType = convertAnnoToolType(type)

                    let newCoords = annotation.data
                    if (convertedAnnoType === AnnotationTool.BBox) {
                        const oldFormat = annotation.data
                        newCoords = [
                            { x: oldFormat.x, y: oldFormat.x },
                            {
                                x: oldFormat.x + oldFormat.w,
                                y: oldFormat.y + oldFormat.h,
                            },
                        ]
                    }

                    if (convertedAnnoType === AnnotationTool.Point) {
                        newCoords = [annotation.data]
                    }

                    return {
                        ...annotation,
                        id: null,
                        data: null,
                        externalId: annotation.id,
                        coordinates: newCoords,
                        type: convertedAnnoType,
                        status: AnnotationStatus.DATABASE,
                    }
                }),
        )

        setAnnotations(collectedAnnoData)

        // request the image from the backend
        const imageId = annoData.image.id
        setImageId(imageId)
    }, [annoData])

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        window.addEventListener('resize', props.siaLayoutUpdate)
        // props.getSiaAnnos(-1)

        dispatch(siaActions.getSiaAnnos(-1))
        props.getSiaLabels()
        props.getSiaConfig()
        allowedToMarkExample()
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('resize', props.siaLayoutUpdate)
        }
    }, [])

    useEffect(() => {
        if (localTaskFinished) {
            console.log('localTaskFinished!', localTaskFinished)
            canvas.unloadImage()
        }
    }, [localTaskFinished])

    // useEffect(() => {
    //     if (props.taskFinished) {
    //         props.siaSendFinishToBackend().then(() => {
    //             props.history.push('dashboard')
    //         })
    //     }
    // }, [props.taskFinished])

    useEffect(() => {
        if (filteredData) {
            setImage({
                ...image,
                data: filteredData.blob,
            })
        }
    }, [filteredData])

    useEffect(() => {
        if (props.filter) {
            if (props.annos.image) {
                filterImage(props.filter)
            }
        }
    }, [props.filter])

    useEffect(() => {
        if (canvasImgLoaded !== undefined) {
            if (props.filter) {
                if (props.annos.image) {
                    if (backendImage.id) {
                        if (
                            props.filter.clahe.active === false &&
                            props.filter.rotate.active === false
                        ) {
                            console.log('Do not filter!')
                        } else {
                            if (filteredData) {
                                if (filteredData.id !== backendImage.id) {
                                    console.log('canvasImgLoaded -> filterImage')
                                    filterImage(props.filter)
                                }
                            } else {
                                console.log('canvasImgLoaded -> filterImage')
                                filterImage(props.filter)
                            }
                        }
                    }
                }
            }
        }
    }, [canvasImgLoaded])

    useEffect(() => {
        console.log('New backend image: ', backendImage)
        if (backendImage.id) {
            console.log('backendImage -> setImage')
            setImage({ ...backendImage })
        }
    }, [backendImage])

    useEffect(() => {
        return () => {
            // setImage({ id: undefined, data: undefined })
            // setBackendImage({ id: undefined, data: undefined })
            // setCanvasImgLoaded(0)
            // setAnnos({ image: undefined, annotations: undefined })
            // setBlockNextImageTrigger(false)
            setFilteredData()
            setCurrentRotation(0)
            setBlockCanvas(false)
            // setCanvas()
            setAllowedToMark(false)
            setFullscreen(false)
            console.log('cleaned up')
        }
    }, [])

    const allowedToMarkExample = () => {
        props.siaAllowedToMarkExample().then((response) => {
            if (response !== undefined) {
                setAllowedToMark(response.data)
            } else {
                console.warn('Failed to call AllowedToMarkExample webservice!')
            }
        })
    }

    const handleImgLabelInputClose = () => {
        props.siaShowImgLabelInput(!props.imgLabelInput.show)
    }

    const handleAnnoSaveEvent = (saveData) => {
        console.log('SiaWrapper -> handleAnnoSaveEvent', saveData)
        props.siaUpdateOneThing(saveData).then((response) => {
            if (response === 'error') {
                handleNotification({
                    title: 'Anno save failed',
                    message: 'Error while saving annotation.',
                    type: notificationType.ERROR,
                })
            } else {
                console.log('handleAnnoSaveResponse ', response.data)
                setAnnoSaveResponse(response.data)
                if (localTaskFinished) {
                    props.siaSetTaskFinished()
                    props.siaSendFinishToBackend().then(() => {
                        navigate('/annotation')
                    })
                }
            }
        })
    }

    const handleNotification = (messageObj) => {
        switch (messageObj.type) {
            case notificationType.WARNING:
                showWarning(messageObj.message)
                break
            case notificationType.INFO:
                showInfo(messageObj.message)
                break
            case notificationType.ERROR:
                showError(messageObj.message)
                break
            case notificationType.SUCCESS:
                showSuccess(messageObj.message)
                break
            default:
                break
        }
    }

    const getNextImage = () => {
        // if (!blockNextImageTrigger) {
        //     setBlockNextImageTrigger(true)
        //     // props.siaGetNextImage(props.currentImage.id)
        //     dispatch(siaActions.siaGetNextImage(props.currentImage.id))
        // }

        setImageBlob()
        setAnnotationRequestData({
            direction: 'next',
            imageId: imageId,
        })

        handleClearSamHelperAnnos()
    }

    const getPreviousImage = () => {
        // console.log(blockNextImageTrigger, props.currentImage.id)
        // if (!blockNextImageTrigger) {
        //     setBlockNextImageTrigger(true)
        //     // props.siaGetPrevImage(props.currentImage.id)
        //     dispatch(siaActions.siaGetPrevImage(props.currentImage.id))
        // }
        setImageBlob()
        setAnnotationRequestData({
            direction: 'prev',
            imageId: imageId,
        })

        handleClearSamHelperAnnos()
    }

    const submitAnnotask = () => {
        console.log('@TODO implement finish annotask logic here')
    }

    const handleToolBarEvent = (e, data) => {
        console.log('action, data', e, data)
        switch (e) {
            case tbe.DELETE_ALL_ANNOS:
                canvas.deleteAllAnnos()
                break
            case tbe.TOOL_SELECTED:
                props.siaSelectTool(data)
                break
            // case tbe.GET_NEXT_IMAGE:
            //     if (!blockNextImageTrigger) {
            //         setBlockNextImageTrigger(true)
            //         props.siaGetNextImage(props.currentImage.id)
            //     }
            //     break
            // case tbe.GET_PREV_IMAGE:
            //     if (!blockNextImageTrigger) {
            //         setBlockNextImageTrigger(true)
            //         props.siaGetPrevImage(props.currentImage.id)
            //     }
            //     break
            case tbe.TASK_FINISHED:
                setLocalTaskFinished(true)
                break
            case tbe.SHOW_IMAGE_LABEL_INPUT:
                props.siaShowImgLabelInput(!props.imgLabelInput.show)
                break
            case tbe.IMG_IS_JUNK:
                props.siaImgIsJunk(!props.isJunk)
                break
            case tbe.APPLY_FILTER:
                props.siaApplyFilter(data)
                break
            case tbe.SHOW_ANNO_DETAILS:
                props.siaSetUIConfig({
                    ...props.uiConfig,
                    annoDetails: {
                        ...props.uiConfig.annoDetails,
                        visible: !props.uiConfig.annoDetails.visible,
                    },
                })
                break
            case tbe.SHOW_LABEL_INFO:
                props.siaSetUIConfig({
                    ...props.uiConfig,
                    labelInfo: {
                        ...props.uiConfig.labelInfo,
                        visible: !props.uiConfig.labelInfo.visible,
                    },
                })
                break
            case tbe.SHOW_ANNO_STATS:
                props.siaSetUIConfig({
                    ...props.uiConfig,
                    annoStats: {
                        ...props.uiConfig.annoStats,
                        visible: !props.uiConfig.annoStats.visible,
                    },
                })
                break
            case tbe.EDIT_STROKE_WIDTH:
                props.siaSetUIConfig({
                    ...props.uiConfig,
                    strokeWidth: data,
                })
                break
            case tbe.EDIT_NODE_RADIUS:
                props.siaSetUIConfig({
                    ...props.uiConfig,
                    nodeRadius: data,
                })
                break
            case 'clearSamHelperAnnos':
                handleClearSamHelperAnnos()
                break
            default:
                break
        }
    }

    const handleCanvasKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowLeft':
                if (!blockImageChange) {
                    if (!props.currentImage.isFirst) {
                        if (!blockNextImageTrigger) {
                            setBlockNextImageTrigger(true)
                            props.siaGetPrevImage(props.currentImage.id)
                        }
                    } else {
                        handleNotification({
                            notification: {
                                title: 'No previous image',
                                message: 'This is the first image!',
                                type: notificationType.WARNING,
                            },
                        })
                    }
                } else {
                    handleNotification({
                        notification: {
                            title: 'Can not change image!',
                            message: 'Can not change image in anno create mode',
                            type: notificationType.WARNING,
                        },
                    })
                }
                break
            case 'ArrowRight':
                if (!blockImageChange) {
                    if (!props.currentImage.isLast) {
                        if (!blockNextImageTrigger) {
                            setBlockNextImageTrigger(true)
                            props.siaGetNextImage(props.currentImage.id)
                        }
                    } else {
                        handleNotification({
                            notification: {
                                title: 'No next image',
                                message: 'This is the last image!',
                                type: notificationType.WARNING,
                            },
                        })
                    }
                } else {
                    handleNotification({
                        notification: {
                            title: 'Can not change image!',
                            message: 'Can not change image in anno create mode',
                            type: notificationType.WARNING,
                        },
                    })
                }
                break
            case 'j':
            case 'J':
                props.siaImgIsJunk(!props.isJunk)
                break
            case 'f':
                setFullscreen(!fullscreen)
                break
            default:
                break
        }
    }

    // const handleAutoSave = () => {
    //     if (canvas) {
    //         const newAnnos = undoAnnoRotationForUpdate(false)
    //         if (
    //             newAnnos.annotations.bBoxes.length ||
    //             newAnnos.annotations.lines.length ||
    //             newAnnos.annotations.points.length ||
    //             newAnnos.annotations.polygons.length
    //         ) {
    //             props.siaUpdateAnnos(newAnnos, true).then((response) => {
    //                 if (response === 'error') {
    //                     handleNotification({
    //                         title: 'AutoSave failed',
    //                         message: 'Error while auto saving annotations.',
    //                         type: notificationType.ERROR,
    //                     })
    //                 } else {
    //                     handleNotification({
    //                         title: 'Performed AutoSave',
    //                         message: 'Saved SIA annotations',
    //                         type: notificationType.INFO,
    //                     })
    //                 }
    //             })
    //         }
    //     }
    // }

    const handleAnnoPerformedAction = (anno, annos, action) => {
        switch (action) {
            case annoActions.ANNO_SELECTED:
                console.log('anno selected')
                props.selectAnnotation(anno)
                break
            case annoActions.ANNO_ENTER_CREATE_MODE:
            case annoActions.ANNO_ENTER_EDIT_MODE:
            case annoActions.ANNO_ENTER_MOVE_MODE:
                console.log('handleAnnoPerformedAction', action)
                setBlockImageChange(true)
                break
            case annoActions.ANNO_CREATED:
            case annoActions.ANNO_DELETED:
            case annoActions.ANNO_LABEL_UPDATE:
            case annoActions.ANNO_CREATED_FINAL_NODE:
            case annoActions.ANNO_MOVED:
            case annoActions.ANNO_EDITED:
                setBlockImageChange(false)
                console.log('handleAnnoPerformedAction', action)
                break
            default:
                break
        }
    }

    const handleCanvasEvent = (action, data) => {
        console.log('handleCanvasEvent', action)
        switch (action) {
            // case annoActions.CANVAS_AUTO_SAVE:
            //     handleAutoSave()
            //     break
            case annoActions.CANVAS_SVG_UPDATE:
                props.siaSetSVG(data)
                break
            case annoActions.CANVAS_UI_CONFIG_UPDATE:
                props.siaSetUIConfig(data)
                break
            case annoActions.CANVAS_LABEL_INPUT_CLOSE:
                handleImgLabelInputClose()
                break
            case annoActions.CANVAS_IMG_LOADED:
                // handleImgLabelInputClose()
                console.log('Canvas img loaded', data)
                setCanvasImgLoaded(canvasImgLoaded + 1)
                setBlockNextImageTrigger(false)
                break
            default:
                break
        }
    }

    const undoAnnoRotationForUpdate = (saveState = true) => {
        if (currentRotation !== 0) {
            return rotateAnnos(0, true, saveState)
        }
        return canvas.getAnnos(undefined, true)
    }

    const rotateAnnos = (absAngle, removeFrontendIds = false, saveState = true) => {
        const angle = absAngle - currentRotation
        const bAnnos = canvas.getAnnos(undefined, removeFrontendIds)
        const svg = props.svg
        let sAnnos = annoConversion.backendAnnosToCanvas(bAnnos.annotations, svg, {
            x: 0,
            y: 0,
        })
        const pivotPoint = { x: svg.width / 2.0, y: svg.height / 2.0 }
        sAnnos = sAnnos.map((el) => {
            return {
                ...el,
                data: transform.rotateAnnotation(el.data, pivotPoint, angle),
            }
        })
        let imageCorners = [
            { x: 0, y: 0 },
            { x: 0, y: svg.height },
            { x: svg.width, y: 0 },
            { x: svg.width, y: svg.height },
        ]
        imageCorners = transform.rotateAnnotation(imageCorners, pivotPoint, angle)

        const transPoint = transform.getMostLeftPoint(
            transform.getTopPoint(imageCorners),
        )[0]
        sAnnos = sAnnos.map((el) => {
            return {
                ...el,
                data: transform.move(el.data, -transPoint.x, -transPoint.y),
            }
        })

        let newSize, minCorner, maxCorner
        ;[minCorner, maxCorner] = transform.getMinMaxPoints(imageCorners)
        newSize = {
            width: maxCorner.x - minCorner.x,
            height: maxCorner.y - minCorner.y,
        }
        const bAnnosNew = {
            ...bAnnos,
            annotations: annoConversion.canvasToBackendAnnos(sAnnos, newSize),
        }
        if (saveState) {
            setCurrentRotation(absAngle)
        }
        return bAnnosNew
    }

    /**
     * Filter image via backend service
     * @param {*} filter The image filter to apply e.g.
     * {
     *   'clahe' : {'clipLimit':2.0},
     *   'rotate':{'angle':90}
     * }
     */
    const filterImage = (filter) => {
        if (canvas) {
            const data = {
                ...filter,
                imageId: props.annos.image.id,
            }
            console.log('filterImage ', data)
            canvas.unloadImage()
            props.siaFilterImage(data).then((response) => {
                let bAnnosNew
                if (filter.rotate !== undefined) {
                    bAnnosNew = rotateAnnos(filter.rotate.angle, false)
                } else {
                    bAnnosNew = canvas.getAnnos(undefined, false)
                }
                setBlockCanvas(false)
                setAnnos({
                    image: { ...props.annos.image },
                    annotations: bAnnosNew.annotations,
                })
                setFilteredData({ id: data.imageId, blob: response.data })
            })
            canvas.resetZoom()
        }
    }

    const failedToLoadImage = () => {
        const message = {
            title: 'Load image error',
            message: 'Failed to load image',
            type: notificationType.ERROR,
        }
        handleNotification(message)
        return undefined
    }

    const handleGetFunction = (c) => {
        console.log('canvas', c)
        setCanvas(c)
    }

    const handleAddAnnotation = () => {
        if (image.id) {
            inferAnnotations(
                {
                    imageId: image.id,
                    modelId: props.canvasConfig.inferenceModel.id,
                    prompts: {
                        points: samPoints.map((point) => ({
                            x: point.normX,
                            y: point.normY,
                            label: point.type,
                        })),
                        bbox: samBBox
                            ? {
                                  xMin: samBBox.xMinNorm,
                                  yMin: samBBox.yMinNorm,
                                  xMax: samBBox.xMaxNorm,
                                  yMax: samBBox.yMaxNorm,
                              }
                            : undefined,
                    },
                },
                {
                    onSuccess: () => {
                        showSuccess('Annotations inferred successfully!')
                        setSamBBox(null) // reset SAM bounding box
                        // getNewImage(image.id, 'current')
                        props.getSiaAnnos(image.id, 'current')
                    },
                    onError: () => {
                        showError('An error occurred while inferring annotations!')
                    },
                },
            )
        } else {
            console.warn('No image id found!')
        }
    }

    const handleSamPointClick = (x, y, normX, normY, type) => {
        // @ts-expect-error disabling type check since it is a jsx file
        setSamPoints((prev) => [
            ...prev,
            {
                x: Math.round(x),
                y: Math.round(y),
                type,
                normX,
                normY,
            },
        ])
    }

    const handleUpdateSamBBox = (bbox) => {
        setSamBBox({
            ...bbox,
        })
    }

    const handleClearSamHelperAnnos = () => {
        setSamPoints([])
        setSamBBox(null)
    }

    return (
        <>
            {props.canvasConfig.inferenceModel &&
                props.canvasConfig.inferenceModel.id && (
                    <div
                        style={{
                            paddingBottom: '10px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <CBadge color="dark">
                            Inference Model:
                            {' ' + props.canvasConfig.inferenceModel.displayName}
                        </CBadge>
                        <CButton
                            onClick={handleAddAnnotation}
                            disabled={
                                isInferenceLoading ||
                                (props.canvasConfig.inferenceModel.modelType ===
                                    INFERENCE_MODEL_TYPE.SAM &&
                                    samPoints.length === 0 &&
                                    (samBBox === null || samBBox.width === 0))
                            }
                        >
                            Infer Annotation
                        </CButton>
                    </div>
                )}
            <div style={{ height: '100%', width: '100%' }}>
                <Sia2
                    image={imageBlob}
                    initialAnnotations={annotations}
                    isLoading={!imageBlob}
                    possibleLabels={props.possibleLabels}
                    additionalButtons={
                        <NavigationButtons
                            isFirstImage={annoData?.image?.isFirst}
                            isLastImage={annoData?.image?.isLast}
                            onNextImagePressed={getNextImage}
                            onPreviousImagePressed={getPreviousImage}
                            onSubmitAnnotask={submitAnnotask}
                        />
                    }
                    onAnnoChanged={(annotation) => {
                        // do nothing when still creating annotation
                        // @TODO adapt backend to support partly-finished annotations
                        if (annotation.status === AnnotationStatus.NEW) return

                        console.log('ANNO EDITED', annotation)
                        const newAnnotation = { ...annotation }

                        // mark annoation only as changed if it made contact with the server once
                        // (keeps new annotations new)
                        newAnnotation.status =
                            annotation.status === AnnotationStatus.DATABASE
                                ? AnnotationStatus.CHANGED
                                : annotation.status

                        const annotationInOldFormat =
                            convertAnnoToOldFormat(newAnnotation)

                        const currentImageData = annoData.image
                        const imageData = {
                            imgId: currentImageData.id,
                            imgActions: currentImageData.imgActions,
                            annoTime: currentImageData.annoTime, // @TODO
                        }

                        const editAnnotationData = {
                            annotation: annotationInOldFormat,
                            imageEditData: imageData,
                        }
                        editAnnotation(editAnnotationData)
                    }}
                    onAnnoCreated={(annotation) => {
                        // do nothing when initially creating an annotation
                        // @TODO adapt backend to support partly-finished annotations
                        console.log('ANNO CREATED', annotation)
                    }}
                    onAnnoCreationFinished={(annotation) => {
                        console.log('CREATION FINISHED', annotation)

                        const newAnnotation = {
                            ...annotation,
                        }
                        const annotationInOldFormat =
                            convertAnnoToOldFormat(newAnnotation)

                        const currentImageData = annoData.image
                        const imageData = {
                            imgId: currentImageData.id,
                            imgActions: currentImageData.imgActions,
                            annoTime: currentImageData.annoTime, // @TODO
                        }

                        const createAnnotationData = {
                            annotation: annotationInOldFormat,
                            imageEditData: imageData,
                        }
                        createAnnotation(createAnnotationData)
                    }}
                />

                {/* <Sia
                    onAnnoEvent={(anno, annos, action) =>
                        handleAnnoPerformedAction(anno, annos, action)
                    }
                    onNotification={(messageObj) => handleNotification(messageObj)}
                    onCanvasKeyDown={(e) => handleCanvasKeyDown(e)}
                    onCanvasEvent={(action, data) => handleCanvasEvent(action, data)}
                    onGetAnnoExample={(exampleArgs) =>
                        props.onGetAnnoExample ? props.onGetAnnoExample(exampleArgs) : {}
                    }
                    onGetFunction={(canvasFunc) => handleGetFunction(canvasFunc)}
                    onAnnoSaveEvent={(action, saveData) =>
                        handleAnnoSaveEvent(action, saveData)
                    }
                    canvasConfig={{
                        ...props.canvasConfig,
                        annos: { ...props.canvasConfig.annos, maxAnnos: null },
                        // autoSaveInterval: 60,
                        allowedToMarkExample: allowedToMark,
                    }}
                    uiConfig={{
                        ...props.uiConfig,
                        imgBarVisible: true,
                        imgLabelInputVisible: props.imgLabelInput.show,
                        centerCanvasInContainer: true,
                        maxCanvas: true,
                    }}
                    // nextAnnoId={nextAnnoId}
                    annoSaveResponse={annoSaveResponse}
                    annos={annos.annotations}
                    isImageChanging={blockNextImageTrigger}
                    imageMeta={annos.image}
                    imageBlob={image.data}
                    possibleLabels={props.possibleLabels}
                    exampleImg={props.exampleImg}
                    layoutUpdate={props.layoutUpdate}
                    selectedTool={props.selectedTool}
                    isJunk={props.isJunk}
                    blocked={blockCanvas}
                    onToolBarEvent={(e, data) => handleToolBarEvent(e, data)}
                    fullscreen={fullscreen}
                    filter={props.filter}
                    preventScrolling={false}
                    toolbarEnabled={{
                        imgLabel: true,
                        nextPrev: true,
                        toolSelection: true,
                        fullscreen: true,
                        junk: true,
                        deleteAll: true,
                        settings: { infoBoxes: true, annoStyle: true },
                        filter: { rotate: false, clahe: true },
                        help: true,
                    }}
                    samPoints={samPoints}
                    onSamPointClick={handleSamPointClick}
                    samBBox={samBBox}
                    onUpdateSamBBox={handleUpdateSamBBox}
                /> */}
            </div>
        </>
    )
}

function mapStateToProps(state) {
    return {
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
        filter: state.sia.filter,
    }
}

export default connect(
    mapStateToProps,
    {
        siaLayoutUpdate,
        // getSiaAnnos,
        getSiaConfig,
        getSiaLabels,
        siaSetSVG,
        // getSiaImage,
        siaSendFinishToBackend,
        selectAnnotation,
        siaSetTaskFinished,
        siaShowImgLabelInput,
        siaSetFullscreen,
        siaImgIsJunk,
        siaSetUIConfig,
        siaAllowedToMarkExample,
        getWorkingOnAnnoTask,
        siaGetNextAnnoId,
        siaSelectTool,
        // siaGetNextImage,
        // siaGetPrevImage,
        siaFilterImage,
        siaApplyFilter,
        siaUpdateOneThing,
    },
    null,
    {},
)(withRouter(SiaWrapper))
