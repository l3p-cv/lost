import React, {Component} from 'react'



class Line extends Component{

    constructor(props){
        super(props)
    }
    
    render(){
        return(
            <g>
            
            <line x1="0" y1="0" x2="200" y2="200" stroke='red'/>
            </g>
            )
    }
}

export default Line;