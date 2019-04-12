import React, {Component} from 'react'



class BBox extends Component{

    constructor(props){
        super(props)
    }
    
    render(){
        return(
            <g>
            
            <rect x={this.props.data.x} y={this.props.data.y} 
                width={this.props.data.w} height={this.props.data.h} fill="purple" fillOpacity="0.5"/>
            </g>
            )
    }
}

export default BBox;