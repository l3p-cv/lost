import React, {Component} from 'react'



class Point extends Component{

    constructor(props){
        super(props)
    }
    
    render(){
        return(
            <g>
            
            <circle cx={520} cy={50} r={10} fill="red" />

            </g>
            )
    }
}

export default Point;