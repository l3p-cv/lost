import React, {Component} from 'react'
import './Annotation.scss'



class Edge extends Component{

    constructor(props){
        super(props)
        this.state = {
            haloCss: 'node-halo-off'
        }
    }

    componentDidUpdate(){
    }
    
    onMouseOver(e){
        if (this.props.isSelected){
            this.setState({haloCss: 'node-halo-on'})
        }
    }

    onMouseLeave(e){
        if (this.props.isSelected){
            this.setState({haloCss: 'node-halo-off'})
        }
    }

    onMouseDown(e){
        if (this.props.onMouseDown){
            this.props.onMouseDown(e, this.props.idx)
        }
    }

    onMouseUp(e){
        e.stopPropagation()
    }

    render(){
        let p1, p2
        if (!this.props.closingEdge){
            if (this.props.idx - 1 < 0 ){
                return null
            }
            if (this.props.idx > this.props.anno.length - 1){
                return null
            }
            p1 = this.props.anno[this.props.idx - 1 ]
            p2 = this.props.anno[this.props.idx]
        } else {
            if (this.props.idx === 0 && this.props.anno.length === 1) return null
            p1 = this.props.anno[this.props.anno.length-1]
            p2 = this.props.anno[0]
        }
        return(<g
            onMouseOver={(e) => {this.onMouseOver(e)}}
            onMouseLeave={e => {this.onMouseLeave(e)}}
            
        >
            <line x1={p1.x} y1={p1.y} 
                x2={p2.x} y2={p2.y} stroke="black"
                // style={this.props.style} 
                strokeWidth={this.props.style.strokeWidth*3}
                className={this.state.haloCss}
                onMouseOver={(e) => {this.onMouseOver(e)}}
                onMouseDown={e => this.onMouseDown(e)}
                onMouseUp={e => this.onMouseUp(e)}
                />
            <line x1={p1.x} y1={p1.y} 
                x2={p2.x} y2={p2.y} stroke="black"
                style={this.props.style} 
                className={this.props.className}
                onMouseDown={e => this.onMouseDown(e)}
                onMouseUp={e => this.onMouseUp(e)}
                />
                </g>
            )
    }
}

export default Edge;