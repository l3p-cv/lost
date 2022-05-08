import axios from 'axios'
import { API_URL } from '../../../../src/lost_settings'
// import { useHistory } from 'react-router-dom'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../../../src/actions'
import 'semantic-ui-css/semantic.min.css'
import Canvas from '../SIA/lost-sia/src/Canvas'
import '../SIA/lost-sia/src/SIA.scss'
import FilterInfoBox from './FilterInfoBox'
import * as tbe from '../SIA/lost-sia/src/types/toolbarEvents'

// import {dummyAnnos, uiConfig, possibleLabels, imageBlob, canvasConfig} from './dummyData'
import ToolBar from './ToolBar'
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
class SIAReview extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fullscreenCSS: '',
            layoutOffset: {
                left: 20,
                top: 0,
                bottom: 5,
                right: 5,
            },
            svg: undefined,
            tool: 'bBox',
            imgLabelInputVisible: false,
            isJunk: false,
            image: { id: null, data: null },
            iteration: null,
        }
        this.container = React.createRef()
        // this.canvas = React.createRef()
    }

    resetCanvas() {
        this.setState({
            imgLabelInputVisible: false,
        })
    }
    handleSetSVG(svg) {
        this.setState({ svg: { ...svg } })
    }
    handleToolSelected(tool) {
        this.setState({ tool: tool })
    }
    handleToggleImgLabelInput() {
        this.setState({ imgLabelInputVisible: !this.state.imgLabelInputVisible })
    }
    handleToggleJunk() {
        this.props.siaImgIsJunk(!this.props.isJunk)
    }

    componentDidMount() {
        window.addEventListener('resize', this.props.siaLayoutUpdate)
        // document.body.style.overflow = "hidden"

        //direction: 'next', 'previous', 'first'
        const data = {
            direction: 'first',
            image_anno_id: null,
            iteration: null,
            pe_id: this.props.pipeElementId,
        }
        this.props.getSiaReviewOptions(this.props.pipeElementId)
        this.props.getSiaReviewAnnos(data)
        // this.props.getSiaConfig()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.props.siaLayoutUpdate)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.annos) {
            if (!this.props.annos.image) return
            if (prevProps.annos) {
                if (this.props.annos.image.id !== prevProps.annos.image.id) {
                    this.requestImageFromBackend()
                }
            } else {
                this.requestImageFromBackend()
            }
        }
        if (this.state.fullscreenCSS !== prevState.fullscreenCSS) {
            this.props.siaLayoutUpdate()
        }
        if (prevProps.annos !== this.props.annos) {
            if (this.props.annos) {
                this.props.siaImgIsJunk(this.props.annos.image.isJunk)
            }
        }
    }

    requestImageFromBackend() {
        this.props.getSiaImage(this.props.annos.image.id).then((response) => {
            this.setState({
                image: {
                    // ...this.state.image,
                    id: this.props.annos.image.id,
                    data: response.data,
                },
            })
            if (this.canvas.current) {
                this.canvas.current.resetZoom()
            }
        })
    }

    handleNextPrevImage(imgId, direction) {
        const data = {
            direction: direction,
            image_anno_id: imgId,
            iteration: this.state.iteration,
            pe_id: this.props.pipeElementId,
        }
        this.props.getSiaReviewOptions(this.props.pipeElementId)
        this.props.getSiaReviewAnnos(data)
    }

    async handleSaveAnnos() {
        try {
            const newAnnos = this.canvas.getAnnos()
            // const camName = history.location.pathname.split('/').slice(-1)[0]
            const response = await axios.post(
                API_URL + '/sia/reviewupdate/' + this.props.pipeElementId,
                newAnnos,
            )
            console.log('REQUEST: siaReviewUpdate ', response)
            // this.props.siaUpdateAnnos(newAnnos).then(
            this.handleNotification({
                title: 'Saved',
                message: 'Annotations have been saved!',
                type: notificationType.INFO,
            })
            // )
        } catch (e) {
            console.error(e)
            this.handleNotification({
                title: 'Could not save!!!',
                message: 'Server Error',
                type: notificationType.ERROR,
            })
        }
    }

    handleNotification(notification) {
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

    toggleFullscreen() {
        console.log('Toggle Fullscreen')
        if (this.state.fullscreenCSS !== 'sia-fullscreen') {
            this.setState({
                fullscreenCSS: 'sia-fullscreen',
                layoutOffset: {
                    ...this.state.layoutOffset,
                    left: 50,
                    top: 5,
                },
            })
        } else {
            if (this.state.fullscreenCSS !== '') {
                this.setState({
                    fullscreenCSS: '',
                    layoutOffset: {
                        ...this.state.layoutOffset,
                        left: 20,
                        top: 0,
                    },
                })
            }
        }
    }

    handleCanvasKeyDown(e) {
        console.log('Canvas keyDown: ', e.key)
        if (!this.props.annos) return
        if (!this.props.annos.image) return
        switch (e.key) {
            case 'ArrowLeft':
                if (!this.props.annos.image.isFirst) {
                    this.handleNextPrevImage(this.props.annos.image.id, 'previous')
                } else {
                    this.handleNotification({
                        title: 'No previous image',
                        message: 'This is the first image!',
                        type: notificationType.WARNING,
                    })
                }
                break
            case 'ArrowRight':
                if (!this.props.annos.image.isLast) {
                    this.handleNextPrevImage(this.props.annos.image.id, 'next')
                } else {
                    this.handleNotification({
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

    handleIterationChange(iteration) {
        this.setState({ iteration: iteration })
        console.log('iteration', iteration)
        const data = {
            direction: 'first',
            image_anno_id: null,
            iteration: iteration,
            pe_id: this.props.pipeElementId,
        }
        this.props.siaReviewResetAnnos()
        this.props.getSiaReviewAnnos(data)
    }

    renderFilter() {
        if (!this.props.filterOptions) return null
        return (
            <FilterInfoBox
                visible={true}
                options={this.props.filterOptions}
                onIterationChange={(iter) => this.handleIterationChange(iter)}
            />
        )
    }

    handleGetFunction(canvas) {
        this.canvas = canvas
    }

    handleToolBarEvent(e, data) {
        console.log('action, data', e, data)
        switch (e) {
            case tbe.SAVE:
                this.handleSaveAnnos()
                // this.canvas.deleteAllAnnos()
                break
            case tbe.DELETE_ALL_ANNOS:
                this.canvas.deleteAllAnnos()
                break
            case tbe.TOOL_SELECTED:
                this.handleToolSelected(data)
                // this.props.siaSelectTool(data)
                break
            case tbe.GET_NEXT_IMAGE:

                
                this.handleNextPrevImage(this.props.annos.image.id, 'next')
                // onPrevImage={(imgId) => this.handleNextPrevImage(imgId, 'previous')}
                // this.props.siaGetNextImage(this.props.currentImage.id)
                break
            case tbe.GET_PREV_IMAGE:
                this.handleNextPrevImage(this.props.annos.image.id, 'previous')
                // this.props.siaGetPrevImage(this.props.currentImage.id)
                break
            case tbe.TASK_FINISHED:
                // this.props.siaSetTaskFinished()
                break
            case tbe.SHOW_IMAGE_LABEL_INPUT:
                // this.props.siaShowImgLabelInput(!this.props.imgLabelInput.show)
                break
            case tbe.IMG_IS_JUNK:
                // this.props.siaImgIsJunk(!this.props.isJunk)
                break
            case tbe.APPLY_FILTER:
                // this.props.siaApplyFilter(data)
                break
            case tbe.SHOW_ANNO_DETAILS:
                // this.props.siaSetUIConfig({
                //     ...this.props.uiConfig,
                //     annoDetails: {
                //         ...this.props.uiConfig.annoDetails,
                //         visible: !this.props.uiConfig.annoDetails.visible,
                //     },
                // })
                break
            case tbe.SHOW_LABEL_INFO:
                // this.props.siaSetUIConfig({
                //     ...this.props.uiConfig,
                //     labelInfo: {
                //         ...this.props.uiConfig.labelInfo,
                //         visible: !this.props.uiConfig.labelInfo.visible,
                //     },
                // })
                break
            case tbe.SHOW_ANNO_STATS:
                // this.props.siaSetUIConfig({
                //     ...this.props.uiConfig,
                //     annoStats: {
                //         ...this.props.uiConfig.annoStats,
                //         visible: !this.props.uiConfig.annoStats.visible,
                //     },
                // })
                break
            case tbe.EDIT_STROKE_WIDTH:
                // this.props.siaSetUIConfig({
                //     ...this.props.uiConfig,
                //     strokeWidth: data,
                // })
                break
            case tbe.EDIT_NODE_RADIUS:
                // this.props.siaSetUIConfig({
                //     ...this.props.uiConfig,
                //     nodeRadius: data,
                // })
                break
            default:
                break
        }
    }

    renderCanvas() {
        if (!this.props.annos) return 'No Review Data!'
        if (!this.props.filterOptions) return 'No Review Data!'
        return (
            <div>
                <ToolBar
                    svg={this.state.svg}
                    currentImage={this.props.annos.image}
                    onToolSelected={(tool) => this.handleToolSelected(tool)}
                    onToggleImgLabelInput={() => this.handleToggleImgLabelInput()}
                    onToggleJunk={() => this.handleToggleJunk()}
                    onNextImage={(imgId) => this.handleNextPrevImage(imgId, 'next')}
                    onPrevImage={(imgId) => this.handleNextPrevImage(imgId, 'previous')}
                    onToggleFullscreen={() => this.toggleFullscreen()}
                    onDeleteAllAnnos={() => this.canvas.current.deleteAllAnnos()}
                    onSaveAnnos={() => this.handleSaveAnnos()}
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
                    }}
                    possibleLabels={this.props.filterOptions.possible_labels}
                    onSVGUpdate={(svg) => this.handleSetSVG(svg)}
                    // onAnnoSelect={anno => this.props.selectAnnotation(anno)}
                    layoutOffset={this.state.layoutOffset}
                    isJunk={this.props.isJunk}
                    onImgLabelInputClose={() => this.handleToggleImgLabelInput()}
                    centerCanvasInContainer={true}
                    onNotification={(messageObj) => this.handleNotification(messageObj)}
                    onKeyDown={(e) => this.handleCanvasKeyDown(e)}
                    // defaultLabel='no label'
                />
            </div>
        )
    }
    
    renderSia(){
        if (!this.props.annos) return 'No Review Data!'
        if (!this.props.filterOptions) return 'No Review Data!'
        return <div>
                <Sia
                    // onAnnoEvent={(anno, annos, action) =>
                    //     this.handleAnnoPerformedAction(anno, annos, action)
                    // }
                    onNotification={(messageObj) => this.handleNotification(messageObj)}
                    onCanvasKeyDown={(e) => this.handleCanvasKeyDown(e)}
                    // onCanvasEvent={(action, data) => this.handleCanvasEvent(action, data)}
                    // onGetAnnoExample={(exampleArgs) =>
                    //     this.props.onGetAnnoExample
                    //         ? this.props.onGetAnnoExample(exampleArgs)
                    //         : {}
                    // }
                    onGetFunction={(canvasFunc) => this.handleGetFunction(canvasFunc)}
                    canvasConfig={
                        CANVAS_CONFIG
                        // {
                        // ...this.props.canvasConfig,
                        // annos: { ...this.props.canvasConfig.annos, maxAnnos: null },
                        // autoSaveInterval: 60,
                        // allowedToMarkExample: this.state.allowedToMark,
                        // }
                    }
                    uiConfig={{
                        ...this.props.uiConfig,
                        imgBarVisible: true,
                        imgLabelInputVisible: false,
                        centerCanvasInContainer: true,
                        maxCanvas: true,
                    }}
                    // nextAnnoId={this.state.nextAnnoId}
                    annos={this.props.annos.annotations}
                    imageMeta={this.props.annos.image}
                    imageBlob={this.state.image.data}
                    possibleLabels={this.props.filterOptions.possible_labels}
                    // exampleImg={this.props.exampleImg}
                    layoutUpdate={this.props.layoutUpdate}
                    selectedTool={this.state.tool}
                    // isJunk={this.props.isJunk}
                    // blocked={this.state.blockCanvas}
                    onToolBarEvent={(e, data) => this.handleToolBarEvent(e, data)}
                    // svg={this.props.svg}
                    // filter={this.props.filter}
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
                {/* <NotificationContainer /> */}
            </div>
    }

    render() {
        return (
            <div>
                {this.renderSia()}
                {/* {this.renderCanvas()}
                {this.renderFilter()} */}
                <NotificationContainer />
            </div>
        )
    }
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
