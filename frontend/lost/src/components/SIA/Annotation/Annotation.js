import React, {Component} from 'react'

import Point from './Point'
import BBox from './BBox'
import Line from './Line'
import Polygon from './Polygon'


class Annotation extends Component{

    constructor(props){
        super(props)
    }
    
    render(){
        console.log(this.props.annoType)
        switch(this.props.annoType) {
            case 'point':
                return <Point ></Point>
            case 'bBox':
                return <BBox></BBox>
            case 'polygon':
                return <Polygon></Polygon>
            case 'line':
                return <Line></Line>
            default:
                console.log("Wrong annoType for annotations: ",
                    this.props.annoType)
        } 
    }
}

export default Annotation;