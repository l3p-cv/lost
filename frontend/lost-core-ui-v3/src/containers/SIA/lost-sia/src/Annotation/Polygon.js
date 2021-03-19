import React, {Component} from 'react'

import Edge from './Edge'
import Node from './Node'
import InfSelectionArea from './InfSelectionArea'

import * as transform from '../utils/transform'
import * as canvasActions from '../types/canvasActions'

import './Annotation.scss'
import * as modes from '../types/modes'
import * as mouse from '../utils/mouse'


class Polygon extends Component{

    /*************
    *  LIFECYCLE *
    **************/
    constructor(props){
        super(props)
        this.state = {
            anno: undefined,
        }
    }

    componentDidMount(){
        if (this.props.anno.mode === modes.CREATE){
            const data = this.props.anno.data[0]
            const newAnno = {
                ...this.props.anno,
                data: [
                    {x: data.x, y: data.y},
                    {x: data.x+1, y: data.y},
                ],
                selectedNode: 1
            }
            this.setState({
                anno: newAnno
            })
        } else {
            this.setState({anno: {...this.props.anno}})
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.anno !== this.props.anno){
            this.setState({anno: {...this.props.anno}})
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
                    this.performedAction(this.state.anno, canvasActions.ANNO_MOVED)
                    this.requestModeChange(this.state.anno, modes.VIEW)
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
    /**************
    * NODE EVENTS *
    ***************/

    onNodeMouseUp(e, idx){
        switch (this.state.anno.mode){
            case modes.EDIT:
                this.performedAction(this.state.anno, canvasActions.ANNO_EDITED)
                this.requestModeChange(this.state.anno, modes.VIEW)
                break
            default:
                break
        }
    }

    onNodeMouseDown(e,idx){
        switch (this.state.anno.mode){
            case modes.CREATE:
                if (e.button === 2){
                    let newAnnoData = [...this.state.anno.data]
                    newAnnoData.push({
                        x: newAnnoData[idx].x,
                        y: newAnnoData[idx].y
                    })
                    const newAnno = {
                        ...this.state.anno,
                        data: newAnnoData,
                        selectedNode: this.state.anno.selectedNode + 1
                    }
                    this.setState({
                        anno: newAnno
                    })
                    this.performedAction(newAnno, 
                        canvasActions.ANNO_CREATED_NODE)
                }
                break
            case modes.VIEW:
                if (e.button === 0){
                    this.requestModeChange({
                        ...this.state.anno,
                        selectedNode: idx
                    }, modes.EDIT)
                }
                break
            default:
                break
        }
    }

    onNodeMouseMove(e, idx){
        switch (this.state.anno.mode){
            case modes.CREATE:
                this.updateAnnoByMousePos(e, idx)
                break
            case modes.EDIT:
                e.stopPropagation()
                this.updateAnnoByMousePos(e, idx)
                break
            default:
                break
        }
    }

    onNodeDoubleClick(e, idx){
        switch (this.state.anno.mode){
            case modes.CREATE:
                this.performedAction(this.state.anno, canvasActions.ANNO_CREATED_FINAL_NODE)
                break
            default:
                break
        }
    }
    
    /**************
    * EDGE EVENTS *
    ***************/
    onEdgeMouseDown(e, idx){
        switch (this.state.anno.mode){
            case modes.ADD:
                this.addNode(e, idx)
                break
            case modes.VIEW:
                if (e.button === 0){
                    this.requestModeChange(this.state.anno, modes.MOVE)
                }
                break
            default:
                break
        }
    }

    /*************
    *  LOGIC     *
    *************/
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

    requestModeChange(anno, mode){
        this.props.onModeChangeRequest(anno, mode)
    }

    move(movementX, movementY){
        this.setState({
            anno : {...this.state.anno,
                data: transform.move(this.state.anno.data, movementX, movementY)
            }
        })
    }

    addNode(e, idx){
        const mPos = mouse.getMousePosition(e, this.props.svg)
        let newAnnoData = this.state.anno.data.slice(0,idx)
        newAnnoData.push(mPos)
        const oldRest = this.state.anno.data.slice(idx)
        const newAnno = {
            ...this.state.anno,
            data: newAnnoData.concat(oldRest)
        }
        this.setState({anno: newAnno
        })
        this.performedAction(newAnno, canvasActions.ANNO_ADDED_NODE)
    }

    removeLastNode(){
        const newAnno = {
            ...this.state.anno,
            data: [...this.state.anno.data.slice(0, this.state.anno.data.length-1)],
            selectedNode: this.state.anno.selectedNode - 1
        }
        this.setState({anno: newAnno
        })
        this.performedAction(newAnno, canvasActions.ANNO_REMOVED_NODE)
    }

    updateAnnoByMousePos(e, idx){
        const mousePos = mouse.getMousePosition(e, this.props.svg)
        let newAnnoData = [...this.state.anno.data]
        newAnnoData[idx].x = mousePos.x
        newAnnoData[idx].y = mousePos.y
        this.setState({
            anno: {
                ...this.state.anno,
                data: newAnnoData
            }
        })
    }

    getResult(){
        return this.state.anno
    }

    /*************
    *  RENDERING *
    **************/

    renderNodes(){
        if (!this.props.isSelected) return null
        switch (this.state.anno.mode){
            case modes.MOVE:
                return null
            case modes.EDIT:
            case modes.CREATE:
                return <Node anno={this.state.anno.data} idx={this.state.anno.selectedNode} 
                        key={this.state.anno.selectedNode} style={this.props.style}
                        className={this.props.className} 
                        isSelected={this.props.isSelected}
                        mode={this.state.anno.mode}
                        svg={this.props.svg}
                        onMouseDown={(e, idx) => this.onNodeMouseDown(e,idx)}
                        onMouseUp={(e, idx) => this.onNodeMouseUp(e, idx)}
                        onDoubleClick={(e, idx) => this.onNodeDoubleClick(e, idx)}
                        onMouseMove={(e, idx) => this.onNodeMouseMove(e, idx)}
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
                        onDoubleClick={(e, idx) => this.onNodeDoubleClick(e, idx)}
                        onMouseMove={(e, idx) => this.onNodeMouseMove(e, idx)}
                        />
                })
        }
    }

    renderEdges(){
        if (!this.props.isSelected) return null
        switch (this.state.anno.mode){
            case modes.VIEW:
            case modes.ADD:
                let edges = this.state.anno.data.map((e, idx) => {
                    return <Edge anno={this.state.anno.data} 
                        idx={idx} key={idx} style={this.props.style}
                        className={this.props.className}
                        isSelected={this.props.isSelected}
                        onMouseDown={(e, idx) => {this.onEdgeMouseDown(e, idx)}}                
                        />
                })
                edges.push(<Edge anno={this.state.anno.data} 
                    closingEdge={true} key={edges.length}
                    idx={0}
                    style={this.props.style}
                    className={this.props.className}
                    isSelected={this.props.isSelected}
                    onMouseDown={(e, idx) => {this.onEdgeMouseDown(e, idx)}}  
                    />)
                return edges
            default:
                return null
        }
    }

    renderPolygon(){
        return <polygon points={this.toPolygonStr(this.state.anno.data)}
            fill='none' stroke="purple" 
            style={this.props.style}
            className={this.props.className}
        />
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
                    {this.renderEdges()}
                    {this.renderNodes()}
                    {this.renderInfSelectionArea()}
                </g>
            )
        } else {
            return <g></g>
        }
    }
}

export default Polygon;