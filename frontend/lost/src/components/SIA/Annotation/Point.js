import React, {Component} from 'react'
import InfSelectionArea from './InfSelectionArea'
import Node from './Node'
import * as modes from './modes'
import * as transform from '../utils/transform'

class Point extends Component{

    /*************
     * LIFECYCLE *
    **************/
    constructor(props){
        super(props)
        this.state = {
            anno: undefined,
            mode: modes.VIEW
        }
    }

    componentDidMount(prevProps){
        console.log('Component mounted', this.props.data.id)
        if (this.props.mode === modes.CREATE){
            console.log('in Create Pos')
            this.setState({
                mode: modes.VIEW,
                anno: [
                    {x: this.props.data.data.x, y: this.props.data.data.y}
                ]
            })
        } else {
            this.setState({anno: [...this.props.data.data]})
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

    onNodeMouseDown(e, idx){
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
    setMode(mode, selectedNode=undefined){
        if (this.state.mode !== mode){
            if (this.props.onModeChange){
                this.props.onModeChange(mode, this.state.mode)
            }
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

    renderNode(){
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
                            // onMouseUp={(e, idx) => this.onNodeMouseUp(e, idx)}
                            // onMouseMove={(e, idx) => this.onNodeMouseMove(e, idx)}
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
                        // onMouseUp={(e, idx) => this.onNodeMouseUp(e, idx)}
                        />
                })
        }
    }

    renderPoint(){
        return this.state.anno.map((e, idx) => {
            return (
                <circle key={idx} 
                    cx={e.x} 
                    cy={e.y} 
                    r={10} fill="red" 
                    style={this.props.style}
                    className={this.props.className}
                />
            )
        })
            
    }

    render(){
        if (this.state.anno){
            return(
                <g
                    onMouseMove={e => this.onMouseMove(e)}
                    onMouseUp={e => this.onMouseUp(e)}
                >
                    {this.renderPoint()}
                    {this.renderNode()}
                    {this.renderInfSelectionArea()}
                </g>
                )
        } else {
            return <g></g>
        }
    }
}

export default Point;