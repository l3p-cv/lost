import React, {Component} from 'react'

import Node from './Node'
import Edge from './Edge'

import * as transform from '../utils/transform'
import './Annotation.scss'


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

    //Callback for on NodeClick event
    onNodeClick(e, idx){
        if (this.props.onNodeClick){
            this.props.onNodeClick(e, idx)
        }
    }
    renderNodes(){
        return this.state.anno.map((e, idx) => {
            return <Node anno={this.state.anno} idx={idx} 
                key={idx} style={this.props.style}
                className={this.props.className} 
                onClick={(e, idx) => this.onNodeClick(e, idx)}></Node>
        })
    }

    renderEdges(){
        let edges = this.state.anno.map((e, idx) => {
            return <Edge anno={this.state.anno} 
                idx={idx} key={idx} style={this.props.style}
                className={this.props.className}/>
        })
        edges.push(<Edge anno={this.state.anno} 
            closingEdge={true} key={edges.length}
            style={this.props.style}
            className={this.props.className}/>)
        return edges
    }
    render(){
        if (this.state.anno){
            return(
                <g>
                    <polygon points={this.toPolygonStr(this.state.anno)}
                        fill="purple" fillOpacity="0.5" stroke="purple" 
                        // style={this.props.style}
                        className={this.props.className}/>
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