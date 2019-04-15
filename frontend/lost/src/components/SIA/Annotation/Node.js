import React, {Component} from 'react'



class Node extends Component{

    constructor(props){
        super(props)
    }

    render(){
        const data = this.props.anno[this.props.idx]
            return(
                <circle cx={data.x} 
                    cy={data.y} 
                    r={5} fill="red" />
                )
    }
}

export default Node;