import React, {Component} from 'react'
import InfSelectionArea from './InfSelectionArea'
import Node from './Node'
import * as modes from '../types/modes'
import * as transform from '../utils/transform'
import * as canvasActions from '../types/canvasActions'

class Point extends Component{

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
                    {x: data.x, y: data.y}
                ],
                selectedNode: 0
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
                    this.requestModeChange(this.state.anno, modes.VIEW)
                    this.performedAction(this.state.anno, canvasActions.ANNO_MOVED)
                }
                break
            case modes.CREATE:
                this.requestModeChange(this.state.anno, modes.VIEW)

                this.performedAction(this.state.anno, canvasActions.ANNO_CREATED)
                break
            default:
                break
        }
    }

    onNodeMouseDown(e, idx){
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
    
    performedAction(anno, pAction){
        if (this.props.onAction){
            this.props.onAction(anno, pAction)
        }
    }

    requestModeChange(anno, mode){
        this.props.onModeChangeRequest(anno, mode)
    }

    move(movementX, movementY){
        this.setState({
            anno : {
                ...this.state.anno,
                data: transform.move(this.state.anno.data, movementX, movementY)
            }
        })
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

    renderNode(){
        if (!this.props.isSelected) return null 
        switch(this.state.anno.mode){
            case modes.EDIT_LABEL:
            case modes.MOVE:
                return null
            case modes.EDIT:
            case modes.CREATE:
                return <Node anno={this.state.anno.data}
                            key={this.state.selectedNode}
                            idx={this.state.anno.selectedNode} 
                            style={this.props.style}
                            className={this.props.className} 
                            isSelected={this.props.isSelected}
                            mode={this.state.anno.mode}
                            svg={this.props.svg}
                            onMouseDown={(e, idx) => this.onNodeMouseDown(e,idx)}
                            isPoint={true}
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
                        isPoint={true}
                        />
                })
        }
    }

    renderPoint(){
        return this.state.anno.data.map((e, idx) => {
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
            return null
        }
    }
}

export default Point;