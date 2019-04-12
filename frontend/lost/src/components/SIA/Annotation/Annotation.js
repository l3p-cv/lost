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
        console.log(this.props.type)
        const type = this.props.type
        const data = this.props.data.data
        switch(this.props.type) {
            case 'point':
                return <Point ></Point>
            case 'bBox':
                return <BBox data={data} ></BBox>
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