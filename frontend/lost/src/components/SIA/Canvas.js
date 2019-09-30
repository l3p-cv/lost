import React, {Component} from 'react'
import _ from 'lodash'
import Annotation from './Annotation/Annotation'
import AnnoLabelInput from './AnnoLabelInput'
import ImgBar from './ImgBar'
import Prompt from './Prompt'
import LabelInput from './LabelInput'
import AnnoToolBar from './AnnoToolBar'


import * as transform from './utils/transform'
import * as keyActions from './utils/keyActions'
import KeyMapper from './utils/keyActions'
import * as TOOLS from './types/tools'
import * as modes from './types/modes'
import UndoRedo from './utils/hist'
import * as annoStatus from './types/annoStatus'
import * as canvasActions from './types/canvasActions'
import { Loader, Dimmer, Icon, Header, Button } from 'semantic-ui-react';
import * as mouse from './utils/mouse';

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
 *              url: string, 
 *              number: int, 
 *              amount: int, 
 *              isFirst: bool, 
 *              isLast: bool
 *          },
 *          annotations: {
 *              bBoxes: [{
 *                  id: int,
 *                  labelIds: list of int,
 *                  data: {}
 *              },...],
 *              points: []
 *              lines: []
 *              polygons: []
 *          }
 *      }
 * @param {object} image - The actual image blob that will be displayed
 *      {id: int, data: blob}
 * @param {object} uiConfig - User interface configs 
 *      {nodesRadius: int, strokeWidth: int}
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
 *          }
 *      },
 *      img: {
 *          multilabels: bool,
 *          actions: {
 *              label: bool,
 *          }
 *      }
 *   }
 * @param {bool} imgBarVisible - Controls visibility of the ImgBar
 * @param {bool} imgLabelInputVisible - Controls visibility of the ImgLabelInputPrompt
 * @param {object} layoutOffset - Offset of the canvas inside the container:
 *      {left:int, top:int, right:int, bottom:int} values in pixels.
 * @param {bool} centerCanvasInContainer - Center the canvas in the 
 *      middle of the container.
 * @event onSVGUpdate - Fires when the svg in canvas changed.
 *      args: {width: int, height: int, scale: float, translateX: float,
 *      translateY:float}
 * @event onImageLoaded - Fires when an image was loaded into the canvas
 * @event onAnnoSelect - Fires when an annotation was selected or if the
 *      selected annotation was updated.
 * @event onImgBarClose - Fires when close button on ImgBar was hit.
 * @event onImgLabelInputClose - ImgLabelInput requests to be closed.
 * 
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
            annos: [],
            mode: modes.VIEW,
            // selectedAnnoId: {id:undefined},
            selectedAnnoId: undefined,
            showSingleAnno: undefined,
            showLabelInput: false,
            imageLoaded: false,
            imgLabelIds: [],
            imgLabelChanged: false,
            performedImageInit: false,
            prevLabel: [],
            imageData: undefined,
            isJunk: false,
            imgBarVisible:false,
            annoToolBarVisible: false
        }
        this.img = React.createRef()
        this.svg = React.createRef()
        this.container = React.createRef()
        this.hist = new UndoRedo()
        this.keyMapper = new KeyMapper((keyAction) => this.handleKeyAction(keyAction))
        this.mousePos = undefined
    }

    componentDidMount(){
    }

    componentDidUpdate(prevProps, prevState){
        // if (this.props.image.id !== prevProps.image.id){
            
        // }
        if (prevProps.annos !== this.props.annos){
            this.setState({
                imgLabelIds: this.props.annos.image.labelIds,
                // isJunk: this.props.annos.image.isJunk
            })
            this.setState({
                imageLoaded: false,
                imageData: undefined
            })
        }
        if (prevProps.isJunk !== this.props.isJunk){
            if (this.state.isJunk !== this.props.isJunk){
                this.setState({
                    isJunk: this.props.isJunk
                })
            }
        }
        if (this.state.imageData !== this.props.image.data){
            this.setState({imageData: this.props.image.data})
        }
        // if (!this.state.imageLoaded){
        //     if(this.props.annos.image.id === this.props.image.id){
        //         this.setState({
        //             imageLoaded: true
        //         })
        //         if (this.props.onImageLoaded){
        //             this.props.onImageLoaded()
        //         }
        //     }
        // }
        if (this.state.performedImageInit){
            console.log('canvasHist Performed image init', this.state)
            // Initialize canvas history
            this.setState({
                performedImageInit:false,
                annoToolBarVisible:false
            })
            if (this.props.imgBarVisible){
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
            if (prevState.imageLoaded !== this.state.imageLoaded){
                this.updateCanvasView(this.props.annos.annotations)
                this.setImageLabels(this.props.annos.image.labelIds)
                this.setState({
                    performedImageInit:true
                })
            } 
            if(prevProps.layoutUpdate !== this.props.layoutUpdate){
                this.selectAnnotation(undefined)
                this.updateCanvasView(this.getAnnoBackendFormat())
            }
            console.log('Canvas update this.state',this.state)
            console.log('Canvas imageLoaded',this.state.imageLoaded)
            
        }
        console.log('canvasHistory canvas state', this.hist.getHist(), this.state)
    }

    onImageLoad(){
        console.log('Canvas onImageLoade')
        this.setState({
            imageLoaded: true
        })
        if (this.props.onImageLoaded){
            this.props.onImageLoaded()
        }
    }

    onMouseOver(){
        //Prevent scrolling on svg
        this.svg.current.focus()
        console.log('Mouse Over Canvas')
    }

    onWheel(e:Event){
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
        //Constrain zoom
        if (nextScale < 1.0){
            nextScale = 1.0
        }
        if (nextScale > 200.0){
            nextScale = 200.0
        }
        console.log(nextScale)
        this.setState({svg: {
            ...this.state.svg,
            scale: nextScale,
            translateX: -1*(mousePos.x * nextScale - mousePos.x)/nextScale,
            translateY: -1*(mousePos.y * nextScale - mousePos.y)/nextScale
        }})
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

    handleKeyAction(action){
        const anno = this.findAnno(this.state.selectedAnnoId)
        console.log('handleKeyAction: ', action)
        switch(action){
            case keyActions.EDIT_LABEL:
                this.editAnnoLabel()
                break
            case keyActions.DELETE_ANNO:
                this.onAnnoPerformedAction(anno, canvasActions.ANNO_DELETED)
                break
            case keyActions.ENTER_ANNO_ADD_MODE:
                if (anno){
                    this.updateSelectedAnno(
                        anno, modes.ADD
                    )
                    // this.showSingleAnno(anno.id)
                }
                break
            case keyActions.LEAVE_ANNO_ADD_MODE:
                console.log('handleKeyAction LEAVE_ANNO_EDIT_MODE')
                if (anno){
                    this.updateSelectedAnno(
                        anno, modes.VIEW
                    )
                    // this.showSingleAnno(undefined)
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
            default:
                console.warn('Unknown key action', action)
        }

    }

    onKeyDown(e: Event){
        e.preventDefault()
        this.keyMapper.keyDown(e.key)
        console.log('KEY down on Canvas', e.key, e.keyCode, e.keyCode, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
        const anno = this.findAnno(this.state.selectedAnnoId)
    }

    onKeyUp(e: Event){
        e.preventDefault()
        this.keyMapper.keyUp(e.key)
        // console.log('KEY up on Canvas', e.key, e.keyCode, e.keyCode, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
    }

    onMouseMove(e: Event){
        if (this.state.mode === modes.CAMERA_MOVE){
            this.moveCamera(e)
        }
    }

    onLabelInputDeleteClick(annoId){
        this.removeSelectedAnno()
    }
    
    

    /**
     * Handle actions that have been performed by an annotation 
     * @param {Number} anno Id of the annotation
     * @param {String} pAction Action that was performed
     */
    onAnnoPerformedAction(anno, pAction){
        console.log('onAnnoPerformedAction', anno, pAction)
        let newAnnos = undefined
        switch(pAction){
            case canvasActions.ANNO_SELECTED:
                this.selectAnnotation(anno.id)
                break
            case canvasActions.ANNO_START_CREATING:
                newAnnos = this.updateSelectedAnno(anno)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                break
            case canvasActions.ANNO_CREATED:
                newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                console.log('ANNO_CREATED newAnnos', newAnnos)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, undefined
                )
                this.showSingleAnno(undefined)
                this.setState({annoToolBarVisible:true})
                break
            case canvasActions.ANNO_MOVED:
                newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                this.showSingleAnno(undefined)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, undefined
                )
                this.setState({annoToolBarVisible:true})
                break
            case canvasActions.ANNO_ENTER_MOVE_MODE:
                this.showSingleAnno(anno.id)
                this.setState({annoToolBarVisible:false})
                break
            case canvasActions.ANNO_ENTER_EDIT_MODE:
                // this.showSingleAnno(anno.id)
                this.setState({annoToolBarVisible:false})
                break
            case canvasActions.ANNO_ADDED_NODE:
                newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                break
            case canvasActions.ANNO_EDITED:
                newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                this.setState({annoToolBarVisible:true})
                break
            case canvasActions.ANNO_DELETED:
                newAnnos = this.updateSelectedAnno(anno, modes.DELETED)
                this.selectAnnotation(undefined)
                this.showSingleAnno(undefined)
                this.pushHist(
                    newAnnos, undefined,
                    pAction, this.state.showSingleAnno
                )
                break
            case canvasActions.ANNO_LABEL_UPDATE:
                newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, undefined
                )
                this.setState({annoToolBarVisible:true})
                break
            case canvasActions.ANNO_CREATED_NODE:
                const merged = this.mergeSelectedAnno(anno, modes.CREATE)
                this.pushHist(
                    merged.newAnnos, anno.id,
                    pAction, this.state.showSingleAnno
                )
                break
            case canvasActions.ANNO_CREATED_FINAL_NODE:
                console.log('canvasActions.ANNO_CREATED_FINAL_NODE', anno)
                newAnnos = this.updateSelectedAnno(anno, modes.VIEW)
                this.pushHist(
                    newAnnos, anno.id,
                    pAction, undefined
                )
                this.showSingleAnno(undefined)
                this.setState({annoToolBarVisible:true})
                break
            default:
                console.warn('Action not handeled', pAction)
                break
        }
    }

    onAnnoLabelInputUpdate(anno){
        this.updateSelectedAnno(anno)
    }

    onAnnoLabelInputClose(){
        console.log('onAnnoLabelInputClose')
        this.svg.current.focus()
        this.showLabelInput(false)
        this.showSingleAnno(undefined)
        const anno = this.findAnno(this.state.selectedAnnoId)
        this.onAnnoPerformedAction(anno, canvasActions.ANNO_LABEL_UPDATE)
    }

    handleImgBarClose(){
        if (this.props.onImgBarClose){
            this.props.onImgBarClose()
        }
    }

    handleImgLabelUpdate(label){
        this.setState({
            imgLabelIds: label,
            imgLabelChanged: true,
        })
        this.pushHist(this.state.annos,
            this.state.selectedAnnoId,
            canvasActions.IMG_LABEL_UPDATE,
            this.state.showSingleAnno,
            label
        )
    }

    handleCanvasClick(e){
        if (this.props.imgBarVisible){
            this.setState({imgBarVisible:true})
        }
    }

    handleImgBarMouseEnter(e){
        this.setState({imgBarVisible:false})
    }

    handleImgLabelInputClose(){
        if (this.props.onImgLabelInputClose){
            this.props.onImgLabelInputClose()
        }
    }

    handleSvgMouseMove(e:Event){
        this.mousePos = mouse.getMousePosition(e, this.state.svg)
    }

    /*************
     * LOGIC     *
    **************/
    editAnnoLabel(){
        if (this.state.selectedAnnoId){
            const anno = this.findAnno(this.state.selectedAnnoId)
            this.showLabelInput()
            this.updateSelectedAnno(anno, modes.EDIT_LABEL)
        }
    }
    unloadImage(){
        if(this.state.imageLoaded){
            this.setState({imageLoaded:false})
        }
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

    pushHist(annos, selectedAnnoId, pAction, showSingleAnno, imgLabelIds=this.state.imgLabelIds){
        this.hist.push({
            ...this.getAnnos(annos, false),
            selectedAnnoId: selectedAnnoId,
            showSingleAnno: showSingleAnno,
            imgLabelIds: imgLabelIds
        }, pAction)
    }

    undo(){
        if (!this.hist.isEmpty()){
            const cState = this.hist.undo()
            console.log('canvasHistory UNDO: ',cState)
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
            console.log('canvasHistory REDO: ',cState)
            this.setCanvasState(
                cState.entry.annotations,
                cState.entry.imgLabelIds, 
                cState.entry.selectedAnnoId,
                cState.entry.showSingleAnno)
        }
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

    selectAnnotation(annoId){
        if (annoId){
            const anno = this.findAnno(annoId)
            this.setState({
                selectedAnnoId: annoId
            })
            if (anno.mode !== modes.CREATE){
                this.setState({
                    annoToolBarVisible: true
                })
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
        if(this.props.onAnnoSelect){
            const anno = this.findAnno(annoId)
            this.props.onAnnoSelect(anno)
        }
    }

    /**
     * Traverse annotations by key hit
     */
    traverseAnnos(){
        if (this.state.annos.length > 0){
            const myAnnos = this.state.annos.filter(e => {
                return e.status !== annoStatus.DELETED
            })
            console.log('Traverse annos: filteredAnnos', myAnnos)
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

    getAnnoBackendFormat(forBackendPost=false, annos=undefined){
        let myAnnos = annos ? annos : this.state.annos
        const bAnnos = myAnnos.map( el => {
            var annoId 
            if (forBackendPost){
                // If an annotation will be send to backend,
                // ids of new created annoations need to be set to 
                // undefined.
                annoId = (typeof el.id) === "string" ? undefined : el.id
            } else {
                annoId = el.id
            }
            return {
                ...el,
                id: annoId,
                data: transform.toBackend(el.data, this.state.svg, el.type)
            }
        })
        const backendFormat = {
                bBoxes: bAnnos.filter((el) => {return el.type == 'bBox'}),
                lines: bAnnos.filter((el) => {return el.type == 'line'}),
                points: bAnnos.filter((el) => {return el.type == 'point'}),
                polygons: bAnnos.filter((el) => {return el.type == 'polygon'}),
        }
        console.log('Annotation getAnnoBackendFormat', backendFormat)
        return backendFormat
    }

    getAnnos(annos=undefined, removeFrontedIds=true){
        const myAnnos = annos ? annos : this.state.annos
        const backendFormat = this.getAnnoBackendFormat(removeFrontedIds, myAnnos)
        const finalData = {
            imgId: this.props.annos.image.id,
            imgLabelIds: this.state.imgLabelIds,
            imgLabelChanged: this.state.imgLabelChanged,
            annotations: backendFormat,
            isJunk: this.state.isJunk
        }
        return finalData
    }

    moveCamera(e){
        this.setState({svg: {
            ...this.state.svg,
            translateX: this.state.svg.translateX + e.movementX / this.state.svg.scale,
            translateY: this.state.svg.translateY + e.movementY / this.state.svg.scale
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
        if (this.keyMapper.controlDown) return
        if (this.props.selectedTool){
            const mousePos = this.getMousePosition(e)
            // const selAnno = this.findAnno(this.state.selectedAnnoId)
            const newAnno = {
                id: _.uniqueId('new'),
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
                selectedNode: 1
            }
            this.setState({
                annos: [...this.state.annos, newAnno],
                selectedAnnoId: newAnno.id,
                showSingleAnno: newAnno.id
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
        } else {
            console.warn('No annotation tool selected!')
        }
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

    /**
     * Update selected anno and override mode if desired
     * 
     * @param {object} anno - The new annotation the becomes the selected anno
     * @param {string} mode - The new mode for the selected anno
     * @returns The new anno that was set as selectedAnno in state and 
     *      the new annos list that was set in state
     */
    updateSelectedAnno(anno, mode=undefined){
        if (!anno) return
        const {newAnnos, newAnno} = this.mergeSelectedAnno(anno, mode)
        this.setState({
            annos: newAnnos,
            selectedAnnoId: anno.id,
            prevLabel: anno.labelIds, 
        })
        if(this.props.onAnnoSelect){
            this.props.onAnnoSelect(newAnno)
        }
        return newAnnos
    }

    mergeSelectedAnno(anno, mode=undefined){
        const filtered = this.state.annos.filter( (el) => {
            return el.id !== anno.id
        }) 
        let newAnno
        if (mode){
            newAnno = {...anno, mode:mode}
            if (mode === modes.DELETED){
                newAnno = {
                    ...newAnno,
                    status: annoStatus.DELETED
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
        filtered.push(newAnno)
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
        
        // if (container.left < this.props.uiConfig.toolBarWidth){
        //     canvasLeft = this.props.uiConfig.toolBarWidth + 10
        // } else {
        //     canvasLeft = container.left
        // }
        console.log('Canvas container', container)
        console.log('CanvasLeft', canvasLeft, this.props.uiConfig.toolBarWidth)
        // var clientWidth = document.documentElement.clientWidth
        var clientHeight = document.documentElement.clientHeight
        var canvasTop
        var canvasLeft
        var maxImgHeight
        var maxImgWidth 
        if(this.props.layoutOffset){
            canvasTop = container.top + this.props.layoutOffset.top
            canvasLeft = container.left + this.props.layoutOffset.left
            maxImgHeight = clientHeight - container.top - this.props.layoutOffset.bottom - this.props.layoutOffset.top
            maxImgWidth = container.right -canvasLeft - this.props.layoutOffset.right
        } else {
            canvasTop = container.top
            canvasLeft = container.left
            maxImgHeight = clientHeight - container.top
            maxImgWidth = container.right -canvasLeft
        }
        // if (this.props.appliedFullscreen) maxImgHeight = maxImgHeight + 10 
        var ratio = this.img.current.naturalWidth / this.img.current.naturalHeight
        var imgWidth = "100%"
        var imgHeight = "100%"
        console.log('clientHeight', clientHeight)
        console.log('window.innerHeight', window.innerHeight)
        console.log('naturalWidth', this.img.current.naturalWidth)
        console.log('naturalHeight', this.img.current.naturalHeight)
        console.log('maxImgWidth', maxImgWidth)
        console.log('maxImgHeight', maxImgHeight)
        console.log('ratio', ratio)
        if (maxImgHeight * ratio > maxImgWidth){
            imgWidth = maxImgWidth
            imgHeight = maxImgWidth / ratio
        } else {
            imgWidth = maxImgHeight * ratio
            imgHeight = maxImgHeight
        }
        // console.log('svg', this.svg)
        console.log('img', this.img)
        console.log('imgWidth, imgHeight', imgWidth, imgHeight)
        if (this.props.centerCanvasInContainer){
            const resSpace = maxImgWidth - imgWidth
            if (resSpace > 2){
                canvasLeft = canvasLeft + resSpace / 2
            }
        }
        const svg = {
            ...this.state.svg, width : imgWidth, height: imgHeight,
            left: canvasLeft, top: canvasTop
        }
        this.setState({svg})
        this.svgUpdate(svg)
        return {imgWidth, imgHeight}
    }

    svgUpdate(svg){
        if(this.props.onSVGUpdate){
            this.props.onSVGUpdate(svg)
        }
    }

    setImageLabels(labelIds){
        console.log('initImageLabels', labelIds)
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
            console.log('UpdateCanvasView annotations', annotations)
            const imgSize = this.updateImageSize()
            annos = [
                ...annotations.bBoxes.map((element) => {
                    return {...element, type:'bBox', 
                    mode: element.mode ? element.mode : modes.VIEW, 
                    status: element.status ? element.status : annoStatus.DATABASE}
                }),
                ...annotations.lines.map((element) => {
                    return {...element, type:'line', 
                    mode: element.mode ? element.mode : modes.VIEW, 
                    status: element.status ? element.status : annoStatus.DATABASE}
                }),
                ...annotations.polygons.map((element) => {
                    return {...element, type:'polygon', 
                    mode: element.mode ? element.mode : modes.VIEW, 
                    status: element.status ? element.status : annoStatus.DATABASE}
                }),
                ...annotations.points.map((element) => {
                    return {...element, type:'point', 
                    mode: element.mode ? element.mode : modes.VIEW, 
                        status: element.status ? element.status : annoStatus.DATABASE
                    }
                })
            ]
            annos = annos.map((el) => {
                return {...el, 
                    data:transform.toSia(el.data, {width: imgSize.imgWidth, height:imgSize.imgHeight}, el.type)}
                })
            console.log('Canvas annos', annos)
            this.setState({annos: [...annos]})
        }
    }

    renderAnnotations(){
        // Do not render annotations while moving the camera!
        if (this.state.mode !== modes.CAMERA_MOVE){
            // this.annoRefs = []
            console.log('hist Render annotations', this.state.annos)
            const annos =  this.state.annos.map((el) => {
                // this.annoRefs.push(React.createRef())
                return <Annotation type={el.type} 
                        data={el} key={el.id} svg={{...this.state.svg}}
                        // ref={this.annoRefs[this.annoRefs.length - 1]}
                        onMouseDown={e => this.onAnnoMouseDown(e)}
                        onAction={(anno, pAction) => this.onAnnoPerformedAction(anno, pAction)}
                        selectedAnno={this.state.selectedAnnoId}
                        // onModeChange={(anno) => this.onAnnoModeChange(anno)}
                        showSingleAnno={this.state.showSingleAnno}
                        uiConfig={this.props.uiConfig}
                        allowedActions={this.props.canvasConfig.annos.actions}
                        possibleLabels={this.props.possibleLabels}
                    />
            })
            return <g>{annos}</g>
        } else {
            return null
        }
        
    }

    renderImgLabelInput(){
        if (!this.props.annos.image) return null
        return <Prompt 
            onClick={() => this.handleImgLabelInputClose()}
            active={this.props.imgLabelInputVisible}
            header={<div>
                <Icon name="edit"/>Add label for the whole image
            </div>}
            content={<div>
                <LabelInput
                    // multilabels={true}
                    multilabels={this.props.canvasConfig.img.multilabels}
                    // relatedId={this.props.annos.image.id}
                    visible={true}
                    onLabelUpdate={label => this.handleImgLabelUpdate(label)}
                    possibleLabels={this.props.possibleLabels}
                    initLabelIds={this.state.imgLabelIds}
                    relatedId={this.props.annos.image.id}
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

    render(){
        console.log('Canvas render state, props', this.state, this.props)
        const selectedAnno = this.findAnno(this.state.selectedAnnoId)
        return(
            <div ref={this.container} >
            <div height={this.state.svg.height} 
            style={{position: 'fixed', top: this.state.svg.top, left: this.state.svg.left}}
            >
            {this.renderImgLabelInput()}
            <ImgBar container={this.container} 
                visible={this.state.imgBarVisible}
                possibleLabels={this.props.possibleLabels}
                annos={this.props.annos}
                svg={this.state.svg}
                onClose={() => this.handleImgBarClose()}
                // onLabelUpdate={label => this.handleImgLabelUpdate(label)}
                // imgLabelIds={this.state.imgLabelIds}
                // multilabels={this.props.canvasConfig.img.multilabels}
                // allowedActions={this.props.canvasConfig.img.actions}
                onMouseEnter={e => this.handleImgBarMouseEnter(e)}
            />
            <Dimmer active={!this.state.imageLoaded}><Loader>Loading</Loader></Dimmer>
            <Dimmer active={this.state.isJunk}>
                <Header as='h2' icon inverted>
                    <Icon name='trash alternate outline' />
                    Marked as Junk
                </Header>
            </Dimmer>
                <AnnoToolBar visible={this.state.annoToolBarVisible} 
                    selectedAnno={selectedAnno}
                    svg={this.state.svg}
                    onClick={() => this.editAnnoLabel()}
                />

                {/* <div style={{position: 'fixed', top: this.props.container.top, left: this.props.container.left}}> */}
                <AnnoLabelInput svg={this.state.svg} 
                    // svgRef={this.svg}
                    onClose={() => this.onAnnoLabelInputClose()}
                    onDeleteClick={annoId => this.onLabelInputDeleteClick(annoId)}
                    selectedAnno={selectedAnno}
                    visible={this.state.showLabelInput}
                    onLabelUpdate={anno => this.onAnnoLabelInputUpdate(anno)}
                    possibleLabels={this.props.possibleLabels}
                    allowedActions={this.props.canvasConfig.annos.actions}
                    multilabels={this.props.canvasConfig.annos.multilabels}
                    mousePos={this.mousePos}
                    // multilabels={true}
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
                        onMouseUp={(e) => {this.onMouseUp(e)}}
                        onWheel={(e) => {this.onWheel(e)}}
                        onMouseMove={(e) => {this.onMouseMove(e)}}
                    >
                        <image
                            onContextMenu={(e) => this.onRightClick(e)}
                            onMouseDown={(e) => this.onMouseDown(e)}
                            href={this.props.image.data} 
                            width={this.state.svg.width} 
                            height={this.state.svg.height}
                        />
                        {this.renderAnnotations()}
                    </g>
                </svg>
                <img style={{display:'none'}} ref={this.img} onLoad={() => {this.onImageLoad()}} src={this.state.imageData} width="100%" height="100%"></img>
                {/* </div> */}
                </div>
                {/* Placeholder for Layout*/}
                <div style={{minHeight: this.state.svg.height}}></div> 
            </div>)
    }
}

export default Canvas