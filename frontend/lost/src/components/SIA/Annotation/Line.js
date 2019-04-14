import React, {Component} from 'react'
import * as transform from '../utils/transform'



class Line extends Component{

    constructor(props){
        super(props)
        this.state = {
            anno: undefined
        }
    }
    componentDidMount(){
        this.setState({anno: [...this.props.data.data]})
    }

    move(movementX, movementY){
        this.setState({
            anno : transform.move(this.state.anno, movementX, movementY)
        })
    }
    
    toPolylineStr(data){
        return data.map( (e => {
            return `${e.x},${e.y}`
        })).join(' ')
        
    }
    render(){
        if (this.state.anno){
        return(
            <polyline points={this.toPolylineStr(this.state.anno)} stroke='red' fill="none" strokeWidth="5"/>
            )
        }
        return <g></g>
    }
}

export default Line;