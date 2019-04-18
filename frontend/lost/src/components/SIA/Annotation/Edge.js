import React, {Component} from 'react'
import * as transform from '../utils/transform'
import './Annotation.scss'



class Edge extends Component{

    constructor(props){
        super(props)
    }

    componentDidUpdate(){
        console.log('Update edge', this.props.idx)
    }
    
    render(){
        let p1, p2
        if (!this.props.closingEdge){
            if (this.props.idx - 1 < 0 ){
                return null
            }
            p1 = this.props.anno[this.props.idx - 1 ]
            p2 = this.props.anno[this.props.idx]
        } else {
            if (this.props.idx === 0) return null
            p1 = this.props.anno[this.props.anno.length-1]
            p2 = this.props.anno[0]
        }
        return(
            <line x1={p1.x} y1={p1.y} 
                x2={p2.x} y2={p2.y} stroke="black"
                style={this.props.style} className={this.props.className}/>
            )
    }
}

export default Edge;