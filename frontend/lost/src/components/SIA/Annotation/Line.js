import React from 'react'
import Polygon from './Polygon'
import Edge from './Edge'

import * as modes from '../types/modes'



class Line extends Polygon{

    /*************
    *  RENDERING *
    **************/

    renderEdges(){
        if (!this.props.isSelected) return null
        switch (this.state.anno.mode){
            case modes.VIEW:
            case modes.ADD:
                return this.state.anno.data.map((e, idx) => {
                    return <Edge anno={this.state.anno.data} 
                        idx={idx} key={idx} style={this.props.style}
                        className={this.props.className}
                        isSelected={this.props.isSelected}
                        onMouseDown={(e, idx) => {this.onEdgeMouseDown(e, idx)}}                
                        />
                })
            default:
                return null
        }
    }

    renderPolyline(){
        return <polyline points={this.toPolygonStr(this.state.anno.data)}
            fill='none' stroke="purple" 
            style={{...this.props.style, fill:'none'}}
            className={this.props.className}
        />
    }
    render(){
        if (this.state.anno){
            return (
                <g
                    onMouseMove={e => this.onMouseMove(e)}
                    onMouseUp={e => this.onMouseUp(e)}
                    onMouseDown={e => this.onMouseDown(e)}
                >
                    {this.renderPolyline()}
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

export default Line;