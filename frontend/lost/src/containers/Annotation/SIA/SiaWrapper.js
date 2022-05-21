import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import actions from '../../../actions'
import * as tbe from './lost-sia/src/types/toolbarEvents'

import { NotificationManager, NotificationContainer } from 'react-notifications'
import { withRouter } from 'react-router-dom'
import 'react-notifications/lib/notifications.css'

import * as notificationType from './lost-sia/src/types/notificationType'
import * as transform from './lost-sia/src/utils/transform'
import * as filterTools from './lost-sia/src/filterTools'
import * as annoConversion from './lost-sia/src/utils/annoConversion'
import * as annoActions from './lost-sia/src/types/canvasActions'
import Sia from './lost-sia/src/Sia'

const {
    siaLayoutUpdate,
    getSiaAnnos,
    siaSelectTool,
    siaSetTaskFinished,
    getSiaLabels,
    getSiaConfig,
    siaSetSVG,
    getSiaImage,
    siaUpdateAnnos,
    siaSendFinishToBackend,
    siaSetFullscreen,
    siaSetUIConfig,
    siaGetNextAnnoId,
    siaAllowedToMarkExample,
    selectAnnotation,
    siaShowImgLabelInput,
    siaImgIsJunk,
    getWorkingOnAnnoTask,
    siaGetNextImage,
    siaGetPrevImage,
    siaFilterImage,
    siaApplyFilter,
} = actions

const SiaWrapper = (props) => {
    const [didMount, setDidMount] = useState(false);
    const [image, setImage] = useState({id: undefined, data: undefined})
    const [annos, setAnnos] = useState({image: undefined, annotations: undefined})
    const [nextAnnoId, setNextAnnoId] = useState()
    // const [notification, setNotification] = useState()
    const [filteredData, setFilteredData] = useState()
    const [currentRotation, setCurrentRotation] = useState(0)
    const [blockCanvas, setBlockCanvas] = useState(false)
    const [canvas, setCanvas] = useState()
    const [allowedToMark, setAllowedToMark] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    // const [currentImgId, setCurrentImgId] = useState()
    // constructor(props) {
    //     super(props)
    //     state = {
    //         // fullscreenCSS: '',
    //         didMount: false,
    //         image: {
    //             id: undefined,
    //             data: undefined,
    //         },
    //         annos: {
    //             image: undefined,
    //             annotations: undefined,
    //         },
    //         // layoutOffset: {
    //         //     left: 20,
    //         //     top: 0,
    //         //     bottom: 5,
    //         //     right: 5
    //         // },
    //         notification: undefined,
    //         filteredData: undefined,
    //         currentRotation: 0,
    //         blockCanvas: false,
    //         nextAnnoId: undefined,
    //         allowedToMark: false,
    //         fullscreen:false
    //     }
    //     canvas = undefined
    // }

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        // setState({ didMount: true })
        setDidMount(true)
        window.addEventListener('resize', props.siaLayoutUpdate)
        props.getSiaAnnos(-1)
        props.getSiaLabels()
        props.getSiaConfig()
        getNextAnnoId()
        allowedToMarkExample()
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('resize', props.siaLayoutUpdate)
        }
    }, [])

    useEffect(() => {
        if (props.getNextImage){
            getNewImage(props.getNextImage, 'next')
        }
    }, [props.getNextImage])

    useEffect(() => {
        if (props.getPrevImage){
            getNewImage(props.getPrevImage, 'prev')
        }
    }, [props.getPrevImage])

    useEffect(() => {
        if (props.annos) {
            if (props.annos.image){
                props.siaImgIsJunk(props.annos.image.isJunk)
                if (props.annos.image.id !== image.id) {
                    requestImageFromBackend()
                }
            }
            setAnnos(props.annos)
        }
        // if (props.annos) {
        //     if (prevProps.annos) {
        //         if (props.annos !== prevProps.annos) {
        //             if (props.annos.image.id) {
        //                 requestImageFromBackend()
        //             }
        //         }
        //     } else {
        //         if (props.annos.image.id) {
        //             requestImageFromBackend()
        //         }
        //     }
        // }
    }, [props.annos])

    useEffect(() => {
        if (props.taskFinished) {
            const newAnnos = undoAnnoRotationForUpdate(props.filter)
            props.siaUpdateAnnos(newAnnos).then(() => {
                props.siaSendFinishToBackend().then(() => {
                    props.history.push('dashboard')
                })
            })
        }
    }, [props.taskFinished])

    useEffect(() => {
        if (filteredData) {
            setImage({
                ...image,
                data: filteredData
            })
        }
    }, [filteredData])

    useEffect(() => {
        if (props.filter) {
            if (props.annos.image){
                filterImage(props.filter)
            }
        }
    }, [props.filter])

        // if (prevState.filteredData != state.filteredData) {
        //     setState({
        //         image: {
        //             ...state.image,
        //             data: state.filteredData,
        //         },
        //     })
        // }
        // if (prevProps.annos !== props.annos) {
        //     setState({ annos: props.annos })
        // }
        // if (prevProps.filter != props.filter) {
        //     if (props.filter) {
        //         filterImage(props.filter)
        //     }
        // }
    // componentDidMount() {
    //     document.body.style.overflow = 'hidden'
    //     setState({ didMount: true })
    //     window.addEventListener('resize', props.siaLayoutUpdate)
    //     props.getSiaAnnos(-1)
    //     props.getSiaLabels()
    //     props.getSiaConfig()
    //     getNextAnnoId()
    //     allowedToMarkExample()
    // }
    // componentWillUnmount() {
    //     document.body.style.overflow = ''
    //     window.removeEventListener('resize', props.siaLayoutUpdate)
    // }

    // componentDidUpdate(prevProps, prevState) {
    //     // setFullscreen(props.fullscreenMode)
    //     // if (prevState.fullscreenCSS !== state.fullscreenCSS){
    //     //     props.siaLayoutUpdate()
    //     // }
    //     // if (prevState.notification !== state.notification) {
    //     //     const notifyTimeOut = 5000
    //     //     if (state.notification) {
    //     //         switch (state.notification.type) {
    //     //             case notificationType.WARNING:
    //     //                 NotificationManager.warning(
    //     //                     state.notification.message,
    //     //                     state.notification.title,
    //     //                     notifyTimeOut,
    //     //                 )
    //     //                 break
    //     //             case notificationType.INFO:
    //     //                 NotificationManager.info(
    //     //                     state.notification.message,
    //     //                     state.notification.title,
    //     //                     notifyTimeOut,
    //     //                 )
    //     //                 break
    //     //             case notificationType.ERROR:
    //     //                 NotificationManager.error(
    //     //                     state.notification.message,
    //     //                     state.notification.title,
    //     //                     notifyTimeOut,
    //     //                 )
    //     //                 break
    //     //             case notificationType.SUCCESS:
    //     //                 NotificationManager.success(
    //     //                     state.notification.message,
    //     //                     state.notification.title,
    //     //                     notifyTimeOut,
    //     //                 )
    //     //                 break
    //     //             default:
    //     //                 break
    //     //         }
    //     //     }
    //     // }
    //     // if (prevProps.getNextImage !== props.getNextImage) {
    //     //     if (props.getNextImage) {
    //     //         getNewImage(props.getNextImage, 'next')
    //     //     }
    //     // }
    //     // if (prevProps.getPrevImage !== props.getPrevImage) {
    //     //     if (props.getPrevImage) {
    //     //         getNewImage(props.getPrevImage, 'prev')
    //     //     }
    //     // }
    //     // if (prevProps.annos !== props.annos) {
    //     //     props.siaImgIsJunk(props.annos.image.isJunk)
    //     // }
    //     // if (prevProps.taskFinished !== props.taskFinished) {
    //     //     const newAnnos = undoAnnoRotationForUpdate(props.filter)
    //     //     props.siaUpdateAnnos(newAnnos).then(() => {
    //     //         props.siaSendFinishToBackend().then(() => {
    //     //             props.history.push('dashboard')
    //     //         })
    //     //     })
    //     // }
    //     // if (props.annos) {
    //     //     if (prevProps.annos) {
    //     //         if (props.annos !== prevProps.annos) {
    //     //             if (props.annos.image.id) {
    //     //                 requestImageFromBackend()
    //     //             }
    //     //         }
    //     //     } else {
    //     //         if (props.annos.image.id) {
    //     //             requestImageFromBackend()
    //     //         }
    //     //     }
    //     // }
    //     // if (prevState.filteredData != state.filteredData) {
    //     //     setState({
    //     //         image: {
    //     //             ...state.image,
    //     //             data: state.filteredData,
    //     //         },
    //     //     })
    //     // }
    //     // if (prevProps.annos !== props.annos) {
    //     //     setState({ annos: props.annos })
    //     // }
    //     // if (prevProps.filter != props.filter) {
    //     //     if (props.filter) {
    //     //         filterImage(props.filter)
    //     //     }
    //     // }
    // }

    const getNextAnnoId = () => {
        props.siaGetNextAnnoId().then((response) => {
            setNextAnnoId(response.data)
            // setState({ nextAnnoId: response.data })
        })
    }
    const allowedToMarkExample = () => {
        props.siaAllowedToMarkExample().then((response) => {
            if (response !== undefined) {
                setAllowedToMark(response.data)
                // setState({ allowedToMark: response.data })
            } else {
                console.warn('Failed to call AllowedToMarkExample webservice!')
            }
        })
    }
    const getNewImage = (imageId, direction) => {
        // canvas.resetZoom()
        canvas.resetZoom()
        const newAnnos = undoAnnoRotationForUpdate(props.filter)
        // canvas.unloadImage()
        canvas.unloadImage()
        setImage({
                id: undefined,
                data: undefined,
            })
        // setState({
        //     image: {
        //         id: undefined,
        //         data: undefined,
        //     },
        // })
        props.siaImgIsJunk(false)
        props.siaUpdateAnnos(newAnnos).then(() => {
            props.getSiaAnnos(imageId, direction)
        })
    }

    const handleImgLabelInputClose = () => {
        props.siaShowImgLabelInput(!props.imgLabelInput.show)
    }

    const handleNotification = (messageObj) => {
        const notifyTimeOut = 5000
        switch (messageObj.type) {
            case notificationType.WARNING:
                NotificationManager.warning(
                    messageObj.message,
                    messageObj.title,
                    notifyTimeOut,
                )
                break
            case notificationType.INFO:
                NotificationManager.info(
                    messageObj.message,
                    messageObj.title,
                    notifyTimeOut,
                )
                break
            case notificationType.ERROR:
                NotificationManager.error(
                    messageObj.message,
                    messageObj.title,
                    notifyTimeOut,
                )
                break
            case notificationType.SUCCESS:
                NotificationManager.success(
                    messageObj.message,
                    messageObj.title,
                    notifyTimeOut,
                )
                break
                    default:
                        break
                }
        // setState({
        //     notification: messageObj,
        // })
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
            case tbe.GET_NEXT_IMAGE:
                props.siaGetNextImage(props.currentImage.id)
                break
            case tbe.GET_PREV_IMAGE:
                props.siaGetPrevImage(props.currentImage.id)
                break
            case tbe.TASK_FINISHED:
                props.siaSetTaskFinished()
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
            default:
                break
        }
    }

    const handleCanvasKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowLeft':
                if (!props.currentImage.isFirst) {
                    props.siaGetPrevImage(props.currentImage.id)
                } else {
                    handleNotification({
                        notification: {
                            title: 'No previous image',
                            message: 'This is the first image!',
                            type: notificationType.WARNING,
                        },
                    })
                }
                break
            case 'ArrowRight':
                if (!props.currentImage.isLast) {
                    props.siaGetNextImage(props.currentImage.id)
                } else {
                    handleNotification({
                        notification: {
                            title: 'No next image',
                            message: 'This is the last image!',
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
                // setState({fullscreen: !state.fullscreen})
                break
            default:
                break
        }
    }

    const handleAutoSave = () => {
        if (canvas) {
            const newAnnos = undoAnnoRotationForUpdate(false)
            props.siaUpdateAnnos(newAnnos, true)
            handleNotification({
                title: 'Performed AutoSave',
                message: 'Saved SIA annotations',
                type: notificationType.INFO,
            })
        }
    }

    const handleAnnoPerformedAction = (anno, annos, action) =>  {
        switch (action) {
            case annoActions.ANNO_CREATED:
            case annoActions.ANNO_CREATED_FINAL_NODE:
                getNextAnnoId()
                break
            case annoActions.ANNO_SELECTED:
                console.log('anno selected')
                props.selectAnnotation(anno)
                break
            default:
                break
        }
    }

    const handleCanvasEvent = (action, data) => {
        switch (action) {
            case annoActions.CANVAS_AUTO_SAVE:
                handleAutoSave()
                break
            case annoActions.CANVAS_SVG_UPDATE:
                props.siaSetSVG(data)
                break
            case annoActions.CANVAS_UI_CONFIG_UPDATE:
                props.siaSetUIConfig(data)
                break
            case annoActions.CANVAS_LABEL_INPUT_CLOSE:
                handleImgLabelInputClose()
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
        let pivotPoint = { x: svg.width / 2.0, y: svg.height / 2.0 }
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

        let transPoint = transform.getMostLeftPoint(
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
        let bAnnosNew = {
            ...bAnnos,
            annotations: annoConversion.canvasToBackendAnnos(sAnnos, newSize),
        }
        if (saveState) {
            setCurrentRotation(absAngle)
            // setState({ currentRotation: absAngle })
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
        const data = {
            ...filter,
            imageId: props.annos.image.id,
        }
        canvas.unloadImage()
        props.siaFilterImage(data).then((response) => {
            let bAnnosNew
            if (filter.rotate !== undefined) {
                bAnnosNew = rotateAnnos(filter.rotate.angle, false)
            } else {
                bAnnosNew = canvas.getAnnos(undefined, false)
            }
            setBlockCanvas(false)
            setFilteredData(response.data)
            setAnnos({
                    image: { ...props.annos.image },
                    annotations: bAnnosNew.annotations,
                })
            // setState({
            //     filteredData: response.data,
            //     blockCanvas: false,
            //     annos: {
            //         image: { ...props.annos.image },
            //         annotations: bAnnosNew.annotations,
            //     },
            // })
        })
        canvas.resetZoom()
    }

    const requestImageFromBackend = () => {
        props.getSiaImage(props.annos.image.id).then((response) => {
            setImage({
                    id: props.annos.image.id,
                    data: response ? response.data : failedToLoadImage(),
                })
            setBlockCanvas(filterTools.active(props.filter))
            // setState({
            //     image: {
            //         id: props.annos.image.id,
            //         data: response ? response.data : failedToLoadImage(),
            //     },
            //     blockCanvas: filterTools.active(props.filter),
            // })
        })
        props.getWorkingOnAnnoTask()
        if (filterTools.active(props.filter)) {
            filterImage(props.filter)
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
        // console.log(canvas.deleteAllAnnos)

        // deleteAll = deleteAll['deleteAllAnnos']
        // deleteAll = deleteAll.deleteAllAnnos
    }

    return (
        <div>
            <Sia
                onAnnoEvent={(anno, annos, action) =>
                    handleAnnoPerformedAction(anno, annos, action)
                }
                onNotification={(messageObj) => handleNotification(messageObj)}
                onCanvasKeyDown={(e) => handleCanvasKeyDown(e)}
                onCanvasEvent={(action, data) => handleCanvasEvent(action, data)}
                onGetAnnoExample={(exampleArgs) =>
                    props.onGetAnnoExample
                        ? props.onGetAnnoExample(exampleArgs)
                        : {}
                }
                onGetFunction={(canvasFunc) => handleGetFunction(canvasFunc)}
                canvasConfig={{
                    ...props.canvasConfig,
                    annos: { ...props.canvasConfig.annos, maxAnnos: null },
                    autoSaveInterval: 60,
                    allowedToMarkExample: allowedToMark,
                }}
                uiConfig={{
                    ...props.uiConfig,
                    imgBarVisible: true,
                    imgLabelInputVisible: props.imgLabelInput.show,
                    centerCanvasInContainer: true,
                    maxCanvas: true,
                }}
                nextAnnoId={nextAnnoId}
                annos={annos.annotations}
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
                // svg={props.svg}
                filter={props.filter}
                preventScrolling={false}
                toolbarEnabled={{
                    imgLabel: true,
                    nextPrev: true,
                    toolSelection: true,
                    fullscreen: true,
                    junk: true,
                    deleteAll: true,
                    settings: {infoBoxes:true, annoStyle:true},
                    filter: {rotate: true,clahe:true},
                    help: true
                }}
            />
            <NotificationContainer />
        </div>
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
        getSiaAnnos,
        getSiaConfig,
        getSiaLabels,
        siaSetSVG,
        getSiaImage,
        siaUpdateAnnos,
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
        siaGetNextImage,
        siaGetPrevImage,
        siaFilterImage,
        siaApplyFilter,
    },
    null,
    {},
)(withRouter(SiaWrapper))
