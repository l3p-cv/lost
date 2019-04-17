import React, {Component} from 'react'
import './Annotation.scss'



class Node extends Component{

    constructor(props){
        super(props)
        this.state = {
            haloStyle: {
                fill: 'none'
            }

        }
    }

    onClick(e){
        this.turnHaloOn()
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
    onMouseEnter(e: Event){
        if (this.props.isSelected){
            this.turnHaloOn()
        }
    }

    onMouseLeave(e){
        if (this.props.isSelected){
            this.turnHaloOff()
        }
    }

    turnHaloOn(){
        this.setState({
            haloStyle:{
                fill: 'orange',
                fillOpacity: 0.5
            }
        })
    }

    turnHaloOff(){
        this.setState({
            haloStyle: {
                fill: 'none'
            }
        })
    }
    render(){
        const data = this.props.anno[this.props.idx]
            return(
                <g onClick={(e) => this.onClick(e)}
                    onMouseMove={e => this.onMouseMove(e)}
                    onContextMenu={e => this.onContextMenu(e)}
                    onMouseUp={e => this.onMouseUp(e)}
                    onMouseLeave={e => this.onMouseLeave(e)}
                >
                    <circle cx={data.x} cy={data.y} r={20}
                        style={this.state.haloStyle}
                    />
                    <circle cx={data.x} 
                        cy={data.y} 
                        r={5} fill="red"
                        style={this.props.style}
                        className={this.props.className}
                        onMouseEnter={e => this.onMouseEnter(e)}
                    />
                </g>
                )
    }
}

export default Node;