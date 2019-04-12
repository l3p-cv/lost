import React, {Component} from 'react'

import Point from './Point'
import BBox from './BBox'
import Line from './Line'
import Polygon from './Polygon'


class Annotation extends Component{

    constructor(props){
        super(props)
        this.state = {
            selected: false,
            readyToMove: false
        }
        this.myAnno = React.createRef()
    }
    
    onClick(e: Event){
        e.stopPropagation()
        console.log('Clicked on: ', this.props.type)
        this.setState({selected : true})
    }
    onMouseDown(e: Event){
        this.setState({readyToMove: true})
    }
    onMouseUp(e: Event){
        this.setState({readyToMove: false})
    }
    onMouseOut(e: Event){
        this.setState({readyToMove: false})
    }

    onMouseMove(e: Event){
        if (this.state.readyToMove){
            this.myAnno.current.move(e.movementX, e.movementY)
        }
    }

    renderAnno(){
        const type = this.props.type
        const data = this.props.data ? this.props.data.data : undefined
        switch(type) {
            case 'point':
                return <Point ref={this.myAnno} data={data}></Point>
            case 'bBox':
                return <BBox ref={this.myAnno} data={data} ></BBox>
            case 'polygon':
                return <Polygon ref={this.myAnno} data={data}></Polygon>
            case 'line':
                return <Line ref={this.myAnno} data={data}></Line>
            default:
                console.log("Wrong annoType for annotations: ",
                    this.props.annoType)
        } 
    }
    render(){
        return (
            <g 
                onClick={e => this.onClick(e)}
                onMouseDown={e => {this.onMouseDown(e)}}
                onMouseUp={e => {this.onMouseUp(e)}}
                onMouseMove={e => {this.onMouseMove(e)}}
                onMouseOut={e => {this.onMouseOut(e)}}
            >
                {this.renderAnno()}
            </g>
        )
        
    }
}

export default Annotation;