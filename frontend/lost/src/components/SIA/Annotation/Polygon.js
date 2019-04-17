import React, {Component} from 'react'

import Node from './Node'
import Edge from './Edge'

import * as transform from '../utils/transform'
import './Annotation.scss'


class Polygon extends Component{

    constructor(props){
        super(props)
        this.state = {
            anno: undefined,
            mode: 'show'
        }
    }

    componentDidMount(){
        if (this.props.data.createMode){
            console.log('in Create Pos')
            this.setState({
                mode:'create',
                anno: [
                    {x: this.props.data.data.x, y: this.props.data.data.y},
                    {x: this.props.data.data.x+1, y: this.props.data.data.y}
                ]
            })
        } else {
            this.setState({anno: [...this.props.data.data]})
        }
    }

    componentDidUpdate(){
        console.log('Update polygon')
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

    onNodeMouseMove(e, idx){
        switch (this.state.mode){
            case 'create':
                let newAnno = [...this.state.anno]
                newAnno[idx].x += e.movementX
                newAnno[idx].y += e.movementY
                this.setState({
                    anno: newAnno
                })
            default:
                break
        }
    }

    onNodeMouseUp(e, idx){
        console.log('NodeMouseUP ', idx, e.movementX, e.movementY )        
    }

    onNodeMouseDown(e, idx){
        if (e.button == 2){
            switch (this.state.mode){
                case 'create':
                    let newAnno = [...this.state.anno]
                    newAnno.push({
                        x: newAnno[idx].x,
                        y: newAnno[idx].y
                    })
                    this.setState({
                        anno: newAnno
                    })
                default:
                    break
            }    
        }   
        
    }

    onNodeDoubleClick(e, idx){
        switch (this.state.mode){
            case 'create':
                this.setState({
                    mode: 'show'
                })
            default:
                break
        }
    }

    renderNodes(){
        return this.state.anno.map((e, idx) => {
            return <Node anno={this.state.anno[idx]} idx={idx} 
                key={idx} style={this.props.style}
                className={this.props.className} 
                onClick={(e, idx) => this.onNodeClick(e, idx)}
                onMouseMove={(e, idx) => this.onNodeMouseMove(e, idx)}
                onMouseUp={(e,idx) => this.onNodeMouseUp(e, idx)}
                onMouseDown={(e,idx) => this.onNodeMouseDown(e, idx)}
                onDoubleClick={(e, idx) => this.onNodeDoubleClick(e, idx)}
                isSelected={this.props.isSelected}
            />
        })
    }

    renderEdges(){
        let edges = this.state.anno.map((e, idx) => {
            return <Edge anno={this.state.anno} 
                idx={idx} key={idx} style={this.props.style}
                className={this.props.className}
                isSelected={this.props.isSelected}                
                />
        })
        edges.push(<Edge anno={this.state.anno} 
            closingEdge={true} key={edges.length}
            style={this.props.style}
            className={this.props.className}
            isSelected={this.props.isSelected}
            />)
        return edges
    }
    render(){
        if (this.state.anno){
            return(
                <g onKeyPress={e => this.onKeyPress(e)}>
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