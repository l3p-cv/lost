import React, {Component} from 'react'



class BBox extends Component{

    constructor(props){
        super(props)
        this.state = {
            selected: false,
            mouseDown: false,
            anno: undefined
        }
    }
    componentDidMount(){
        this.setState({anno: {...this.props.data}})
    }
    onClick(e: Event){
        e.stopPropagation()
        this.setState({selected : true})
    }
    onMouseDown(e: Event){
        this.setState({mouseDown: true})
    }
    onMouseUp(e: Event){
        this.setState({mouseDown: false})
    }
    onMouseMove(e: Event){
        if (this.state.mouseDown){
            console.log('Mouse is moving on Box:-)', e.movementX, e.movementY)
            this.setState({
                anno : {
                    ...this.state.anno, 
                    x: this.state.anno.x + e.movementX,
                    y: this.state.anno.y + e.movementY
                }
            })
        }
    }
    
    render(){
        if (this.state.anno){
            return(
                <rect x={this.state.anno.x} y={this.state.anno.y} 
                    width={this.state.anno.w} height={this.state.anno.h} 
                    fill="purple" fillOpacity="0.5"
                    onClick={e => {this.onClick(e)}}
                    onMouseDown={e => {this.onMouseDown(e)}}
                    onMouseUp={e => {this.onMouseUp(e)}}
                    onMouseMove={e => {this.onMouseMove(e)}}
                />
                )
        }
        return <g></g>
    }
}

export default BBox;