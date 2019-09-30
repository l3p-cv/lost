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
import * as transform from '../utils/transform'

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
        this.setState({anno: {...this.props.data}})
    }

    componentDidUpdate(prevProps){
        if (this.isSelected()){
            console.log('Annotation Update', this.state, this.props.type, this.props.data.id)
        }
        if (prevProps.data !== this.props.data){
            console.log('ANNOTATION annoChangeMode - Annotation got new annotation data from props -> state', this.props.data, this.state.anno)
            this.setState({anno: {...this.props.data}})
        }
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
    }
    
    /*************
     * EVENTS    *
    **************/
    onClick(e: Event){
        e.stopPropagation()
        console.log('Annotation select annotation on click: ', this.state.anno)
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

        switch(pAction){
            case canvasActions.ANNO_CREATED_FINAL_NODE:
            case canvasActions.ANNO_EDITED:
            case canvasActions.ANNO_MOVED:
            case canvasActions.ANNO_CREATED:
                const corrected = transform.correctAnnotation(anno.data, this.props.svg)
                const newAnno = {...anno, data: corrected}
                this.performedAction(newAnno, pAction)
                break
            default:
                this.performedAction(anno, pAction)
                break
        }
    }

    setAnnoMode(anno, mode){
        this.setState({
            anno: {
                ...anno,
                mode: mode
            }
        })
    }

    setMode(anno, mode){
        if (anno.mode !== mode){
            switch (mode){
                case modes.EDIT_LABEL:
                    if (constraints.allowedToLabel(
                        this.props.allowedActions,
                        anno
                    )){
                        this.setAnnoMode(anno, mode)
                    }
                    break
                case modes.DELETED:
                    // if(constraints.allowedToDelete(
                    //     this.props.allowedActions,
                    //     anno
                    // )){
                        this.setAnnoMode(anno, mode)
                        const newAnno = {
                            ...anno, 
                            status: annoStatus.DELETED
                        }
                        this.setState({
                            anno: newAnno
                        })
                        this.performedAction(newAnno, canvasActions.ANNO_DELETED)
                    // }
                    break
                case modes.MOVE:
                    this.setAnnoMode(anno, mode)
                    this.performedAction(anno, canvasActions.ANNO_ENTER_MOVE_MODE)
                    break
                case modes.EDIT:
                    this.setAnnoMode(anno, mode)
                    this.performedAction(anno, canvasActions.ANNO_ENTER_EDIT_MODE)
                    break
                default:
                    this.setAnnoMode(anno, mode)
                    break
            }
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
        if (constraints.allowedToEdit(this.props.allowedActions, this.state.anno)){
            return this.props.selectedAnno === this.props.data.id
        } else {
            return false
        }
    }

    getResult(){
        return {
            ...this.state.anno,
            data: this.myAnno.current.state.anno,
            createMode: this.myAnno.current.state.mode === modes.CREATE
        }
    }
    
    getColor(){
        if (this.state.anno.labelIds){
            return colorlut.getColor(this.state.anno.labelIds[0])
        }
        else {
            return colorlut.getDefaultColor()
        }
    }

    getStyle(){
        const color = this.getColor()
        if (this.isSelected()){
            return {
                stroke: color,
                fill: color,
                strokeWidth: this.props.uiConfig.strokeWidth/this.props.svg.scale,
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
        // const allowedToEdit = constraints.allowedToEditBounds(
        //     this.props.allowedActions,
        //     this.state.anno
        // )
        switch(type) {
            case 'point':
                return <Point ref={this.myAnno} anno={this.state.anno} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    onModeChangeRequest={(anno, mode) => this.handleModeChangeRequest(anno, mode)}
                    onAction={(anno, pAction) => this.performedAnnoAction(anno, pAction)}
                    />
            case 'bBox':
                return <BBox ref={this.myAnno} anno={this.state.anno} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                    onNodeMouseDown={(e, idx) => this.onNodeMouseDown(e, idx)}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    onModeChangeRequest={(anno, mode) => this.handleModeChangeRequest(anno, mode)}
                    onAction={(anno, pAction) => this.performedAnnoAction(anno, pAction)}
                    />
            case 'polygon':
                return <Polygon ref={this.myAnno} anno={this.state.anno} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    onModeChangeRequest={(anno, mode) => this.handleModeChangeRequest(anno, mode)}
                    onAction={(anno, pAction) => this.performedAnnoAction(anno, pAction)}
                    />
            case 'line':
                return <Line ref={this.myAnno} anno={this.state.anno}
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    onAction={(anno, pAction) => this.performedAnnoAction(anno, pAction)}
                    onModeChangeRequest={(anno, mode) => this.handleModeChangeRequest(anno, mode)}
                    />
            default:
                console.error("Wrong annoType for annotations: ",
                    this.props.annoType)
        } 
    }
    
    renderAnnoBar(){
        return <AnnoBar 
            anno={this.state.anno} 
            mode={this.state.anno.mode}
            possibleLabels={this.props.possibleLabels}
            onClick={e => this.onClick(e)}
            style={this.getStyle()}
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