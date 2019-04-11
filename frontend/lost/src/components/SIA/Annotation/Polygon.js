import React, {Component} from 'react'



class Polygon extends Component{

    constructor(props){
        super(props)
    }
    
    render(){
        return(
            <g>
            <polygon points="100,100 150,25 150,75 200,0"
            fill="none" stroke="red" />
            </g>
            )
    }
}

export default Polygon;