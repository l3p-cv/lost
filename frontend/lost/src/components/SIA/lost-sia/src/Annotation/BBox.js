import React, {Component} from 'react'
import './Annotation.scss';
import * as modes from '../types/modes'
import * as transform from '../utils/transform'
import * as canvasActions from '../types/canvasActions'
import * as mouse from '../utils/mouse'
import InfSelectionArea from './InfSelectionArea'
import Node from './Node'

class BBox extends Component{

    /*************
     * LIFECYCLE *
    **************/
    constructor(props){
        super(props)
        this.state = {
            anno: undefined,
        }
    }

    componentDidMount(prevProps){
        if (this.props.anno.mode === modes.CREATE){
            const data = this.props.anno.data[0]
            const newAnno = {
                ...this.props.anno,
                data: [
                    {x: data.x, y: data.y},
                    {x: data.x+1, y: data.y},
                    {x: data.x+1, y: data.y+1},
                    {x: data.x, y: data.y+1}
                ],
                selectedNode: 2
            }
            this.setState({
                anno: newAnno
            })
            // this.performedAction(newAnno, canvasActions.ANNO_START_CREATING)
            
        } else {
            this.setState({anno: {...this.props.anno}})
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.anno !== this.props.anno){
            this.setState({anno: {...this.props.anno}})
        }
    }

    /*************
    * EVENTS    *
    **************/
    onNodeMouseMove(e, idx){
        switch (this.state.anno.mode){
            case modes.CREATE:
            case modes.EDIT:
                const mousePos = mouse.getMousePosition(e, this.props.svg)
                const idxMinus = idx - 1 < 0 ? 3 : idx -1
                const idxPlus = idx + 1 > 3 ? 0 : idx +1
                let newAnnoData = [...this.state.anno.data]
                if (idx % 2 === 0){
                    newAnnoData[idxMinus].x = mousePos.x
                    newAnnoData[idx].x = mousePos.x
                    newAnnoData[idx].y = mousePos.y
                    newAnnoData[idxPlus].y = mousePos.y
                } else {
                    newAnnoData[idxMinus].y = mousePos.y
                    newAnnoData[idx].x = mousePos.x
                    newAnnoData[idx].y = mousePos.y
                    newAnnoData[idxPlus].x = mousePos.x
                }
                this.setState({
                    anno: {
                        ...this.state.anno,
                        data: newAnnoData
                    }
                })
                break
            default:
                break
        }
    }

    onNodeMouseDown(e,idx){
        switch(this.state.anno.mode){
            case modes.VIEW:
                if (e.button === 0){
                    this.requestModeChange(
                        {...this.state.anno, selectedNode:idx}, 
                        modes.EDIT
                    )
                }
                break
            default:
                break
        }
    }

    onNodeMouseUp(e, idx){
        switch(this.state.anno.mode){
            case modes.EDIT:
                if (e.button === 0){
                    this.requestModeChange(this.state.anno, modes.VIEW)
                    this.performedAction(this.state.anno, canvasActions.ANNO_EDITED)
                }
                break
            case modes.CREATE:
                if (e.button === 2){
                    this.requestModeChange(this.state.anno, modes.VIEW)
                    this.performedAction(this.state.anno, canvasActions.ANNO_CREATED)
                }
                break
            default:
                break
        }
    }

    handleNodeMouseLeave(e, idx){
        switch(this.state.anno.mode){
            //if mouse left Canvas in create mode, transit to VIEW mode
            case modes.CREATE:
                this.requestModeChange(this.state.anno, modes.VIEW)
                this.performedAction(this.state.anno, canvasActions.ANNO_CREATED)
                break
            default:
                break
        }
    }

    /**************
    * ANNO EVENTS *
    ***************/
    onMouseMove(e){
        switch (this.state.anno.mode){
            case modes.MOVE:
                this.move(
                    e.movementX/this.props.svg.scale, 
                    e.movementY/this.props.svg.scale
                )
                break
            default:
                break
        }
    }

    onMouseUp(e){
        switch (this.state.anno.mode){
            case modes.MOVE:
                if (e.button === 0){
                    this.requestModeChange(this.state.anno, modes.VIEW)
                    this.performedAction(this.state.anno, canvasActions.ANNO_MOVED)
                }
                break
            default:
                break
        }
    }

    onMouseDown(e){
        switch (this.state.anno.mode){
            case modes.VIEW:
                if (e.button === 0){
                    if (this.props.isSelected){
                        this.requestModeChange(this.state.anno, modes.MOVE)
                    }
                }
                break
            default:
                break
        }
    }
    /*************
    *  LOGIC     *
    **************/
    getResult(){
        return this.state.anno
    }
    
    requestModeChange(anno, mode){
        this.props.onModeChangeRequest(anno, mode)
    }

    performedAction(anno, pAction){
        if (this.props.onAction){
            this.props.onAction(anno, pAction)
        }
    }

    toPolygonStr(data){
        return data.map( (e => {
            return `${e.x},${e.y}`
        })).join(' ')
        
    }

    move(movementX, movementY){
        this.setState({
            anno : {
                ...this.state.anno,
                data: transform.move(this.state.anno.data, movementX, movementY)
            }
        })
    }

    /*************
     * RENDERING *
    **************/

    renderPolygon(){
        switch(this.state.anno.mode){
            default:
                return <polygon 
                    points={this.toPolygonStr(this.state.anno.data)}
                    fill='none' stroke="purple" 
                    style={this.props.style}
                    className={this.props.className}
                    onMouseDown={e => this.onMouseDown(e)}
                    onMouseUp={e => this.onMouseUp(e)}
                /> 
        }
    }

    renderNodes(){
        if (!this.props.isSelected) return null 
        switch(this.state.anno.mode){
            case modes.MOVE:
            case modes.EDIT_LABEL:
                return null
            case modes.EDIT:
            case modes.CREATE:
                return <Node anno={this.state.anno.data}
                            key={this.state.anno.selectedNode}
                            idx={this.state.anno.selectedNode} 
                            style={this.props.style}
                            className={this.props.className} 
                            isSelected={this.props.isSelected}
                            mode={this.state.anno.mode}
                            svg={this.props.svg}
                            onMouseDown={(e, idx) => this.onNodeMouseDown(e,idx)}
                            onMouseUp={(e, idx) => this.onNodeMouseUp(e, idx)}
                            onMouseMove={(e, idx) => this.onNodeMouseMove(e, idx)}
                            onMouseLeave={(e, idx) => this.handleNodeMouseLeave(e, idx)}
                        />
            default:
                return this.state.anno.data.map((e, idx) => {
                    return <Node anno={this.state.anno.data} idx={idx} 
                        key={idx} style={this.props.style}
                        className={this.props.className} 
                        isSelected={this.props.isSelected}
                        mode={this.state.anno.mode}
                        svg={this.props.svg}
                        onMouseDown={(e, idx) => this.onNodeMouseDown(e,idx)}
                        onMouseUp={(e, idx) => this.onNodeMouseUp(e, idx)}
                        onMouseLeave={(e, idx) => this.handleNodeMouseLeave(e, idx)}
                        />
                })
        }
    }

    renderInfSelectionArea(){
        switch (this.state.anno.mode){
            case modes.MOVE:
                return <InfSelectionArea enable={true} 
                        svg={this.props.svg}
                    />
            default:
                return null
        }
    }

    render(){
        if (this.state.anno){
            return (
            <g
                onMouseMove={e => this.onMouseMove(e)}
                onMouseUp={e => this.onMouseUp(e)}
                onMouseDown={e => this.onMouseDown(e)}
            >
                {this.renderPolygon()}
                {this.renderNodes()}
                {this.renderInfSelectionArea()}
            </g>)
        } else {
            return null
        }
    }

}

export default BBox;