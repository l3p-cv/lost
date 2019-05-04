import React, {Component} from 'react'

import Node from './Node'
import Edge from './Edge'

import './Annotation.scss'
import * as modes from './modes'
import * as mouse from '../utils/mouse'


class ENodeE extends Component{

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

    componentDidMount(){
        console.log('ENodeE did mount, ', this.props.idx, this.props.mode)
        this.setState({
            anno: [...this.props.anno],
            mode: this.props.mode
        })
    }

    componentDidUpdate(prevProps){
        if (prevProps.anno !== this.props.anno){
            this.setState({anno: [...this.props.anno]})
        }
        if (prevProps.mode !== this.props.mode){
            this.setState({mode:this.props.mode})
        }
    }

    /*************
     * EVENTS    *
    **************/
    onNodeClick(e, idx){
        if (this.props.onNodeClick){
            this.props.onNodeClick(e, idx)
        }

    }

    onNodeMouseDown(e, idx){
        switch (this.state.mode){
            case modes.CREATE:
                if (e.button == 2){
                    // if (this.props.onFinalAnnoUpdate){
                    //     this.props.onFinalAnnoUpdate(
                    //         e, this.props.idx, this.state.anno
                    //     )
                    // }
                    if (this.props.onNodeFinalAnnoUpdate){
                        this.props.onNodeFinalAnnoUpdate(
                            e, idx, this.state.anno
                        )
                    }
                }
            case modes.VIEW:
                if (e.button == 0){
                    if (this.props.isSelected){
                        this.setMode(modes.EDIT)
                    }
                }
            default:
                break
        }
    }

    onNodeMouseUp(e, idx){
        switch (this.state.mode){
            case modes.EDIT:
                if (e.button === 0){
                    this.setMode(modes.VIEW)
                }
                break
            default:
                break
        }
        if (this.props.onNodeMouseUp){
            this.props.onNodeMouseUp(e, idx)
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
        if (this.props.onNodeMouseMove){
            this.props.onNodeMouseMove(e, idx)
        }
    }

    // onNodeAnnoUpdate(e, idx, newAnno){
    //     this.updateAnno(newAnno)
    //     // if (this.props.onNodeAnnoUpdate){
    //     //     this.props.onNodeAnnoUpdate(e, idx, newAnno)
    //     // }

    // }

    // onNodeFinalAnnoUpdate(e, idx, newAnno){
    //     if (this.props.onNodeFinalAnnoUpdate){
    //         this.props.onNodeFinalAnnoUpdate(e, idx, newAnno)
    //     }

    // }

    onNodeDoubleClick(e, idx){
        if (this.props.onNodeDoubleClick){
            this.props.onNodeDoubleClick(e, idx)
        }
    }

    // onNodeAnnoUpdate(e, idx, newAnno){
    //     this.updateAnno(newAnno)
    // }
    

    /*************
     *   LOGIC   *
    **************/
    // updateAnno(newAnno){
    //     switch (this.props.mode){
    //         case modes.CREATE:
    //             this.setState({
    //                 anno: [...newAnno]
    //             })
    //         default:
    //             break
    //     }
    // }
    updateAnnoByMousePos(e, idx){
        const mousePos = mouse.getMousePosition(e, this.props.svg)
        let newAnno = [...this.state.anno]
        newAnno[idx].x = mousePos.x
        newAnno[idx].y = mousePos.y
        this.setState({
            anno: newAnno
        })
        if (this.props.onAnnoUpdate){
            this.props.onAnnoUpdate(e, idx, newAnno)
        }
    }

    setMode(mode){
        if (this.state.mode !== mode){
            this.setState({mode: mode})
            console.log('Changed mode to!!! ',mode)
        }
    }

    /*************
     * RENDERING *
    **************/
    renderNode(){
        if (!this.props.draw.node){
            return null
        }
        return (
            <Node anno={this.props.anno} idx={this.props.idx} 
                style={this.props.style}
                className={this.props.className} 
                onClick={(e, idx) => this.onNodeClick(e, idx)}
                onMouseMove={(e, idx) => this.onNodeMouseMove(e, idx)}
                onMouseUp={(e,idx) => this.onNodeMouseUp(e, idx)}
                onMouseDown={(e,idx) => this.onNodeMouseDown(e, idx)}
                onDoubleClick={(e, idx) => this.onNodeDoubleClick(e, idx)}
                onAnnoUpdate={(e, idx, newAnno) => this.onNodeAnnoUpdate(e, idx, newAnno)}
                onFinalAnnoUpdate={(e, idx, newAnno) => this.onNodeFinalAnnoUpdate(e, idx, newAnno)}
                isSelected={this.props.isSelected}
                mode={this.state.mode}
                svg={this.props.svg}
                />
        )
    }
    renderConnectedEdge(){
        if (!this.props.draw.connectedEdge){
            return null
        }
        if (!this.state.anno){
            return null
        }
        return<Edge anno={this.state.anno} 
                idx={this.props.idx} style={this.props.style}
                className={this.props.className}
                isSelected={this.props.isSelected}                
                />
                
    }

    renderNextConnectedEdge(){
        //Next connected Edge should only be rendered in edit mode.
        if (!this.props.draw.connectedEdge){
            return null
        }
        if (!this.state.anno){
            return null
        }
        if (this.state.mode !== modes.EDIT){
            return null
        }
        return<Edge anno={this.state.anno} 
                idx={this.props.idx+1} style={this.props.style}
                className={this.props.className}
                isSelected={this.props.isSelected}                
                />
                
    }

    renderClosingEdge(){
        if (!this.props.draw.closingEdge){
            return null
        }
        if (!this.state.anno){
            return null
        }
        return <Edge anno={this.state.anno} 
                idx={this.props.idx} style={this.props.style}
                className={this.props.className}
                isSelected={this.props.isSelected}
                closingEdge={true}                
                />
    }
    render(){
            return(
                <g>
                    {this.renderConnectedEdge()}
                    {this.renderNextConnectedEdge()}
                    {this.renderClosingEdge()}
                    {this.renderNode()}
                </g>
                )
    }
}

export default ENodeE;