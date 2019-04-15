import React, {Component} from 'react'

import Node from './Node'
import Edge from './Edge'

import * as transform from '../utils/transform'


class Polygon extends Component{

    constructor(props){
        super(props)
        this.state = {
            anno: undefined
        }
    }

    componentDidMount(){
        this.setState({anno: [...this.props.data.data]})
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

    renderNodes(){
        return this.state.anno.map((e, idx) => {
            return <Node anno={this.state.anno} idx={idx} key={idx}></Node>
        })
    }

    renderEdges(){
        let edges = this.state.anno.map((e, idx) => {
            return <Edge anno={this.state.anno} idx={idx} key={idx}/>
        })
        edges.push(<Edge anno={this.state.anno} closingEdge={true} key={edges.length}/>)
        return edges
    }
    render(){
        if (this.state.anno){
            return(
                <g>
                    <polygon points={this.toPolygonStr(this.state.anno)}
                        fill="purple" fillOpacity="0.5" stroke="purple" 
                        style={this.props.style}/>
                    {this.renderEdges()}
                    {this.renderNodes()}
                </g>
                )
        } else {
            return <g></g>
        }
    }
}

export default Polygon;