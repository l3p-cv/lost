import React, {Component} from 'react'

import Edge from './Edge'
import Node from './Node'

import * as transform from '../utils/transform'

import './Annotation.scss'
import * as modes from './modes'
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
        if (this.props.data.createMode){
            console.log('in Create Pos')
            this.setState({
                mode: modes.CREATE,
                selectedNode: 1,
                anno: [
                    {x: this.props.data.data.x, y: this.props.data.data.y},
                    {x: this.props.data.data.x+1, y: this.props.data.data.y}
                ]
            })
        } else {
            this.setState({anno: [...this.props.data.data]})
        }
    }

    componentDidUpdate(prevProps){
        console.log('Update polygon')
        if (prevProps.mode !== this.props.mode){
            this.setMode(this.props.mode)
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
                // this.setState({
                //     mode: modes.VIEW
                // })
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

    setMode(mode, selectedNode=undefined){
        if (this.state.mode !== mode){
            this.setState({
                mode,
                selectedNode
            })
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
        console.log('Polygon style', this.props.style)
        console.log('Polygon className', this.props.className)
        return <polygon points={this.toPolygonStr(this.state.anno)}
            fill='none' stroke="purple" 
            style={this.props.style}
            className={this.props.className}
        />
    }
    render(){
        if (this.state.anno){
            return <g>
                {this.renderPolygon()}
                {this.renderEdges()}
                {this.renderNodes()}
            </g>
        } else {
            return <g></g>
        }
    }
}

export default Polygon;