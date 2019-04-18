import React, {Component} from 'react'

import Node from './Node'

import './Annotation.scss'
import './Node.scss'



class ENodeE extends Component{

    /*************
     * LIFECYCLE *
    **************/
    constructor(props){
        super(props)
        this.state = {
            haloCss: 'halo-off',
            selAreaCss: 'sel-area-off',
            anno: undefined
        }
    }

    onNodeClick(e, idx){
        if (this.props.onNodeClick){
            this.props.onNodeClick(e, idx)
        }

    }

    onNodeMouseMove(e, idx){
        if (this.props.onNodeMouseMove){
            this.props.onNodeMouseMove(e, idx)
        }
    }

    onNodeMouseUp(e, idx){
        if (this.props.onNodeMouseUp){
            this.props.onNodeMouseUp(e, idx)
        }
    }

    onNodeMouseDown(e, idx, myAnno){
        if (this.props.onNodeMouseDown){
            this.props.onNodeMouseDown(e, idx, myAnno)
        }

    }

    onNodeDoubleClick(e, idx){
        if (this.props.onNodeDoubleClick){
            this.props.onNodeDoubleClick(e, idx)
        }
    }
    

    /*************
     * RENDERING *
    **************/
    renderNode(){
        return (
            <Node anno={this.props.anno} idx={this.props.idx} 
                key={this.props.idx} style={this.props.style}
                className={this.props.className} 
                onClick={(e, idx) => this.onNodeClick(e, idx)}
                onMouseMove={(e, idx) => this.onNodeMouseMove(e, idx)}
                onMouseUp={(e,idx) => this.onNodeMouseUp(e, idx)}
                onMouseDown={(e,idx, myAnno) => this.onNodeMouseDown(e, idx, myAnno)}
                onDoubleClick={(e, idx) => this.onNodeDoubleClick(e, idx)}
                isSelected={this.props.isSelected}
                mode={this.props.mode}
            />
        )
    }
    render(){
            return(
                <g>
                    {this.renderNode()}
                </g>
                )
    }
}

export default ENodeE;