import React, {Component} from 'react'
import _ from 'lodash'

import AnnoBar from './AnnoBar'
import Point from './Point'
import BBox from './BBox'
import Line from './Line'
import Polygon from './Polygon'
import * as modes from '../types/modes'
import * as canvasActions from '../types/canvasActions'
import * as annoStatus from '../types/annoStatus'
import * as colorlut from '../utils/colorlut'
import * as constraints from '../utils/constraints'

class Annotation extends Component{

    constructor(props){
        super(props)
        this.state = {
            // mode: modes.VIEW,
            selAreaCss: 'sel-area-off',
            visibility: 'visible',
            anno: undefined
        }
        this.myAnno = React.createRef()
        
    }

    componentWillMount(){
        console.log('Annotation did mount ', this.props.data.id, this.props.data)
        if (this.props.data.initMode === modes.CREATE){
            // this.props.selectAnnotation(this.props.data)
            this.performedAction(this.props.data, canvasActions.ANNO_SELECTED)
        } 
        this.setState({anno: {...this.props.data}})
        // if (this.props.data.status === annoStatus.DELETED){
        //     this.setVisible(false)
        // }
    }

    componentDidUpdate(prevProps){
        if (this.isSelected()){
            console.log('Annotation Update', this.state, this.props.type, this.props.data.id)
        }
        if (prevProps.data !== this.props.data){
            console.log('ANNOTATION annoChangeMode - Annotation got new annotation data from props -> state', this.props.data, this.state.anno)
            this.setState({anno: {...this.props.data}})
            // this.setMode(this.props.data.initMode)
        }
        // if(prevProps.data.initMode !== this.props.data.initMode){
        //     this.setMode(this.props.data.initMode)
        // }
        if (prevProps.showSingleAnno !== this.props.showSingleAnno){
            if (this.props.showSingleAnno === undefined){
                this.setVisible(true)
            } else {
                if (this.props.showSingleAnno !== this.props.data.id){
                    this.setVisible(false)
                } else {
                    this.setVisible(true)
                }
            }
        }
        // if (this.isSelected()){
        //     if(this.state.anno !== this.props.selectedAnno){
        //         this.setState({anno: this.props.selectedAnno})
        //         console.log('ANNOTATION annoChangeMode - Update anno by props.selectedAnno', this.props.selectedAnno)
        //     }
        // }
        // if (this.state.anno.status === annoStatus.DELETED){
        //     this.setVisible(false)
        // } else {
            
        // }
        // if (prevProps.anno){
        //     if (this.props.anno.initMode!==prevProps.anno.initMode){
        //         console.log('hist initMode Changed to', this.props.anno.initMode)
        //         this.setMode(this.props.anno.initMode)
        //     }
        // }
    }
    
    /*************
     * EVENTS    *
    **************/
    onClick(e: Event){
        e.stopPropagation()
        console.log('Annotation select annotation on click: ', this.state.anno)
        // this.props.selectAnnotation(this.state.anno)
        this.performedAction(this.state.anno, canvasActions.ANNO_SELECTED)
    }

    onMouseDown(e: Event){
        e.preventDefault()
        console.log('Mouse Down on Anno', e)
        if (this.props.onMouseDown){
            this.props.onMouseDown(e)
        }
    }

    onContextMenu(e: Event){
        e.preventDefault()
    }

    // _annoUpdateHelper(){
    //     const newAnno = {
    //         ...this.state.anno,
    //         data: [...this.myAnno.current.state.anno],
    //         status: this.state.anno.status !== annoStatus.NEW ? annoStatus.CHANGED : annoStatus.NEW
    //     }
    //     this.setState({anno: newAnno})
    //     return newAnno
    // }
    onModeChange(newAnno){
        // console.log('MODE CHANGED (id, old, new): ',this.props.data.id, oldMode, '->', newMode)
        // switch (newMode){
        //     case modes.ADD:
        //     case modes.EDIT:
        //     case modes.MOVE:
        //     case modes.CREATE:
        //         // this.props.siaShowSingleAnno(this.props.data.id)
        //         break
        //     case modes.EDIT_LABEL:
        //         break
        //     case modes.VIEW:
        //         // this.props.siaShowSingleAnno(undefined)
        //         break
        //     default:
        //         break
        // }
        // switch (oldMode){
        //     case modes.ADD:
        //         // newAnno = this._annoUpdateHelper()
        //         this.performedAction(newAnno, canvasActions.ANNO_ADDED_NODE)
        //         break
        //     case modes.EDIT:
        //         // newAnno = this._annoUpdateHelper()
        //         this.performedAction(newAnno, canvasActions.ANNO_EDITED)
        //         break
        //     case modes.MOVE:
        //         // newAnno = this._annoUpdateHelper()
        //         this.performedAction(newAnno, canvasActions.ANNO_MOVED)
        //         break
        //     case modes.CREATE:
        //         newAnno = {
        //             ...newAnno,
        //             status: annoStatus.NEW
        //         }
        //         this.setState({anno: newAnno})
        //         // this.props.selectAnnotation(newAnno)
        //         this.performedAction(newAnno, canvasActions.ANNO_CREATED)

        //         break
        //     default:
        //         break
                
        // }
        this.setMode(newAnno.initMode)

    }

    handleModeChangeRequest(anno, mode){
        console.log('ANNOTATION: annoChangeMode - handleModeChangeRequest', anno, mode)
        this.setMode(anno, mode)
    }

    /*************
     * LOGIC     *
     *************/
    
     /**
     * Trigger callback when this annotation performed an action
     * 
     * @param {String} pAction 
     */
    performedAction(anno, pAction){

        if (this.props.onAction){
            this.props.onAction(anno, pAction)
        }
    }

    /**
     * Handle a performed action from a specific annotation
     * 
     * @param {list} annoData - Annotation data that define a box, line, 
     *      polygon, point
     * @param {string} pAction - The performed action
     * @param {int} selectedNode - The node of the annotation that 
     *      was selected
     */
    performedAnnoAction(anno, pAction){
        console.log('hist performedAnnoAction', anno, pAction)
        // const newAnno = {
        //     anno,
        //     status: this.state.anno.status !== annoStatus.NEW ? annoStatus.CHANGED : annoStatus.NEW,
        //     selectedNode
        // }
        // this.setState({
        //     anno: anno
        // })
        this.performedAction(anno, pAction)
    }

    setAnnoMode(anno, mode){
        console.log('ANNOTATION: annoChangeMode - setAnnoMode', anno, mode)
        this.setState({
            anno: {
                ...anno,
                initMode: mode
            }
        })
    }

    setMode(anno, mode){
        // let anno
        // if (this.state.anno){
        //     anno = this.state.anno
        // } else {
        //     anno = this.props.data
        // }
        if (anno.initMode !== mode){
            switch (mode){
                case modes.EDIT_LABEL:
                    if (constraints.allowedToLabel(
                        this.props.allowedActions,
                        anno
                    )){
                        this.setAnnoMode(anno, mode)
                        // this.props.siaShowLabelInput(true)
                        // this.props.siaShowSingleAnno(this.props.data.id)
                    }
                    break
                case modes.DELETED:
                    if(constraints.allowedToDelete(
                        this.props.allowedActions,
                        anno
                    )){
                        this.setAnnoMode(anno, mode)
                        // this.props.siaShowSingleAnno(undefined)
                        // this.props.selectAnnotation(undefined)
                        // this.performedAction(anno, canvasActions.SELECTED)
                        
                        // this.setVisible(false)
                        const newAnno = {
                            ...anno, 
                            status: annoStatus.DELETED
                        }
                        this.setState({
                            anno: newAnno
                        })
                        this.performedAction(newAnno, canvasActions.ANNO_DELETED)
                        console.log('Annotation in deleted state')
                    }
                    break
                default:
                    this.setAnnoMode(anno, mode)
                    console.log('hist Annotation setMode', mode)
                    break
            }
            // if (this.props.onModeChange){
            //     this.props.onModeChange(anno)
            // }
        }
    }

    setVisible(visible){
        if (visible){
            if (this.state.visibility !== 'visible'){
                this.setState({visibility: 'visible'})
            }
        } else {
            if (this.state.visibility !== 'hidden'){
                this.setState({visibility: 'hidden'})
            }
        }
    }

    isSelected(){
        return this.props.selectedAnno.id === this.props.data.id
    }

    getResult(){
        return {
            ...this.state.anno,
            data: this.myAnno.current.state.anno,
            createMode: this.myAnno.current.state.mode === modes.CREATE
        }
    }
    
    getStyle(){
        let color
        if (this.state.anno.labelIds){
            color = colorlut.getColor(this.state.anno.labelIds[0])
        }
        else {
            color = colorlut.getDefaultColor()
        }
        if (this.isSelected()){
            return {
                stroke: color,
                fill: color,
                strokeWidth: this.props.uiConfig.strokeWidth/this.props.svg.scale,
                // strokeDasharray:"5,5",
                r:this.props.uiConfig.nodeRadius/this.props.svg.scale

            }
        } else {
            return {
                stroke: color,
                fill: color,
                strokeWidth: this.props.uiConfig.strokeWidth/this.props.svg.scale,
                r:this.props.uiConfig.nodeRadius/this.props.svg.scale
            }
        }
    }

    getCssClass(){
        if (this.isSelected()){
            return 'selected'
        } else {
            return 'not-selected'
        }
    }

    /*************
     * RENDERING *
    **************/
    renderAnno(){
        const type = this.props.type
        const anno = this.state.anno.data
        const allowedToEdit = constraints.allowedToEditBounds(
            this.props.allowedActions,
            this.state.anno
        )
        // const selectedNode = this.state.anno.selectedNode
        switch(type) {
            case 'point':
                return <Point ref={this.myAnno} anno={anno} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    allowedToEdit={allowedToEdit}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    mode={this.state.anno.initMode}
                    onModeChange={(newMode, oldMode) => {this.onModeChange(newMode, oldMode)}}
                    />
            case 'bBox':
                return <BBox ref={this.myAnno} anno={anno} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    allowedToEdit={allowedToEdit}
                    onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                    onNodeMouseDown={(e, idx) => this.onNodeMouseDown(e, idx)}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    mode={this.state.anno.initMode}
                    onModeChange={(newMode, oldMode) => {this.onModeChange(newMode, oldMode)}}
                    />
            case 'polygon':
                return <Polygon ref={this.myAnno} anno={this.state.anno} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    allowedToEdit={allowedToEdit}
                    onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    // onModeChange={(anno) => {this.onModeChange(anno)}}
                    onModeChangeRequest={(anno, mode) => this.handleModeChangeRequest(anno, mode)}
                    onAction={(anno, pAction) => this.performedAnnoAction(anno, pAction)}
                    // selectedNode={selectedNode}
                    />
            case 'line':
                return <Line ref={this.myAnno} anno={anno}
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    allowedToEdit={allowedToEdit}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    mode={this.state.anno.initMode}
                    onModeChange={(newMode, oldMode) => {this.onModeChange(newMode, oldMode)}}
                    />
            default:
                console.error("Wrong annoType for annotations: ",
                    this.props.annoType)
        } 
    }
    
    renderAnnoBar(){
        return <AnnoBar 
            anno={this.state.anno} 
            mode={this.state.anno.initMode}
            possibleLabels={this.props.possibleLabels}
            />
    }
    render(){
        console.log('ANNOTATION: annoChangeMode - Render Single Anno state', this.state)
        if(!this.state.anno.data) return null
        if(this.state.anno.status === annoStatus.DELETED) return null
        return (
            <g>
            <g visibility={this.state.visibility}
                onClick={e => this.onClick(e)}
                onMouseDown={e => this.onMouseDown(e)}
                onContextMenu={e => this.onContextMenu(e)}
            >
                {this.renderAnno()}
                {this.renderAnnoBar()}

            </g>
            </g>
        )
    }
}

export default Annotation