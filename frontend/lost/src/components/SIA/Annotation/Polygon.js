import React, {Component} from 'react'

import Edge from './Edge'
import Node from './Node'
import InfSelectionArea from './InfSelectionArea'

import * as transform from '../utils/transform'

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
            mode: modes.VIEW,
            selectedNode: undefined
        }
    }

    componentDidMount(){
        if (this.props.mode === modes.CREATE){
            console.log('in Create Pos')
            const data = this.props.anno[0]
            this.setState({
                anno: [
                    {x: data.x, y: data.y},
                    {x: data.x+1, y: data.y}
                ]
            })
            this.setMode(modes.CREATE, 1)
        } else {
            this.setState({anno: [...this.props.anno]})
        }
    }

    componentDidUpdate(prevProps){
        console.log('Update polygon', this.state.mode)
        if (prevProps.mode !== this.props.mode){
            this.setMode(this.props.mode)
        }
        if (prevProps.anno !== this.props.anno){
            this.setState({anno: [...this.props.anno]})
        }
    }


    /**************
    * ANNO EVENTS *
    ***************/
    onMouseMove(e){
        switch (this.state.mode){
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
        switch (this.state.mode){
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
        switch (this.state.mode){
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
        switch (this.state.mode){
            case modes.EDIT:
                this.setMode(modes.VIEW)
                break
            default:
                break
        }
    }

    onNodeMouseDown(e,idx){
        switch (this.state.mode){
            case modes.CREATE:
                if (e.button === 2){
                    console.log('onNodeMouseDown create')
                    let newAnno = [...this.state.anno]
                    newAnno.push({
                        x: newAnno[idx].x,
                        y: newAnno[idx].y
                    })
                    this.setState({
                        anno: newAnno,
                        selectedNode: this.state.selectedNode + 1
                    })
                }
                break
            case modes.VIEW:
                if (e.button === 0){
                    this.setMode(modes.EDIT, idx)
                }
        }
    }

    onNodeMouseMove(e, idx){
        switch (this.state.mode){
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
        switch (this.state.mode){
            case modes.CREATE:
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
        switch (this.state.mode){
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
    toPolygonStr(data){
        return data.map( (e => {
            return `${e.x},${e.y}`
        })).join(' ')
        
    }

    forceMode(mode, selectedNode){
        if (this.props.onModeChange){
            this.props.onModeChange(mode, this.state.mode)
        }
        this.setState({
            mode,
            selectedNode
        })
    }

    setMode(mode, selectedNode=undefined){
        if (this.state.mode !== mode){
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
            anno : transform.move(this.state.anno, movementX, movementY)
        })
    }

    addNode(e, idx){
        console.log('Add Node to Polygon', idx)
        const mPos = mouse.getMousePosition(e, this.props.svg)
        let newAnno = this.state.anno.slice(0,idx)
        newAnno.push(mPos)
        const oldRest = this.state.anno.slice(idx)
        this.setState({anno: newAnno.concat(oldRest)})
    }

    updateAnnoByMousePos(e, idx){
        const mousePos = mouse.getMousePosition(e, this.props.svg)
        let newAnno = [...this.state.anno]
        newAnno[idx].x = mousePos.x
        newAnno[idx].y = mousePos.y
        this.setState({
            anno: newAnno
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
        switch (this.state.mode){
            case modes.MOVE:
                return null
            case modes.EDIT:
            case modes.CREATE:
                return <Node anno={this.state.anno} idx={this.state.selectedNode} 
                        key={this.state.selectedNode} style={this.props.style}
                        className={this.props.className} 
                        isSelected={this.props.isSelected}
                        mode={this.state.mode}
                        svg={this.props.svg}
                        onMouseDown={(e, idx) => this.onNodeMouseDown(e,idx)}
                        onMouseUp={(e, idx) => this.onNodeMouseUp(e, idx)}
                        onDoubleClick={(e, idx) => this.onNodeDoubleClick(e, idx)}
                        onMouseMove={(e, idx) => this.onNodeMouseMove(e, idx)}
                    />
            default:
                return this.state.anno.map((e, idx) => {
                    return <Node anno={this.state.anno} idx={idx} 
                        key={idx} style={this.props.style}
                        className={this.props.className} 
                        isSelected={this.props.isSelected}
                        mode={this.state.mode}
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
        switch (this.state.mode){
            case modes.VIEW:
            case modes.ADD:
                let edges = this.state.anno.map((e, idx) => {
                    return <Edge anno={this.state.anno} 
                        idx={idx} key={idx} style={this.props.style}
                        className={this.props.className}
                        isSelected={this.props.isSelected}
                        onMouseDown={(e, idx) => {this.onEdgeMouseDown(e, idx)}}                
                        />
                })
                edges.push(<Edge anno={this.state.anno} 
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
        return <polygon points={this.toPolygonStr(this.state.anno)}
            fill='none' stroke="purple" 
            style={this.props.style}
            className={this.props.className}
        />
    }

    renderInfSelectionArea(){
        switch (this.state.mode){
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