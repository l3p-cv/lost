import React, {Component} from 'react'
import './Annotation.scss'
import './Node.scss'



class Node extends Component{

    constructor(props){
        super(props)
        this.state = {
            haloCss: 'halo-off'
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

    onMouseDown(e: Event){
        if (this.props.onMouseDown){
            this.props.onMouseDown(e, this.props.idx)
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

    onDoubleClick(e){
        if (this.props.onDoubleClick){
            this.props.onDoubleClick(e, this.props.idx)
        }
    }

    turnHaloOn(){
        this.setState({
            haloCss: 'halo-on'
        })
    }

    turnHaloOff(){
        this.setState({
            haloCss: 'halo-off'
        })
    }
    render(){
        const data = this.props.anno[this.props.idx]
            return(
                <g onClick={(e) => this.onClick(e)}
                    onMouseMove={e => this.onMouseMove(e)}
                    onContextMenu={e => this.onContextMenu(e)}
                    onMouseUp={e => this.onMouseUp(e)}
                    onMouseDown={e => this.onMouseDown(e)}
                    onMouseLeave={e => this.onMouseLeave(e)}
                    onDoubleClick={e => this.onDoubleClick(e)}
                >
                    <circle cx={data.x} cy={data.y} r={30}
                        className={this.state.haloCss}
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