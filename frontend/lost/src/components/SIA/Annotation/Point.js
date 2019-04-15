import React, {Component} from 'react'



class Point extends Component{

    constructor(props){
        super(props)
        this.state = {
            anno: undefined
        }
    }
    componentDidMount(){
        this.setState({anno: this.props.data.data})
    }
    render(){
        if (this.state.anno){
            return(
                <circle cx={this.state.anno.x} 
                    cy={this.state.anno.y} 
                    r={10} fill="red" />
                )
        } else {
            return <g></g>
        }
    }
}

export default Point;