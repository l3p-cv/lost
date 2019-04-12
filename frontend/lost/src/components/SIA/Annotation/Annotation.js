import React, {Component} from 'react'

import Point from './Point'
import BBox from './BBox'
import Line from './Line'
import Polygon from './Polygon'


class Annotation extends Component{

    constructor(props){
        super(props)
        this.myAnno = React.createRef()
    }
    
    render(){
        console.log(this.props.type)
        const type = this.props.type
        const data = this.props.data.data
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
}

export default Annotation;