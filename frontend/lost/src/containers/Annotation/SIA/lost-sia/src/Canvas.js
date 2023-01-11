import React, {Component} from 'react'
import _, { transform } from 'lodash'
import Annotation from './Annotation/Annotation'
import AnnoLabelInput from './AnnoLabelInput'
import ImgBar from './ImgBar'
import Prompt from './Prompt'
import LabelInput from './LabelInput'
import AnnoToolBar from './AnnoToolBar'

import * as annoConversion from './utils/annoConversion'
import * as keyActions from './utils/keyActions'
import KeyMapper from './utils/keyActions'
import * as TOOLS from './types/tools'
import * as modes from './types/modes'
import UndoRedo from './utils/hist'
import * as transformAnnos from './utils/transform'
import * as annoStatus from './types/annoStatus'
import * as canvasActions from './types/canvasActions'
import { Loader, Dimmer, Icon, Header, Button, Form, TextArea} from 'semantic-ui-react';
import * as mouse from './utils/mouse';
import * as colorlut from './utils/colorlut'
import * as notificationType from './types/notificationType'
import * as wv from './utils/windowViewport'

import './SIA.scss'
import InfoBoxes from './InfoBoxes/InfoBoxArea'


/**
 * SIA Canvas element that handles annotations within an image
 * 
 * @param {React.Ref} container - A react ref to a div that defines the
 *      space where this Canvas lives in.
 * @param {object} annos -  A json object containing all annotation 
 *      information for an image
 *      {
 *          image : {
 *              id: int, 
 *              number: int, 
 *              amount: int, 
 *              isFirst: bool, 
 *              isLast: bool,
 *              description: string, // -> optional
 *              imgActions: list of string, // -> optional 
 *          },
 *          annotations: {
 *              bBoxes: [{
 *                  id: int, // -> Not required if status === annoStatus.NEW
 *                  data: {},
 *                  labelIds: list of int, // -> optional
 *                  status: see annoStatus, // -> optional
 *                  annoTime: float, // -> optional
 *              },...],
 *              points: []
 *              lines: []
 *              polygons: []
 *          }
 *      }
 * @param {object} annoSaveResponse - Backend response when updating an annotation in backend
 *                  {
 *                      tempId: int or str, // temporal frontend Id 
 *                      dbId: int, // Id from backend
 *                      newStatus: str // new Status for the annotation
 *                  }
 * @param {object} possibleLabels - Possible labels that can be assigned to 
 *      an annotation.
 *      {   
 *          id: int, 
 *          description: str, 
 *          label: str, (name of the label) 
 *          color: str (color is optional)
 *      }
 * @param {blob} imageBlob - The actual image blob that will be displayed
 * @param {object} uiConfig - User interface configs 
 *      {
 *          nodesRadius: int, strokeWidth: int,
 *          layoutOffset: {left:int, top:int, right:int, bottom:int}, -> Offset of the canvas inside the container
 *          imgBarVisible: bool,
 *          imgLabelInputVisible: bool,
 *          centerCanvasInContainer: bool, -> Center the canvas in the middle of the container.
 *          maxCanvas: bool -> Maximize Canvas Size. Do not fit canvas to image size.
 *      }
 * @param {int} layoutUpdate - A counter that triggers a layout update
 *      everytime it is incremented.
 * @param {string} selectedTool - The tool that is selected to draw an 
 *      annotation. Possible choices are: 'bBox', 'point', 'line', 'polygon'
 * @param {object} canvasConfig - Configuration for this canvas
 *  {
 *      annos:{
 *          tools: {
 *              point: bool,
 *              line: bool,
 *              polygon: bool,
 *              bbox: bool
 *          },
 *          multilabels: bool,
 *          actions: {
 *              draw: bool,
 *              label: bool,
 *              edit: bool,
 *          },
 *          maxAnnos: null or int,
 *          minArea: int
 *      },
 *      img: {
 *          multilabels: bool,
 *          actions: {
 *              label: bool,
 *          }
 *      },
 *      allowedToMarkExample: bool, -> Indicates wether the current user is allowed to mark an annotation as example.
 *   }
 * @param {str or int} defaultLabel (optional) - Name or ID of the default label that is used
 *      when no label was selected by the annotator. If not set "no label" will be used.
 *      If ID is used, it needs to be one of the possible label ids.
 * @param {bool} blocked Block canvas view with loading dimmer.
 * @param {bool} preventScrolling Prevent scrolling on mouseEnter
 * @param {bool} lockedAnnos A list of AnnoIds of annos that should only be displayed.
 *      Such annos can not be edited in any way.
 * @event onAnnoSaveEvent - Callback with update information for a single 
 *          annotation or the current image that can be used for backend updates
 *          args: {
 *                      action: the action that was performed in frontend, 
 *                      anno: anno information, 
 *                      img: image information
 *              }
 * @event onNotification - Callback for Notification messages
 *      args: {title: str, message: str, type: str}
 * @event onKeyDown - Fires for keyDown on canvas 
 * @event onKeyUp - Fires for keyUp on canvas 
 * @event onAnnoEvent - Fires when an anno performed an action
 *      args: {anno: annoObject, newAnnos: list of annoObjects, pAction: str}
 * @event onCanvasEvent - Fires on canvas event
 *      args: {action: action, data: dataObject}
 *      action -> CANVAS_SVG_UPDATE 
 *          data: {width: int, height: int, scale: float, translateX: float,
 *          translateY:float}
 *      action -> CANVAS_UI_CONFIG_UPDATE
 *      action -> CANVAS_LABEL_INPUT_CLOSE 
 *      action -> CANVAS_IMG_LOADED
 *      action -> CANVAS_IMGBAR_CLOSE
 * @event onImgBarClose - Fires when close button on ImgBar was hit.
 * @event onGetFunction - Get special canvas functions for manipulation from outside canvas
 *              deleteAllAnnos()
 *              unloadImage()
 *              resetZoom()
 *              getAnnos(annos,removeFrontendIds)
 */
class Canvas extends Component{

    constructor(props){
        super(props)
        this.state = {
            
            svg: {
                width: '100%',
                height: '100%',
                scale:1.0,
                translateX:0,
                translateY:0
            },
            image: {
                width: undefined,
                height: undefined
            },
            imageOffset: {
                x: 0,
                y: 0
            },
            annos: [],
            mode: modes.VIEW,
            selectedAnnoId: undefined,
            showSingleAnno: undefined,
            showLabelInput: false,
            imageLoaded: false,
            imgLoadCount: 0,
            imgLabelIds: [],
            imgLabelChanged: false,
            imgAnnoTime: 0,
            imgLoadTimestamp: 0,
            performedImageInit: false,
            prevLabel: [],
            imageBlob: undefined,
            isJunk: false,
            imgBarVisible:false,
            annoToolBarVisible: false,
            possibleLabels: undefined,
            annoCommentInputTrigger: 0,
            imgActions: [],
        }
        this.img = React.createRef()
        this.svg = React.createRef()
        this.container = React.createRef()
        this.hist = new UndoRedo()
        this.keyMapper = new KeyMapper((keyAction) => this.handleKeyAction(keyAction))
        this.mousePosAbs = undefined
        this.clipboard = undefined
        this.delayedBackendUpdates = {}
        this.tempIdMap = {}
    }

    componentDidMount(){
        this.updatePossibleLabels()
        if (Number.isInteger(this.props.defaultLabel)){

            this.setState({prevLabel:[this.props.defaultLabel]})
        }
        if (this.props.onGetFunction){
            this.props.onGetFunction({
                'deleteAllAnnos':() => this.deleteAllAnnos(),
                'unloadImage': () => this.unloadImage(),
                'resetZoom': () => this.resetZoom(),
                'getAnnos': (annos,removeFrontendIds) => this.getAnnos(annos, removeFrontendIds)
            })
        }
    }

    componentDidUpdate(prevProps, prevState){
        if (prevProps.annoSaveResponse !== this.props.annoSaveResponse){
            this.updateAnnoBySaveResponse(this.props.annoSaveResponse)
        }
        if (prevProps.imageMeta !== this.props.imageMeta){
            if (this.props.imageMeta){
                this.setState({
                    imgLabelIds: this.props.imageMeta.labelIds,
                    imgAnnoTime: this.props.imageMeta.annoTime,
                    imgActions: this.props.imageMeta.imgActions ? this.props.imageMeta.imgActions : [],
                    imgLoadTimestamp: performance.now()
                })
            }
        }
        if (prevProps.annos !== this.props.annos){
            if (this.state.imageBlob) { 
                this.updateCanvasView(
                    annoConversion.fixBackendAnnos(this.props.annos) 
                ) 
            }
        }
        if (prevProps.isJunk !== this.props.isJunk){
            if (this.state.isJunk !== this.props.isJunk){
                this.setState({
                    isJunk: this.props.isJunk
                })
                if (this.state.imageLoaded){
                    this.handleAnnoSaveEvent(canvasActions.IMG_JUNK_UPDATE, undefined, 
                        {isJunk:this.props.isJunk})
                }
            }
        }
        if (this.state.imageBlob !== this.props.imageBlob){
            this.setState({imageBlob: this.props.imageBlob})
        }
        if (this.props.possibleLabels !== prevProps.possibleLabels){
            this.updatePossibleLabels()
        }
        if (this.state.performedImageInit){
            // Initialize canvas history
            this.setState({
                performedImageInit:false,
                annoToolBarVisible:false
            })
            if (this.props.uiConfig.imgBarVisible){
                this.setState({imgBarVisible:true})
            }
            this.hist.clearHist()
            this.hist.push({
                ...this.getAnnos(),
                selectedAnnoId: undefined
            }, 'init')
        }
        if (this.state.imageLoaded){
            // Selected annotation should be on top
            this.putSelectedOnTop(prevState)
            if (prevState.imgLoadCount !== this.state.imgLoadCount){
                this.updateCanvasView(
                    annoConversion.fixBackendAnnos(this.props.annos)
                )
                if (this.props.imageMeta){
                    this.setImageLabels(this.props.imageMeta.labelIds)
                    this.setState({
                        performedImageInit:true
                    })
                }
            } 
            if(prevProps.layoutUpdate !== this.props.layoutUpdate){
                this.selectAnnotation(undefined)
                this.updateCanvasView(annoConversion.canvasToBackendAnnos(
                    this.state.annos, this.state.svg, false, this.state.imageOffset
                ))
            }
            
        }
    }

    onImageLoad(){
        this.setState({
            imageLoaded: true,
            imgLoadCount: this.state.imgLoadCount + 1,
            showLabelInput: false,
            showSingleAnno: undefined,
            selectedAnnoId: undefined
        })
        this.triggerCanvasEvent(canvasActions.CANVAS_IMG_LOADED)
    }

    onMouseOver(){
        this.svg.current.focus()
        //Prevent scrolling on svg
        if (this.props.preventScrolling){
            document.body.style.overflow = 'hidden'
        }
    }

    onMouseLeave(){
        if (this.props.preventScrolling){
            document.body.style.overflow = ''
        }
    }

    onWheel(e){
        // Zoom implementation. Note that svg is first scaled and 
        // second translated!
        const up = e.deltaY < 0
        const mousePos = this.getMousePosition(e)
        const zoomFactor=1.25
        let nextScale
        if (up) {
            nextScale = this.state.svg.scale * zoomFactor
            
        } else {
            nextScale = this.state.svg.scale / zoomFactor
        }
        let newTranslation
        //Constrain zoom
        if (nextScale < 1.0){
            nextScale = 1.0
            newTranslation = {x:0, y:0}
        } else if (nextScale > 200.0){
            nextScale = 200.0
            newTranslation = wv.getZoomTranslation(mousePos, this.state.svg, nextScale)
        } else {
            newTranslation = wv.getZoomTranslation(mousePos, this.state.svg, nextScale)
        }
        this.setState({svg: {
            ...this.state.svg,
            scale: nextScale,
            // translateX: -1*(mousePos.x * nextScale - mousePos.x)/nextScale,
            // translateY: -1*(mousePos.y * nextScale - mousePos.y)/nextScale
            translateX: newTranslation.x,
            translateY: newTranslation.y
        }})
        return false
    }

    onRightClick(e){
        e.preventDefault()
    }

    onMouseDown(e){
        if (e.button === 0){
            this.selectAnnotation(undefined)
        }
        else if (e.button === 1){
            this.setMode(modes.CAMERA_MOVE)
        }
        else if (e.button === 2){
            //Create annotation on right click
            this.createNewAnnotation(e)
        }
    }

    onAnnoMouseDown(e){
        if (e.button === 1){
            // this.collectAnnos()
            this.setMode(modes.CAMERA_MOVE)
        }
        else if (e.button === 2){
            //Create annotation on right click
           this.createNewAnnotation(e)
        }
        else if (e.button === 0){
            if (this.state.showLabelInput){
                const anno = this.findAnno(this.state.selectedAnnoId)
                this.updateSelectedAnno(anno, modes.VIEW)
                this.showSingleAnno(undefined)
                this.showLabelInput(false)
            }
        }
    }

    onMouseUp(e){
        switch (e.button){
            case 1:
                this.setMode(modes.VIEW)
                break
            default:
                break
        }
    }

    updateAnnoComment(comment){
        const anno = this.findAnno(this.state.selectedAnnoId)
        anno.comment = comment
        this.handleAnnoEvent(anno, canvasActions.ANNO_COMMENT_UPDATE)
    }

    handleKeyAction(action){
        const anno = this.findAnno(this.state.selectedAnnoId)
        const camKeyStepSize = 20 * this.state.svg.scale

        switch(action){
            case keyActions.EDIT_LABEL:
                // Need to get the newest version of annotation data directly 
                // from annotation object, when editing label/ hitting enter
                // in create mode, since annotation data in canvas are not updated
                // to this point in time. 
                const ar = this.findAnnoRef(this.state.selectedAnnoId)
                let myAnno = undefined
                if (ar !== undefined){
                    myAnno = ar.current.myAnno.current.getResult()
                }
                this.editAnnoLabel(myAnno)
                break
            case keyActions.DELETE_ANNO:
                this.deleteAnnotation(anno)
                break
            case keyActions.TOGGLE_ANNO_COMMENT_INPUT:
                if (this.state.selectedAnnoId) {
                    this.setState({annoCommentInputTrigger: this.state.annoCommentInputTrigger+1})
                }
                break
            case keyActions.DELETE_ANNO_IN_CREATION:
                this.deleteAnnoInCreationMode(anno)
                break
            case keyActions.ENTER_ANNO_ADD_MODE:
                if (anno){
                    this.updateSelectedAnno(
                        anno, modes.ADD
                    )
                }
                break
            case keyActions.LEAVE_ANNO_ADD_MODE:
                if (anno){
                    this.updateSelectedAnno(
                        anno, modes.VIEW
                    )
                }
                break
            case keyActions.UNDO:
                this.undo()
                break
            case keyActions.REDO:
                this.redo()
                break
            case keyActions.TRAVERSE_ANNOS:
                this.traverseAnnos()
                break
            case keyActions.CAM_MOVE_LEFT:
                this.moveCamera(camKeyStepSize, 0)
                break
            case keyActions.CAM_MOVE_RIGHT:
                this.moveCamera(-camKeyStepSize, 0)
                break
            case keyActions.CAM_MOVE_UP:
                this.moveCamera(0, camKeyStepSize)
                break
            case keyActions.CAM_MOVE_DOWN:
                this.moveCamera(0, -camKeyStepSize)
                break
            case keyActions.CAM_MOVE_STOP:
                break
            case keyActions.COPY_ANNOTATION:
                this.copyAnnotation()
                break
            case keyActions.PASTE_ANNOTATION:
                this.pasteAnnotation(0)
                break
            case keyActions.RECREATE_ANNO:
                // recreate selected annotation using the anno id
                if(this.state.selectedAnnoId) this.recreateAnnotation(this.state.selectedAnnoId)
                break
            default:
                console.warn('Unknown key action', action)
        }

    }

    onKeyDown(e){
        e.preventDefault()
        this.keyMapper.keyDown(e.key)
        if (this.props.onKeyDown){
            this.props.onKeyDown(e)
        }
    }

    onKeyUp(e){
        e.preventDefault()
        this.keyMapper.keyUp(e.key)
        if (this.props.onKeyUp){
            this.props.onKeyUp(e)
        }
    }

    onMouseMove(e){
        if (this.state.mode === modes.CAMERA_MOVE){
            this.moveCamera(e.movementX, e.movementY)
        }
    }

    onLabelInputDeleteClick(annoId){
        this.removeSelectedAnno()
    }
    
    
    /**
     * Trigger canvas event
     * @param {String} action Action that was performed
     * @param {Object} data Data object of the action
     */
    triggerCanvasEvent(action, data){
        if (this.props.onCanvasEvent){
            this.props.onCanvasEvent(action, data)
        }
    }

    checkAndCorrectAnno(anno){
        // Check if annoation is within image bounds
        const corrected = transformAnnos.correctAnnotation(anno.data, this.state.svg, this.state.imageOffset)
        let newAnno = {...anno, data: corrected}
        const area = transformAnnos.getArea(corrected, this.state.svg, anno.type, this.state.image)
        if (area!==undefined){
            if(area < this.props.canvasConfig.annos.minArea){
                this.handleNotification({
                    title: "Annotation to small",
                    message: 'Annotation area was '+Math.round(area)+'px but needs to be bigger than '+ this.props.canvasConfig.annos.minArea+' px',
                    type: notificationType.WARNING
                })
                // newAnno = {...newAnno, mode: modes.DELETED}
                newAnno = {...newAnno, mode: modes.DELETED}
            }     
        }
        if (!this.checkAnnoLength(anno)){
            newAnno = {...newAnno, mode: modes.DELETED}
        }
        return newAnno
    }

    /**
     * Handle actions that have been performed by an annotation 
     * @param {Number} anno Id of the annotation
     * @param {String} pAction Action that was performed
     */
    handleAnnoEvent(anno, pAction){
        console.log('handleAnnoEvent', pAction, anno)
        let newAnnos = undefined
        let actionHistoryStore = undefined

        switch(pAction){
            case canvasActions.ANNO_ENTER_CREATE_MODE:
                break
            case canvasActions.ANNO_MARK_EXAMPLE:
                newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                this.handleAnnoSaveEvent(pAction, anno)
                break
            case canvasActions.ANNO_SELECTED:
                this.selectAnnotation(anno.id)
                // this.pushHist(
                //     this.state.annos, anno.id,
                //     pAction, this.state.showSingleAnno
                // )    
                break
            case canvasActions.ANNO_START_CREATING:
                newAnnos = this.updateSelectedAnno(anno)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                break
            case canvasActions.ANNO_CREATED:
                actionHistoryStore = [...this.state.imgActions, pAction]
                anno = this.stopAnnotimeMeasure(anno)
                newAnnos = this.updateSelectedAnno({...anno, status:annoStatus.DATABASE}, modes.VIEW)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, undefined
                )
                this.showSingleAnno(undefined)
                this.setState({annoToolBarVisible:true})
                this.handleAnnoSaveEvent(pAction, anno, {imgActions: actionHistoryStore})
                break
            case canvasActions.ANNO_MOVED:
                actionHistoryStore = [...this.state.imgActions, pAction]
                anno = this.stopAnnotimeMeasure(anno)
                newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                this.showSingleAnno(undefined)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, undefined
                )
                this.setState({annoToolBarVisible:true})
                this.handleAnnoSaveEvent(pAction, anno, {imgActions: actionHistoryStore})
                break
            case canvasActions.ANNO_ENTER_MOVE_MODE:
                anno = this.startAnnotimeMeasure(anno)
                this.updateSelectedAnno(anno, modes.MOVE)
                this.showSingleAnno(anno.id)
                this.setState({annoToolBarVisible:false})
                break
            case canvasActions.ANNO_ENTER_EDIT_MODE:
                anno = this.startAnnotimeMeasure(anno)
                this.updateSelectedAnno(anno, modes.EDIT)
                // this.showSingleAnno(anno.id)
                this.setState({annoToolBarVisible:false})
                break
            case canvasActions.ANNO_ADDED_NODE:
                actionHistoryStore = [...this.state.imgActions, pAction]
                newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                this.handleAnnoSaveEvent(pAction, anno, {imgActions: actionHistoryStore})
                break
            case canvasActions.ANNO_REMOVED_NODE:
                actionHistoryStore = [...this.state.imgActions, pAction]
                if (!this.checkAnnoLength(anno)){
                    newAnnos = this.updateSelectedAnno(anno, modes.DELETED)
                    this.showSingleAnno(undefined)
                } else {
                    newAnnos = this.updateSelectedAnno(anno, modes.CREATE)
                }
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                if (anno.status !== annoStatus.NEW){
                    this.handleAnnoSaveEvent(pAction, anno, {imgActions: actionHistoryStore})
                }
                break
            case canvasActions.ANNO_EDITED:
                actionHistoryStore = [...this.state.imgActions, pAction]
                anno = this.stopAnnotimeMeasure(anno)
                newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                this.setState({annoToolBarVisible:true})
                this.handleAnnoSaveEvent(pAction, anno,{imgActions: actionHistoryStore})
                break
            case canvasActions.ANNO_DELETED:
                actionHistoryStore = [...this.state.imgActions, pAction]
                const res = this.updateSelectedAnno(anno, modes.DELETED, true)
                newAnnos = res.newAnnos
                this.selectAnnotation(undefined)
                this.showSingleAnno(undefined)
                this.pushHist(
                    newAnnos, undefined,
                    pAction, this.state.showSingleAnno
                )
                this.handleAnnoSaveEvent(pAction, res.newAnno, {imgActions: actionHistoryStore})
                break
            case canvasActions.ANNO_COMMENT_UPDATE:
                actionHistoryStore = [...this.state.imgActions, pAction]
                const res_comment = this.updateSelectedAnno(anno, modes.VIEW, true)
                newAnnos = res_comment.newAnnos
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                this.handleNotification({
                    title: "Saved comment",
                    message: `Saved comment: ${anno.comment}`,
                    type: notificationType.SUCCESS
                })
                this.handleAnnoSaveEvent(pAction, res_comment.newAnno, {imgActions: actionHistoryStore})
                break
            case canvasActions.ANNO_LABEL_UPDATE:
                actionHistoryStore = [...this.state.imgActions, pAction]
                anno = this.stopAnnotimeMeasure(anno)
                anno = this.checkAndCorrectAnno(anno)
                console.log('ANNO_LABEL_UPDATE aftercheckAndCorrect', anno)
                // this.updateSelectedAnno(anno, anno.mode)
                if (anno.mode === modes.DELETED){
                    this.updateSelectedAnno(anno, modes.DELETED)
                } else {
                    this.updateSelectedAnno({...anno, status:annoStatus.DATABASE}, modes.VIEW)
                }
                // if (!this.checkAnnoLength(anno)){
                //     newAnnos = this.updateSelectedAnno(anno, modes.DELETED)
                // } else {
                //     newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                // }
                this.setState({annoToolBarVisible:true})
                if (anno.mode !== modes.DELETED){
                    this.pushHist(
                        newAnnos, anno.id,
                        pAction, undefined
                    )
                    this.handleAnnoSaveEvent(pAction, anno, {imgActions: actionHistoryStore})
                }
                break
            case canvasActions.ANNO_CREATED_NODE:
                actionHistoryStore = [...this.state.imgActions, pAction]
                anno = this.stopAnnotimeMeasure(anno)
                newAnnos = this.updateSelectedAnno(anno, modes.CREATE)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                break
            case canvasActions.ANNO_CREATED_FINAL_NODE:
                actionHistoryStore = [...this.state.imgActions, pAction]
                anno = this.stopAnnotimeMeasure(anno)
                newAnnos = this.updateSelectedAnno({...anno, status:annoStatus.DATABASE}, modes.VIEW)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, undefined
                )
                this.showSingleAnno(undefined)
                this.setState({annoToolBarVisible:true})
                this.handleAnnoSaveEvent(pAction, anno, {imgActions: actionHistoryStore})
                break
            default:
                console.warn('Action not handled', pAction)
                break
        }
        if (actionHistoryStore){
            this.setState({imgActions: actionHistoryStore})
        }
        if (this.props.onAnnoEvent){
            this.props.onAnnoEvent(anno, newAnnos, pAction)
        }
    }

    handleAnnoSaveEvent(action, anno, img){
        const imgData = {...img,
            imgId: this.props.imageMeta.id,
            annoTime: this.props.imageMeta.annoTime + (performance.now() - this.state.imgLoadTimestamp)/1000
        }
        let backendAnno = undefined
        if (anno){
            let myAnno = this.addDelayedBackendUpdate(anno, action)
            if (!myAnno) return
            if (myAnno.id in this.tempIdMap) {
                myAnno = {...myAnno, id: this.tempIdMap[myAnno.id]}
            }
            backendAnno = annoConversion.canvasToBackendSingleAnno(myAnno, this.state.svg, 
                            false, this.state.imageOffset)
        }
        const saveData = {
            anno: backendAnno,
            img: imgData,
            action
            }
        if (this.props.onAnnoSaveEvent){
            this.props.onAnnoSaveEvent(saveData)
        }
    }

    onAnnoLabelInputUpdate(anno){
        this.updateSelectedAnno(anno)
    }

    onAnnoLabelInputClose(){
        this.svg.current.focus()
        this.showLabelInput(false)
        this.showSingleAnno(undefined)
        const anno = this.findAnno(this.state.selectedAnnoId)
        this.handleAnnoEvent(anno, canvasActions.ANNO_LABEL_UPDATE)
    }

    handleImgBarClose(){
        this.triggerCanvasEvent(canvasActions.CANVAS_IMGBAR_CLOSE)
    }

    gotNewLabel(label){
        let ret = false
        if (label.length === 0) {
            if (this.state.imgLabelIds.length !== 0) {
                return true
            } else {
                return false
            }
        }
        label.forEach(e => {
            if (!this.state.imgLabelIds.includes(e)) ret = true
        })
        return ret
    }

    handleImgLabelUpdate(label){
        if (this.gotNewLabel(label)){
            const imgActions = [...this.state.imgActions, canvasActions.IMG_LABEL_UPDATE]
            console.log('gotNewLabel', label)
            this.setState({
                imgLabelIds: label,
                imgLabelChanged: true,
                imgActions: imgActions,
            })
            this.pushHist(this.state.annos,
                this.state.selectedAnnoId,
                canvasActions.IMG_LABEL_UPDATE,
                this.state.showSingleAnno,
                label
            )
            const imgData = {
                imgLabelIds: label,
                imgLabelChanged: true,
                imgActions: imgActions,
            }
            this.handleAnnoSaveEvent(canvasActions.IMG_LABEL_UPDATE, undefined, imgData)
        }
    }

    handleCanvasClick(e){
        if (this.props.uiConfig.imgBarVisible){
            this.setState({imgBarVisible:true})
        }
    }

    handleImgBarMouseEnter(e){
        this.setState({imgBarVisible:false})
    }

    handleImgLabelInputClose(){
        this.triggerCanvasEvent(canvasActions.CANVAS_LABEL_INPUT_CLOSE)
    }

    handleSvgMouseMove(e){
        this.mousePosAbs = mouse.getMousePositionAbs(e, this.state.svg)
    }

    handleNotification(messageObj){
        if (this.props.onNotification){
            this.props.onNotification(messageObj)
        }
    }

    handleHideLbl(lbl, hide){
        let hiddenSelected = false
        const newAnnos = this.state.annos.map(anno => {
            const newAnno = {...anno}
            if (anno.labelIds.includes(lbl.id)){
                newAnno.visible = !hide
                if (anno.id === this.state.selectedAnnoId) hiddenSelected=true
            } else if (anno.labelIds.length === 0){ // no label case
                if (lbl.id === -1){ // -1 indicates no label
                    newAnno.visible = !hide
                    if (anno.id === this.state.selectedAnnoId) hiddenSelected=true
                }
            }
            return newAnno
        })
        this.setState({annos: newAnnos})
        if (hiddenSelected){
            this.selectAnnotation(undefined)
        }
    }

    handleMarkExample(anno){
        const newAnno = {...anno}
        if (newAnno.isExample == undefined){
           newAnno.isExample = true 
        } else if (newAnno.isExample){
            newAnno.isExample = false
        } else {
            newAnno.isExample = true
        }
        this.handleAnnoEvent(newAnno, canvasActions.ANNO_MARK_EXAMPLE)

    }

    /*************
     * LOGIC     *
    **************/
    copyAnnotation(){
        this.clipboard =  this.findAnno(this.state.selectedAnnoId)
        this.handleNotification({
            title: "Copyed annotation to clipboard",
            message: 'Copyed '+this.clipboard.type,
            type: notificationType.SUCCESS
        })
    }

    pasteAnnotation(offset=0){
                // const corrected = transform.correctAnnotation(anno.data, this.props.svg, this.props.imageOffset)
        if (this.clipboard){
            // let annos = [...this.state.annos]
            const uid = _.uniqueId('new')
            // this.handleAnnoEvent()
            const newData = this.clipboard.data.map(e => {
                    return {x: e.x+offset, y: e.y+offset}
                })
            const newAnno ={
                ...this.clipboard,
                id: uid,
                annoTime: 0,
                status: annoStatus.NEW,
                mode: modes.VIEW,
                data: transformAnnos.correctAnnotation(newData, this.state.svg, this.state.imageOffset)
            } 
            // annos.push(newAnno)
            // this.setState({annos: annos, selectedAnnoId: uid})
            this.handleNotification({
                title: "Pasted annotation to canvas",
                message: 'Pasted and selected '+this.clipboard.type,
                type: notificationType.SUCCESS
            })
            this.handleAnnoEvent(newAnno, canvasActions.ANNO_CREATED)
            // this.handleAnnoSaveEvent(canvasActions.ANNO_CREATED, newAnno)
        }
    }


    checkAnnoLength(anno){
        if (anno.type === 'polygon' && anno.data.length < 3){
            this.handleNotification({
                title: "Invalid polygon!",
                message: 'A vaild polygon needs at least 3 points!',
                type: notificationType.WARNING
            })
            return false
        } 
        return true
    }

    startAnnotimeMeasure(anno){
        anno.timestamp = performance.now()
        return anno
    }
    
    stopAnnotimeMeasure(anno){
        if (anno.timestamp === undefined){
            console.warn('No timestamp for annotime measurement. Check if you started measurement', anno)
        } else {
            let now = performance.now()
            anno.annoTime += (now - anno.timestamp) / 1000
            anno.timestamp = now
            return anno
        }
        return anno
    }

    updatePossibleLabels(){
        if (!this.props.possibleLabels) return
        if (this.props.possibleLabels.length <= 0) return
        let lbls = this.props.possibleLabels
        lbls = lbls.map(e => {
            if (!('color' in e)){
                return {
                    ...e, color: colorlut.getColor(e.id)}
            } else {
                return {...e}
            }
        })
        this.setState({
            possibleLabels: [...lbls]
        })
    }

    editAnnoLabel(anno){
        if (this.state.selectedAnnoId){
            let myAnno
            if (anno === undefined){
                myAnno = this.findAnno(this.state.selectedAnnoId)
            } else {
                myAnno = {...anno}
            }
            myAnno = this.startAnnotimeMeasure(myAnno)
            this.showLabelInput()
            this.updateSelectedAnno(myAnno, modes.EDIT_LABEL)
        }
    }
    unloadImage(){
        console.log('unloadImage', this.state, this.props.imageMeta)
        if(this.state.imageLoaded){
            this.setState({imageLoaded:false})
        }
        this.handleAnnoSaveEvent(canvasActions.IMG_ANNO_TIME_UPDATE, undefined, undefined)
    }
    /**
     * Find a annotation by id in current state
     * 
     * @param {int} annoId - Id of the annotation to find
     */
    findAnno(annoId){
        return this.state.annos.find(e => {
            return e.id === annoId
        })
    }

    findAnnoRef(annoId){
        if (this.state.selectedAnnoId === undefined) return undefined
        return this.annoRefs.find(e => {
            if (e.current){
                return e.current.isSelected()
            } else {
                return false
            }
        })
    }

    pushHist(annos, selectedAnnoId, pAction, showSingleAnno, imgLabelIds=this.state.imgLabelIds){
        this.hist.push({
            ...this.getAnnos(annos, false),
            selectedAnnoId: selectedAnnoId,
            showSingleAnno: showSingleAnno,
            imgLabelIds: imgLabelIds
        }, pAction)
        console.log('hist', this.hist)
    }

    undo(){
        if (!this.hist.isEmpty()){
            const cState = this.hist.undo()
            console.log('hist', this.hist)
            this.setCanvasState(
                cState.entry.annotations,
                cState.entry.imgLabelIds, 
                cState.entry.selectedAnnoId,
                cState.entry.showSingleAnno)
        }
    }

    redo(){
        if (!this.hist.isEmpty()){
            const cState = this.hist.redo()
            console.log('hist', this.hist)
            this.setCanvasState(
                cState.entry.annotations,
                cState.entry.imgLabelIds, 
                cState.entry.selectedAnnoId,
                cState.entry.showSingleAnno
            )
        }
    }

    deleteAnnotation(anno) {
        if (anno){
            if (anno.mode === modes.CREATE){
                const ar = this.findAnnoRef(this.state.selectedAnnoId)
                if (ar !== undefined) ar.current.myAnno.current.removeLastNode()
    
            } else {
                this.handleAnnoEvent(anno, canvasActions.ANNO_DELETED)
            }
        }
    }

    deleteAnnoInCreationMode(anno) {
        if (anno){
            if (anno.mode === modes.CREATE){
                this.handleAnnoEvent(anno, canvasActions.ANNO_DELETED)
            } else {
            }
        }
    }

    deleteAllAnnos(){
        let newAnnos = []
        this.state.annos.forEach( e => {
            if ((typeof e.id) !== "string"){
                const anno = {...e, status: annoStatus.DELETED}
                this.handleAnnoEvent(anno, canvasActions.ANNO_DELETED)
            }
        })
        this.selectAnnotation(undefined)
        this.showSingleAnno(undefined)
    }

    /**
     * Set state of Canvas annotations and imageLabels.
     * 
     * @param {list} annotations - Annotations in backend format
     * @param {list} imgLabelIds - IDs of the image labels
     * @param {object} selectedAnno - The selected annotation
     * @param {int} showSingleAnno - The id of the single annotation
     *      that should be visible
     */
    setCanvasState(annotations, imgLabelIds, selectedAnnoId, showSingleAnno){
        this.updateCanvasView({...annotations})
        this.setImageLabels([...imgLabelIds])
        this.selectAnnotation(selectedAnnoId)
        this.setState({showSingleAnno: showSingleAnno})
    }

    isLocked(annoId){
        if (this.props.lockedAnnos){
            if (this.props.lockedAnnos.includes(annoId)){
                return true
            }
        }
        return false
    }

    selectAnnotation(annoId){
        if (this.isLocked(annoId)) {
            this.handleNotification({
                title: "Annotation locked",
                message: `Annotation with id ${annoId} is locked and can not be edited`,
                type: notificationType.WARNING
            })
            return
        } 
        if (annoId){
            const anno = this.findAnno(annoId)
            this.setState({
                selectedAnnoId: annoId
            })
            if (anno){
                if (anno.mode !== modes.CREATE){
                    this.setState({
                        annoToolBarVisible: true
                    })
                }
            }
        } else {
            this.setState({
                selectedAnnoId: undefined,
                annoToolBarVisible: false
            })
            if (this.state.showLabelInput){
                this.onAnnoLabelInputClose()
            }
        }
    }

    /**
     * Traverse annotations by key hit
     */
    traverseAnnos(){
        if (this.state.annos.length > 0){
            const myAnnos = this.state.annos.filter(e => {
                return e.status !== annoStatus.DELETED && !this.isLocked(e.id) && !(e.visible === false)
            })
            if (myAnnos.length > 0){
                if (!this.state.selectedAnnoId){
                    this.selectAnnotation(myAnnos[0].id)
                } else {
                    let currentIdx = myAnnos.findIndex( e => {
                        return e.id === this.state.selectedAnnoId
                    })
                    if (currentIdx+1 < myAnnos.length){
                        this.selectAnnotation(myAnnos[currentIdx+1].id)
                    } else {
                        this.selectAnnotation(myAnnos[0].id)
                    }
                }
            }
        }
    } 

    getAnnos(annos=undefined, removeFrontedIds=true){
        const myAnnos = annos ? annos : this.state.annos
        // const backendFormat = this.getAnnoBackendFormat(removeFrontedIds, myAnnos)
        const backendFormat = annoConversion.canvasToBackendAnnos(myAnnos, 
            this.state.svg, removeFrontedIds, this.state.imageOffset)
        const finalData = {
            imgId: this.props.imageMeta.id,
            imgLabelIds: this.state.imgLabelIds,
            imgLabelChanged: this.state.imgLabelChanged,
            imgActions: this.state.imgActions,
            annotations: backendFormat,
            isJunk: this.state.isJunk,
            annoTime: this.props.imageMeta.annoTime + (performance.now() - this.state.imgLoadTimestamp)/1000
        }
        return finalData
    }

    /**
     * Reset zoom level on Canvas
     */
    resetZoom(){
        this.setState({svg: {
            ...this.state.svg,
            translateX: 0,
            translateY: 0,
            scale: 1.0
        }})
    }

    moveCamera(movementX, movementY){
        let trans_x = this.state.svg.translateX + movementX / this.state.svg.scale
        let trans_y = this.state.svg.translateY + movementY / this.state.svg.scale
        const vXMin = this.state.svg.width * 0.25
        const vXMax = this.state.svg.width * 0.75
        const yXMin = this.state.svg.height * 0.25
        const yXMax = this.state.svg.height * 0.75
        const vLeft = wv.getViewportCoordinates({x:0, y:0}, this.state.svg)
        const vRight = wv.getViewportCoordinates({x:this.state.svg.width, y:this.state.svg.height}, this.state.svg)
        if (vLeft.vX >= vXMin){
            trans_x = this.state.svg.translateX - 5
        } else if (vRight.vX <= vXMax){
            trans_x = this.state.svg.translateX +5
        } 
        if (vLeft.vY >= yXMin){
            trans_y = this.state.svg.translateY - 5
        } else if (vRight.vY <= yXMax){
            trans_y= this.state.svg.translateY +5
        }             
        this.setState({svg: {
            ...this.state.svg,
            translateX: trans_x,
            translateY: trans_y
        }})
    }

    setMode(mode){
        if (this.state.mode !== mode){
            this.setState({mode: mode})
        }
    }
    
    getMousePosition(e){
        const absPos = this.getMousePositionAbs(e)
        return {
            x: (absPos.x )/this.state.svg.scale - this.state.svg.translateX,
            y: (absPos.y )/this.state.svg.scale - this.state.svg.translateY
        }
    }

    getMousePositionAbs(e){
        return {
            x: (e.pageX - this.svg.current.getBoundingClientRect().left),
            y: (e.pageY - this.svg.current.getBoundingClientRect().top)
        }
    }

    showLabelInput(visible=true){
        this.setState({
            showLabelInput: visible
        })
        if (visible){
            this.showSingleAnno(this.state.selectedAnnoId)
        }
    }

    createNewAnnotation(e){
        //Do not create new Annotation if controlKey was pressed!
        let allowed = false
        if (this.keyMapper.controlDown) return
        if (this.props.selectedTool){
            const maxAnnos = this.props.canvasConfig.annos.maxAnnos
            if (maxAnnos){
                if (this.state.annos.length < maxAnnos){
                    allowed = true
                } else {
                    console.warn('Maximum number of annotations reached! MaxAnnos:', maxAnnos)
                    this.handleNotification({
                        title: 'Maximum number of annotations reached!',
                        message: `Only ${maxAnnos} annotations per image are allowed by config` ,
                        type: notificationType.WARNING
                    })
                }
            } else {
                allowed = true
            }
        } else {
            console.warn('No annotation tool selected!')
            this.handleNotification({
                title: 'No tool selected!',
                message: 'Please select an annotation tool in the toolbar.',
                type: notificationType.INFO
            })
        }
        if (allowed){
            const mousePos = this.getMousePosition(e)
            // const selAnno = this.findAnno(this.state.selectedAnnoId)
            let newAnno = {
                id: this.props.nextAnnoId ? this.props.nextAnnoId : _.uniqueId('new'),
                type: this.props.selectedTool,
                data: [{
                    x: mousePos.x, 
                    y: mousePos.y
                },{
                    x: mousePos.x,
                    y: mousePos.y
                }],
                mode: modes.CREATE,
                status: annoStatus.NEW,
                labelIds: this.state.prevLabel,
                selectedNode: 1,
                annoTime: 0.0
            }
            newAnno = this.startAnnotimeMeasure(newAnno)
            this.setState({
                annos: [...this.state.annos, newAnno],
                selectedAnnoId: newAnno.id,
                showSingleAnno: newAnno.id,
                annoToolBarVisible: false
            })
            if (this.props.selectedTool !== TOOLS.BBOX && 
                this.props.selectedTool !== TOOLS.POINT){    
                const merged = this.mergeSelectedAnno(newAnno)
                this.pushHist(
                    merged.newAnnos,
                    newAnno.id, 
                    canvasActions.ANNO_CREATED_NODE,
                    newAnno.id
                )
            }
            this.handleAnnoEvent(newAnno, canvasActions.ANNO_ENTER_CREATE_MODE)
        }
    }

    /**
     * recreate an existing annotation in case the creation process was not finished
     * @param {string} id of annotation
     */
    recreateAnnotation(annoID) {
        console.log('AnnoSave -> recreateAnnotation ', annoID)

        let annos = this.state.annos

        // search for id of selected anno in all annos (should normally be last item in list, but to be sure)
        let annoIndex
        let anno
        
        for(var k in annos) if(annos[k].id == annoID) {
            annoIndex = k
            anno = annos[k]
            break
        }

        // editing is only allowed on line and polygon
        if(!['line', 'polygon'].includes(anno.type)) return console.log("Cant recreate annotation: Type " +  anno.type + " is forbidden")

        // remove the old annotation
        this.state.annos.splice(annoIndex, 1)

        // create a new annotation based on the datapoints of the old annotation
        let newAnno = {
            id: anno.id,
            type: anno.type,
            data: anno.data,
            mode: modes.CREATE,
            status: (anno.status === 'database' || anno.status === 'changed' ? annoStatus.CHANGED : annoStatus.NEW),
            labelIds: anno.labelIds,
            selectedNode: anno.data.length - 1,
            annoTime: anno.annoTime
        }

        newAnno = this.startAnnotimeMeasure(newAnno)
        this.setState({
            annos: [...this.state.annos, newAnno],
            selectedAnnoId: newAnno.id,
            showSingleAnno: newAnno.id,
            annoToolBarVisible: false
        })

        console.log("Annotation recreated")
        this.handleAnnoEvent(newAnno, canvasActions.ANNO_ENTER_CREATE_MODE)
    }

    putSelectedOnTop(prevState){
        // The selected annotation need to be rendered as last one in 
        // oder to be above all other annotations.
        if (this.state.selectedAnnoId){
            if (prevState.selectedAnnoId !== this.state.selectedAnnoId){
                const annos = this.state.annos.filter( (el) => {
                    return el.id !== this.state.selectedAnnoId
                })
                const lastAnno = this.state.annos.find( el => {
                    return el.id === this.state.selectedAnnoId
                })
                annos.push(lastAnno)
                this.setState({annos: [
                    ...annos
                ]})
            }
        }
    }

    getLabel(lblId){
        return this.state.possibleLabels.find( e => {
            return e.id === lblId
        })
    }

    getAnnoColor(){
        if (this.state.selectedAnnoId){
            const anno = this.findAnno(this.state.selectedAnnoId)
            if (anno){
                if (anno.labelIds.length > 0){
                    return this.getLabel(anno.labelIds[0]).color
                }
            } 
        }
        return colorlut.getDefaultColor()
    }

    updateDelayedBackendUpdates(tempId, dbId){
        console.log('updateDelayedBackendUpdates ', tempId, dbId, this.delayedBackendUpdates)
        if (tempId !== dbId) this.tempIdMap[tempId] = dbId
        if (tempId in this.delayedBackendUpdates){
            if (this.delayedBackendUpdates[tempId] !== null){
                const {anno, action} = this.delayedBackendUpdates[tempId]
                const myAnno = {...anno, 
                    status: anno.status === annoStatus.NEW ? annoStatus.CHANGED : anno.status}
                delete this.delayedBackendUpdates[tempId]
                console.log('PerformDelayedBackendUpdate', action, myAnno)
                this.handleAnnoSaveEvent(action, myAnno)
            } else {
                delete this.delayedBackendUpdates[tempId]
            } 
        }
    }

    addDelayedBackendUpdate(anno, action){
        // take care of tempIds while receiving a dbId from backend.
        // handling tempIds is only required if instant anno backend update is 
        // used.
        if (this.props.onAnnoSaveEvent){
            if ((typeof anno.id) === "string"){
                if (!(anno.id in this.tempIdMap)){
                    let myAnno = undefined
                    if (anno.id in this.delayedBackendUpdates){
                        this.delayedBackendUpdates[anno.id] = {anno, action}
                    } else {
                        this.delayedBackendUpdates[anno.id] = null
                        myAnno = anno
                    }
                    console.log('addDelayedBackendUpdate ', myAnno, action, anno, this.delayedBackendUpdates)
                    return myAnno
                } 
            }
            // else if ((typeof anno.id) === "string"){
            //     this.delayedBackendUpdates[anno.id] = {anno, action}
            // }
        } else {
            console.error('onAnnoSaveEvent needs to be provided in order to use SIA Canvas in a correct war!')
        }
        return anno
    }

    updateAnnoBySaveResponse(res){
        if (!res) return
        if (res.tempId !== res.dbId){
            //TODO: Replace tempId with dbId in undo/redo hist
            const anno = this.findAnno(res.tempId)
            if (!anno) return
            // anno.id = res.dbId
            // anno.status = annoStatus.DATABASE
            //TODO: Should not update if the anno is currently in edit or move mode
            // this.updateAnno(anno)
            // if (this.state.selectedAnnoId === res.tempId) this.setState({selectedAnnoId: res.dbId}) 
            this.updateDelayedBackendUpdates(res.tempId, res.dbId)
        } 
        // else {
        //     const anno = this.findAnno(res.dbId)
        //     if (!anno) return
        //     anno.status = res.newStatus
        //     // this.updateAnno(anno)
        // }
    }

    /**
     * Update selected anno and override mode if desired
     * 
     * @param {object} anno - The new annotation that becomes the selected anno
     * @param {string} mode - The new mode for the selected anno
     * @returns The new anno that was set as selectedAnno in state and 
     *      the new annos list that was set in state
     */
    updateSelectedAnno(anno, mode=undefined, returnNewAnno=false){
        if (!anno) return
        const {newAnnos, newAnno} = this.mergeSelectedAnno(anno, mode)
        this.setState({
            annos: newAnnos,
            selectedAnnoId: anno.id,
            prevLabel: anno.labelIds, 
        })
        if (returnNewAnno){
            return {newAnnos, newAnno}
        } else {
            return newAnnos
        }
    }

    updateAnno(anno, mode=undefined, returnNewAnno=false){
        if (!anno) return
        const {newAnnos, newAnno} = this.mergeSelectedAnno(anno, mode)
        this.setState({
            annos: newAnnos
        })
        if (returnNewAnno){
            return {newAnnos, newAnno}
        } else {
            return newAnnos
        }
    }

    mergeSelectedAnno(anno, mode=undefined){
        let filtered = this.state.annos.filter( (el) => {
            return el.id !== anno.id
        }) 
        filtered = filtered.map(e => {return {...e, mode:modes.VIEW}})
        let newAnno
        if (mode){
            newAnno = {...anno, mode:mode}
            if (mode === modes.DELETED){
                if (anno.status !== annoStatus.NEW){
                    newAnno = {
                        ...newAnno,
                        status: annoStatus.DELETED
                    }
                } else {
                    newAnno = null
                }
            } else {
                newAnno = {
                    ...newAnno,
                    status: anno.status !== annoStatus.NEW ? annoStatus.CHANGED : annoStatus.NEW
                }
            }
        } else {
            newAnno = {...anno}
        }
        if (newAnno !== null){
            filtered.push(newAnno)
        }
        const newAnnos = [...filtered]
        return {newAnnos, newAnno}
    }

    showSingleAnno(annoId){
        if (this.state.showSingleAnno !== annoId){
            this.setState({showSingleAnno: annoId})
        } 
    }

    updateImageSize(){
        
        var container = this.props.container.current.getBoundingClientRect()
        var clientHeight = document.documentElement.clientHeight
        var canvasTop
        var canvasLeft
        var maxImgHeight
        var maxImgWidth 
        const layoutOffset = this.props.uiConfig.layoutOffset
        if(layoutOffset){
            canvasTop = container.top + layoutOffset.top
            canvasLeft = container.left + layoutOffset.left
            maxImgHeight = clientHeight - container.top - layoutOffset.bottom - layoutOffset.top
            maxImgWidth = container.right -canvasLeft - layoutOffset.right
        } else {
            canvasTop = container.top
            canvasLeft = container.left
            maxImgHeight = clientHeight - container.top
            maxImgWidth = container.right -canvasLeft
        }
        var ratio = this.img.current.naturalWidth / this.img.current.naturalHeight
        var imgWidth = "100%"
        var imgHeight = "100%"
        if (maxImgHeight * ratio > maxImgWidth){
            imgWidth = maxImgWidth
            imgHeight = maxImgWidth / ratio
        } else {
            imgWidth = maxImgHeight * ratio
            imgHeight = maxImgHeight
        }
        var svg 
        const imgOffset = {x: 0, y:0}
        if (this.props.uiConfig.maxCanvas){
            imgOffset.x = (maxImgWidth - imgWidth)/2
            imgOffset.y = (maxImgHeight - imgHeight)/2
            console.log(`imgOffset: `, imgOffset)
            svg = {
                ...this.state.svg, width: maxImgWidth, height: maxImgHeight,
                left: canvasLeft, top: canvasTop
            }
        } else {
            if (this.props.uiConfig.centerCanvasInContainer){
                const resSpaceX = maxImgWidth - imgWidth
                if (resSpaceX > 2){
                    canvasLeft = canvasLeft + resSpaceX / 2
                }
                const resSpaceY = maxImgHeight - imgHeight
                if (resSpaceY > 2){
                    canvasTop = canvasTop + resSpaceY / 2
                }
            }
            svg = {
                ...this.state.svg, width : imgWidth, height: imgHeight,
                left: canvasLeft, top: canvasTop
            }
        }
        this.setState({
            svg,
            image:{
                width: this.img.current.naturalWidth,
                height: this.img.current.naturalHeight,
            },
            imageOffset: imgOffset
        })
        this.svgUpdate(svg)
        return {imgWidth, imgHeight, imgOffset}
    }

    svgUpdate(svg){
        this.triggerCanvasEvent(canvasActions.CANVAS_SVG_UPDATE, svg)
    }

    setImageLabels(labelIds){
        if (labelIds !== this.state.imgLabelIds){
            this.setState({
                imgLabelIds: labelIds
            })
        }
    }

    updateCanvasView(annotations){
        

        var annos = []
        //Annotation data should be present and a pixel accurate value 
        //for svg should be calculated
        if(annotations){
            const imgSize = this.updateImageSize()
            this.setState({annos: [...annoConversion.backendAnnosToCanvas(annotations, {width: imgSize.imgWidth, height:imgSize.imgHeight}, imgSize.imgOffset)]})
        }
    }

    renderAnnotations(){
        // Do not render annotations while moving the camera!
        if (this.state.mode !== modes.CAMERA_MOVE){
            this.annoRefs = []
            const annos =  this.state.annos.map((el) => {
                this.annoRefs.push(React.createRef())
                return <Annotation type={el.type} 
                        data={el} key={el.id} svg={{...this.state.svg}}
                        imageOffset={this.state.imageOffset}
                        ref={this.annoRefs[this.annoRefs.length - 1]}
                        onMouseDown={e => this.onAnnoMouseDown(e)}
                        onAction={(anno, pAction) => this.handleAnnoEvent(anno, pAction)}
                        selectedAnno={this.state.selectedAnnoId}
                        // onModeChange={(anno) => this.onAnnoModeChange(anno)}
                        showSingleAnno={this.state.showSingleAnno}
                        uiConfig={this.props.uiConfig}
                        allowedActions={this.props.canvasConfig.annos.actions}
                        possibleLabels={this.state.possibleLabels}
                        image={this.state.image}
                        canvasConfig={this.props.canvasConfig}
                        onNotification={(messageObj) => this.handleNotification(messageObj) }
                        defaultLabel={this.props.defaultLabel}
                    />
            })
            return <g>{annos}</g>
        } else {
            return null
        }
        
    }

    renderImgLabelInput(){
        if (!this.props.imageMeta) return null
        return <Prompt 
            onClick={() => this.handleImgLabelInputClose()}
            active={this.props.uiConfig.imgLabelInputVisible}
            header={<div>
                Add label for the whole image
            </div>}
            content={<div>
                <LabelInput
                    // multilabels={true}
                    multilabels={this.props.canvasConfig.img.multilabels}
                    // relatedId={this.props.annos.image.id}
                    visible={true}
                    onLabelUpdate={label => this.handleImgLabelUpdate(label)}
                    possibleLabels={this.state.possibleLabels}
                    initLabelIds={this.state.imgLabelIds}
                    relatedId={this.props.imageMeta.id}
                    defaultLabel={this.props.defaultLabel}
                    // onLabelConfirmed = {label => this.handleImgLabelUpdate(label)}
                    // disabled={!this.props.allowedActions.label}
                    // renderPopup
                />
                <Button basic color="green" inverted
                    onClick={() => this.handleImgLabelInputClose()}
                >
                    <Icon name='check'></Icon>
                    OK
                </Button>
            </div>}
        />
    }

    renderAnnoToolBar(selectedAnno){
        let visible = this.state.annoToolBarVisible
        if (this.state.mode === modes.CAMERA_MOVE) visible = false
        return <AnnoToolBar visible={visible} 
            selectedAnno={selectedAnno}
            svg={this.state.svg}
            onClick={() => this.editAnnoLabel()}
            color={this.getAnnoColor()}
        />
    }

    renderAnnoLabelInpput(selectedAnno){
        let visible = this.state.showLabelInput
        if (this.state.mode === modes.CAMERA_MOVE) visible = false
        return <AnnoLabelInput svg={this.state.svg} 
            // svgRef={this.svg}
            onClose={() => this.onAnnoLabelInputClose()}
            onDeleteClick={annoId => this.onLabelInputDeleteClick(annoId)}
            selectedAnno={selectedAnno}
            visible={visible}
            onLabelUpdate={anno => this.onAnnoLabelInputUpdate(anno)}
            possibleLabels={this.state.possibleLabels}
            allowedActions={this.props.canvasConfig.annos.actions}
            multilabels={this.props.canvasConfig.annos.multilabels}
            mousePos={this.mousePosAbs}
            defaultLabel={this.props.defaultLabel}
        />
    }

    render(){
        const selectedAnno = this.findAnno(this.state.selectedAnnoId)
        return(
            <div ref={this.container} >
            <div height={this.state.svg.height} 
            style={{position: 'fixed', top: this.state.svg.top, left: this.state.svg.left}}
            >
            {/* {this.renderAnnoCommentInput(selectedAnno)} */}
            {this.renderImgLabelInput()}
            <ImgBar container={this.container} 
                visible={this.state.imgBarVisible}
                possibleLabels={this.state.possibleLabels}
                annos={this.props.annos}
                svg={this.state.svg}
                imageMeta={this.props.imageMeta}
                onClose={() => this.handleImgBarClose()}
                imgLabelIds={this.state.imgLabelIds}
                // onLabelUpdate={label => this.handleImgLabelUpdate(label)}
                // imgLabelIds={this.state.imgLabelIds}
                // multilabels={this.props.canvasConfig.img.multilabels}
                // allowedActions={this.props.canvasConfig.img.actions}
                onMouseEnter={e => this.handleImgBarMouseEnter(e)}
            />
            <Dimmer active={!this.state.imageLoaded||this.props.blocked}><Loader>Loading</Loader></Dimmer>
            <Dimmer active={this.state.isJunk}>
                <Header as='h2' icon inverted>
                    <Icon name='ban' />
                    Marked as Junk
                </Header>
            </Dimmer>
                {this.renderAnnoToolBar(selectedAnno)}
                {/* <div style={{position: 'fixed', top: this.props.container.top, left: this.props.container.left}}> */}
                {this.renderAnnoLabelInpput(selectedAnno)}
                <InfoBoxes container={this.props.container} 
                    layoutUpdate={this.props.layoutUpdate} 
                    annos={this.state.annos}
                    selectedAnno={selectedAnno}
                    possibleLabels={this.state.possibleLabels}
                    allowedToMarkExample={this.props.canvasConfig.allowedToMarkExample}
                    uiConfig={this.props.uiConfig}
                    imgLoadCount={this.state.imgLoadCount}
                    onCommentUpdate={comment => this.updateAnnoComment(comment)}
                    onUiConfigUpdate={e => this.triggerCanvasEvent(canvasActions.CANVAS_UI_CONFIG_UPDATE, e)}
                    onHideLbl={(lbl, hide) => this.handleHideLbl(lbl, hide)}
                    onMarkExample={anno => this.handleMarkExample(anno)}
                    commentInputTrigger={this.state.annoCommentInputTrigger}
                    onGetAnnoExample={(exampleArgs) => this.props.onGetAnnoExample ? this.props.onGetAnnoExample(exampleArgs):{} }
                    exampleImg={this.props.exampleImg}
                />
                <svg ref={this.svg} width={this.state.svg.width} 
                    height={this.state.svg.height}
                    onKeyDown={e => this.onKeyDown(e)}
                    onKeyUp={e => this.onKeyUp(e)}
                    onClick={e => this.handleCanvasClick(e)}
                    onMouseMove={e => this.handleSvgMouseMove(e)}
                    tabIndex="0"
                    >
                    <g 
                        transform={`scale(${this.state.svg.scale}) translate(${this.state.svg.translateX}, ${this.state.svg.translateY})`}
                        onMouseOver={() => {this.onMouseOver()}}
                        onMouseLeave={() => {this.onMouseLeave()}}
                        // onMouseEnter={() => this.svg.current.focus()}
                        onMouseUp={(e) => {this.onMouseUp(e)}}
                        onWheel={(e) => this.onWheel(e)}
                        onMouseMove={(e) => {this.onMouseMove(e)}}
                    >
                        <image
                            onContextMenu={(e) => this.onRightClick(e)}
                            onMouseDown={(e) => this.onMouseDown(e)}
                            href={this.props.imageBlob} 
                            width={this.state.svg.width} 
                            height={this.state.svg.height}
                        />
                        {this.renderAnnotations()}
                    </g>
                </svg>
                <img 
                    alt='sia' style={{display:'none'}} ref={this.img} 
                    onLoad={() => {this.onImageLoad()}} src={this.state.imageBlob}
                    width="100%" height="100%"
                />
                </div>
                {/* Placeholder for Layout*/}
                <div style={{minHeight: this.state.svg.height}}></div> 
            </div>)
    }
}

export default Canvas