import React, {Component} from 'react'
import Polygon from './Polygon'
import Edge from './Edge'

import * as transform from '../utils/transform'
import * as modes from './modes'



class Line extends Polygon{

    /*************
    *  RENDERING *
    **************/

    renderEdges(){
        if (!this.props.isSelected) return null
        switch (this.state.mode){
            case modes.VIEW:
            case modes.ADD:
                return this.state.anno.map((e, idx) => {
                    return <Edge anno={this.state.anno} 
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
        console.log('line style', this.props.style)
        console.log('line className', this.props.className)
        return <polyline points={this.toPolygonStr(this.state.anno)}
            fill='none' stroke="purple" 
            style={{...this.props.style, fill:'none'}}
            className={this.props.className}
        />
    }
    render(){
        if (this.state.anno){
            return <g>
                {this.renderPolyline()}
                {this.renderEdges()}
                {this.renderNodes()}
            </g>
        } else {
            return <g></g>
        }
    }
}

export default Line;