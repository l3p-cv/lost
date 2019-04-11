import React, {Component} from 'react'



class Point extends Component{

    constructor(props){
        super(props)
    }
    
    render(){
        return(
            <g>
            
            <circle onClick={(e)=>{console.log("Point",e.pageX, e.pageY)}}cx={520} cy={50} r={10} fill="red" />

            </g>
            )
    }
}

export default Point;