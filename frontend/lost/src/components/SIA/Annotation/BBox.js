import React, {Component} from 'react'
import './Annotation.scss';
import * as modes from '../types/modes'
import * as transform from '../utils/transform'
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
            selectedNode: undefined,
            mode: modes.VIEW
        }
    }

    componentDidMount(prevProps){
        // console.log('Component mounted', this.props.data.id)
        if (this.props.mode === modes.CREATE){
            console.log('in Create Pos')
            const data = this.props.anno[0]
            this.setState({
                anno: [
                    {x: data.x, y: data.y},
                    {x: data.x+1, y: data.y},
                    {x: data.x+1, y: data.y+1},
                    {x: data.x, y: data.y+1}
                ]
            })
            this.setMode(modes.CREATE, 2)
        } else {
            this.setState({anno: [...this.props.anno]})
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.anno !== this.props.anno){
            this.setState({anno: [...this.props.anno]})
        }
    }

    /*************
    * EVENTS    *
    **************/
    onNodeMouseMove(e, idx){
        switch (this.state.mode){
            case modes.CREATE:
            case modes.EDIT:
                const idxMinus = idx - 1 < 0 ? 3 : idx -1
                const idxPlus = idx + 1 > 3 ? 0 : idx +1
                let newAnno = [...this.state.anno]
                const movementX = e.movementX / this.props.svg.scale
                const movementY = e.movementY / this.props.svg.scale
                if (idx % 2 === 0){
                    newAnno[idxMinus].x += movementX
                    newAnno[idx].x += movementX
                    newAnno[idx].y += movementY
                    newAnno[idxPlus].y += movementY
                } else {
                    newAnno[idxMinus].y += movementY
                    newAnno[idx].x += movementX
                    newAnno[idx].y += movementY
                    newAnno[idxPlus].x += movementX
                }
                this.setState({
                    anno: newAnno
                })
                break
            default:
                break
        }
    }

    onNodeMouseDown(e,idx){
        switch(this.state.mode){
            case modes.VIEW:
                if (e.button === 0){
                    console.log('Node mouse Down', idx)
                    this.setMode(modes.EDIT, idx)
                    // this.setState({selectedNode: idx})
                }
                break
        }
    }

    onNodeMouseUp(e, idx){
        switch(this.state.mode){
            case modes.EDIT:
                if (e.button === 0){
                    this.setMode(modes.VIEW)
                }
                break
            case modes.CREATE:
                if (e.button === 2){
                    this.setMode(modes.VIEW)
                }
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
    /*************
    *  LOGIC     *
    **************/
    setMode(mode, nodeIdx=undefined){
        if (this.state.mode !== mode){
            if (this.props.onModeChange){
                this.props.onModeChange(mode, this.state.mode)
            }
            this.setState({
                mode: mode,
                selectedNode: nodeIdx
            })
        }
    }
    toPolygonStr(data){
        return data.map( (e => {
            return `${e.x},${e.y}`
        })).join(' ')
        
    }

    move(movementX, movementY){
        this.setState({
            anno : transform.move(this.state.anno, movementX, movementY)
        })
    }

    /*************
     * RENDERING *
    **************/

    renderPolygon(){
        switch(this.state.mode){
            case modes.MOVE:
            case modes.EDIT:
            case modes.VIEW:
            case modes.CREATE:
                return <polygon 
                            points={this.toPolygonStr(this.state.anno)}
                            fill='none' stroke="purple" 
                            style={this.props.style}
                            className={this.props.className}
                            onMouseDown={e => this.onMouseDown(e)}
                            onMouseUp={e => this.onMouseUp(e)}
                        />
            default:
                return null 
        }
    }

    renderNodes(){
        if (!this.props.isSelected) return null 
        switch(this.state.mode){
            case modes.MOVE:
                return null
            case modes.EDIT:
            case modes.CREATE:
                return <Node anno={this.state.anno}
                            key={this.state.selectedNode}
                            idx={this.state.selectedNode} 
                            style={this.props.style}
                            className={this.props.className} 
                            isSelected={this.props.isSelected}
                            mode={this.state.mode}
                            svg={this.props.svg}
                            onMouseDown={(e, idx) => this.onNodeMouseDown(e,idx)}
                            onMouseUp={(e, idx) => this.onNodeMouseUp(e, idx)}
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
                        />
                })
        }
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
                {this.renderNodes()}
                {this.renderInfSelectionArea()}
            </g>)
        } else {
            return <g></g>
        }
    }

}

export default BBox;