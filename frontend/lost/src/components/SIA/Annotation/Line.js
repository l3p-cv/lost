import React, {Component} from 'react'



class Line extends Component{

    constructor(props){
        super(props)
    }
    
    toPolylineStr(){
        return this.props.data.map( (e => {
            return `${e.x},${e.y}`
        })).join(' ')
        
    }
    render(){
        return(
            <polyline points={this.toPolylineStr()} stroke='red' fill="none"/>
            )
    }
}

export default Line;