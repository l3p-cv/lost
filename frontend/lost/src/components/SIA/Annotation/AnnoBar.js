import React, {Component} from 'react'
import * as transform from '../utils/transform'
import * as modes from '../types/modes'

class AnnoBar extends Component{

    constructor(props){
        super(props)
        this.state = {
            top: 0,
            left: 0
        }
    }
    
    /*************
     * EVENTS    *
    **************/
    componentWillMount(){
        if (this.props.mode !== modes.CREATE) this.setPosition()
    }

    componentDidUpdate(){
        if (this.props.mode !== modes.CREATE){
           this.setPosition()
        }    
    }
    /*************
     * LOGIC     *
     *************/
    setPosition(){
        console.log('AnnoBar set Position', this.props.anno, this.props.mode)
        const center = transform.getCenter(this.props.anno.data, this.props.anno.type)
        const top = center.y
        const left = center.x 
        if (this.state.top !== top || this.state.left !== left){  
            this.setState({
                top,
                left
            })
        }
    }

    /*************
     * RENDERING *
    **************/


    render(){
        let label = 'no label'
        if (this.props.anno.labelIds && this.props.anno.labelIds.length > 0){
            console.log('AnnoBar',this.props.anno)
            const labelObj = this.props.possibleLabels.find(el => {
                return el.id === this.props.anno.labelIds[0]
            })
            if (labelObj) label = labelObj.label
        }
        switch(this.props.mode){
            case modes.VIEW:
                return (
                    <text x={this.state.left} y={this.state.top} fill="white"> 
                        {label}
                    </text>
                )
            default:
                return null
        }
        
    }
    
}

export default AnnoBar