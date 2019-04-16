import React, {Component} from 'react'
import './Annotation.scss'



class Node extends Component{

    constructor(props){
        super(props)
    }

    onClick(e){
        if (this.props.onClick){
            this.props.onClick(e, this.props.idx)
        }
    }

    onMouseMove(e){
        if (this.props.onMouseMove){
            this.props.onMouseMove(e, this.props.idx)
        }
    }

    onContextMenu(e: Event){
        e.preventDefault()
    }

    onMouseUp(e: Event){
        if (this.props.onMouseUp){
            this.props.onMouseUp(e, this.props.idx)
        }
    }

    render(){
        const data = this.props.anno[this.props.idx]
            return(
                <circle cx={data.x} 
                    cy={data.y} 
                    r={5} fill="red"
                    style={this.props.style}
                    className={this.props.className} 
                    onClick={(e) => this.onClick(e)}
                    onMouseMove={e => this.onMouseMove(e)}
                    onContextMenu={e => this.onContextMenu(e)}
                    onMouseUp={e => this.onMouseUp(e)}
                />
                )
    }
}

export default Node;