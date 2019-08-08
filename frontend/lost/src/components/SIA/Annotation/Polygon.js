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
            // mode: modes.VIEW,
            // selectedNode: undefined
        }
    }

    componentDidMount(){
        console.log('Polygon did mount', this.props, this.props.anno)
        if (this.props.anno.initMode === modes.CREATE){
            this.performedAction(this.props.anno, canvasActions.ANNO_CREATED_NODE)
        }
        // if (this.props.anno.initMode === modes.CREATE){
        //     console.log('in Create Pos')
        //     const data = this.props.anno.data[0]
        //     const newAnnoData = [
        //         {x: data.x, y: data.y},
        //         {x: data.x+1, y: data.y}
        //     ]
        //     const newAnno =  {
        //         ...this.props.anno,
        //         data: newAnnoData,
        //         selectedNode: 1
        //     }
        //     this.setState({
        //         anno: newAnno
        //     })
        //     // this.setMode(modes.CREATE, 1)
        //     // this.selectNode(1)
        //     // this.performedAction(newAnno, canvasActions.ANNO_CREATED_NODE)
        // } else {
        //     this.setState({anno: {...this.props.anno}})
        // }
        this.setState({anno: {...this.props.anno}})
    }

    componentDidUpdate(prevProps){
        console.log('Update polygon-> state', this.state.anno)
        // if (prevProps.mode !== this.props.mode){
        //     this.setMode(this.props.mode)
        // }
        if (prevProps.anno !== this.props.anno){
            console.log('Update polygon anno from props -> state, props', this.state.anno, this.props.anno)
            this.setState({anno: {...this.props.anno}})
        }
        // if (prevProps.selectedNode !== this.props.selectedNode){
        //     this.setState({selectedNode: this.props.selectedNode})
        // }
    }


    /**************
    * ANNO EVENTS *
    ***************/
    onMouseMove(e){
        switch (this.state.anno.initMode){
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
        switch (this.state.anno.initMode){
            case modes.MOVE:
                if (e.button === 0){
                    this.setMode(modes.VIEW)
                }
                break
            default:
                break
        }
    }

    onMouseDown(e){
        switch (this.state.anno.initMode){
            case modes.VIEW:
                if (e.button === 0){
                    if (this.props.isSelected){
                        this.setMode(modes.MOVE)
                    }
                }
                break
        }
    }
    /**************
    * NODE EVENTS *
    ***************/

    onNodeMouseUp(e, idx){
        switch (this.state.anno.initMode){
            case modes.EDIT:
                this.setMode(modes.VIEW)
                break
            default:
                break
        }
    }

    onNodeMouseDown(e,idx){
        switch (this.state.anno.initMode){
            case modes.CREATE:
                if (e.button === 2){
                    console.log('onNodeMouseDown create')
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
                    this.setMode(modes.EDIT, idx)
                }
        }
    }

    onNodeMouseMove(e, idx){
        switch (this.state.anno.initMode){
            case modes.CREATE:
                this.updateAnnoByMousePos(e, idx)
            case modes.EDIT:
                e.stopPropagation()
                this.updateAnnoByMousePos(e, idx)
                break
            default:
                break
        }
    }

    onNodeDoubleClick(e, idx){
        switch (this.state.anno.initMode){
            case modes.CREATE:
                this.performedAction(this.state.anno, canvasActions.ANNO_CREATED_FINAL_NODE)
                this.setMode(modes.VIEW)
            default:
                break
        }
    }
    
    /**************
    * EDGE EVENTS *
    ***************/
    onEdgeMouseDown(e, idx){
        console.log('Edge mouse down', idx)
        switch (this.state.anno.initMode){
            case modes.ADD:
                this.addNode(e, idx)
                break
            case modes.VIEW:
                if (e.button === 0){
                    this.setMode(modes.MOVE)
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

    forceMode(mode, selectedNode){
        const newAnno = {
            ...this.state.anno,
            selectedNode,
            initMode: mode
        }
        if (this.props.onModeChange){
            this.props.onModeChange(
                newAnno)
        }
        this.setState({
            anno: newAnno
        })
    }

    // selectNode(selectedNode){
    //     this.setState({
    //         selectedNode
    //     })
    // }
    setMode(mode, selectedNode=undefined){
        if (this.state.anno.initMode !== mode){
            switch(mode){
                case modes.ADD:
                case modes.MOVE:
                case modes.EDIT:
                    if (this.props.allowedToEdit){
                        this.forceMode(mode, selectedNode)
                    }
                    break
                default:
                    this.forceMode(mode, selectedNode)
                    break
            }
        }
    }

    move(movementX, movementY){
        this.setState({
            anno : {...this.state.anno,
                data: transform.move(this.state.anno.data, movementX, movementY)
            }
        })
    }

    addNode(e, idx){
        console.log('Add Node to Polygon', idx)
        const mPos = mouse.getMousePosition(e, this.props.svg)
        let newAnno = this.state.anno.data.slice(0,idx)
        newAnno.push(mPos)
        const oldRest = this.state.anno.data.slice(idx)
        this.setState({anno: {
                ...this.state.anno,
                data: newAnno.concat(oldRest)
            }
        })
    }

    updateAnnoByMousePos(e, idx){
        const mousePos = mouse.getMousePosition(e, this.props.svg)
        let newAnnoData = [...this.state.anno.data]
        newAnnoData[idx].x = mousePos.x
        newAnnoData[idx].y = mousePos.y
        console.log('Polygon updateAnnoByMousePos newData', newAnnoData)
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
        switch (this.state.anno.initMode){
            case modes.MOVE:
                return null
            case modes.EDIT:
            case modes.CREATE:
                return <Node anno={this.state.anno.data} idx={this.state.anno.selectedNode} 
                        key={this.state.anno.selectedNode} style={this.props.style}
                        className={this.props.className} 
                        isSelected={this.props.isSelected}
                        mode={this.state.anno.initMode}
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
                        mode={this.state.anno.initMode}
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
        switch (this.state.anno.initMode){
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
        switch (this.state.anno.initMode){
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
            console.log('hist render Polygon -> state, props.anno', this.state, this.props.anno)
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