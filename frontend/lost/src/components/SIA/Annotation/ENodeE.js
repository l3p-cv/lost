import React, {Component} from 'react'

import Node from './Node'
import Edge from './Edge'

import './Annotation.scss'



class ENodeE extends Component{

    /*************
     * LIFECYCLE *
    **************/
    constructor(props){
        super(props)
        this.state = {
            anno: undefined
        }
    }

    componentDidMount(){
        this.setState({
            anno: [...this.props.anno]
        })
    }

    componentDidUpdate(prevProps){
        console.log('ENodeE update', this.props.idx)
        if (prevProps.anno !== this.props.anno){
            this.updateAnno(this.props.anno)
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

    onNodeMouseMove(e, idx, myAnno){
        if (this.props.onNodeMouseMove){
            this.props.onNodeMouseMove(e, idx)
        }
    }

    onNodeMouseUp(e, idx){
        if (this.props.onNodeMouseUp){
            this.props.onNodeMouseUp(e, idx)
        }
    }

    onNodeAnnoUpdate(e, idx, newAnno){
        this.updateAnno(newAnno)
        if (this.props.onNodeAnnoUpdate){
            this.props.onNodeAnnoUpdate(e, idx, newAnno)
        }

    }

    onNodeDoubleClick(e, idx){
        if (this.props.onNodeDoubleClick){
            this.props.onNodeDoubleClick(e, idx)
        }
    }

    // onNodeAnnoUpdate(e, idx, newAnno){
    //     this.updateAnno(newAnno)
    // }
    

    updateAnno(newAnno){
        switch (this.props.mode){
            case 'create':
                this.setState({
                    anno: [...newAnno]
                })
            default:
                break
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
                // onMouseDown={(e,idx, myAnno) => this.onNodeAnnoUpdate(e, idx, myAnno)}
                onDoubleClick={(e, idx) => this.onNodeDoubleClick(e, idx)}
                onAnnoUpdate={(e, idx, newAnno) => this.onNodeAnnoUpdate(e, idx, newAnno)}
                isSelected={this.props.isSelected}
                mode={this.props.mode}
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
        return <Edge anno={this.state.anno} 
                idx={this.props.idx} style={this.props.style}
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
                    {this.renderClosingEdge()}
                    {this.renderNode()}
                </g>
                )
    }
}

export default ENodeE;