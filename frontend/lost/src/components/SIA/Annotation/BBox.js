import React, {Component} from 'react'



class BBox extends Component{

    constructor(props){
        super(props)
    }
    
    render(){
        return(
            <g>
            
            <rect x="600" y="300" width="50" height="50" fill="purple" />
            <text x="600" y="325" stroke='red'>Hello</text>
            </g>
            )
    }
}

export default BBox;