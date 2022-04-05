import React, {Component} from 'react'

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
import * as notificationType from '../types/notificationType'

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
        this.setState({anno: {...this.props.data}})
    }

    componentDidUpdate(prevProps){
        if (prevProps.data !== this.props.data){
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
        if (this.props.showSingleAnno === undefined){
            if (this.state.anno.visible !== undefined){
                if (this.state.anno.visible){
                    this.setVisible(true)
                } else {
                    this.setVisible(false)
                }
            }
        } 
           
    }
    
    /*************
     * EVENTS    *
    **************/
    onClick(e: Event){
        e.stopPropagation()
        this.performedAction(this.state.anno, canvasActions.ANNO_SELECTED)
    }

    onMouseDown(e: Event){
        e.preventDefault()
        if (this.props.onMouseDown){
            this.props.onMouseDown(e)
        }
    }

    onContextMenu(e: Event){
        e.preventDefault()
    }

    handleModeChangeRequest(anno, mode){
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


    notify(messageObj){
        if (this.props.onNotification){
            this.props.onNotification(messageObj)
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
                // Check if annoation is within image bounds
                const corrected = transform.correctAnnotation(anno.data, this.props.svg, this.props.imageOffset)
                let newAnno = {...anno, data: corrected}
                const area = transform.getArea(corrected, this.props.svg, anno.type, this.props.image)
                if (area!==undefined){
                    if(area < this.props.canvasConfig.annos.minArea){
                        this.notify({
                            title: "Annotation to small",
                            message: 'Annotation area was '+Math.round(area)+'px but needs to be bigger than '+ this.props.canvasConfig.annos.minArea+' px',
                            type: notificationType.WARNING
                        })
                        // newAnno = {...newAnno, mode: modes.DELETED}
                        this.setMode(newAnno, modes.DELETED)
                    } else {
                        this.performedAction(newAnno, pAction)
                    }
                } else {
                    this.performedAction(newAnno, pAction)
                }
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
                            // status: annoStatus.DELETED
                            mode: mode.DELETED
                        }
                        // this.setState({
                        //     anno: newAnno
                        // })
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

    getLabel(lblId){
        return this.props.possibleLabels.find( e => {
            return e.id === lblId
        })
    }
    
    getColor(){
        if (this.state.anno.labelIds && this.state.anno.labelIds.length > 0){
            return this.getLabel(this.state.anno.labelIds[0]).color
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
            svg={this.props.svg}
            defaultLabel={this.props.defaultLabel}
            />
    }
    render(){
        if(!this.state.anno.data) return null
        if(!this.props.possibleLabels) return null
        if(this.state.anno.status === annoStatus.DELETED) return null
        return (
            <g>
            <g visibility={this.state.visibility}
                onClick={e => this.onClick(e)}
                onMouseDown={e => this.onMouseDown(e)}
                onContextMenu={e => this.onContextMenu(e)}
            >
                {this.renderAnnoBar()}
                {this.renderAnno()}

            </g>
            </g>
        )
    }
}

export default Annotation