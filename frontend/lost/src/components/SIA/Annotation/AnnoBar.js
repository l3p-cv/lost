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

    handleClick(e: Event){
        e.preventDefault()
        if (this.props.onClick){
            this.props.onClick(e)
        }
    }
    /*************
     * LOGIC     *
     *************/
    setPosition(){
        // console.log('AnnoBar set Position', this.props.anno, this.props.mode)
        // const center = transform.getCenter(this.props.anno.data, this.props.anno.type)
        // const top = center.y
        // const left = center.x 
        // if (this.state.top !== top || this.state.left !== left){  
        //     this.setState({
        //         top,
        //         left
        //     })
        // }
        let topPoint = transform.getTopPoint(this.props.anno.data)
        topPoint = transform.getMonstLeftPoint(topPoint)[0]
        // const inputRect = this.inputGroupRef.current.getBoundingClientRect()
        let top = topPoint.y
        let left = topPoint.x + 10
        if (top < 0) top = topPoint.y + 10
        if (this.state.top !== top || this.state.left !== left){  
            this.setState({
                top,
                left,
                // width: annoBox[1].x - annoBox[0].x
            })
        }
    }

    /*************
     * RENDERING *
    **************/


    render(){
        let label = ''
        if (this.props.anno.labelIds && this.props.anno.labelIds.length > 0){
            console.log('AnnoBar',this.props.anno)
            let labelObject 
            this.props.anno.labelIds.forEach((lbl, idx) => {
                labelObject = this.props.possibleLabels.find(el => {
                    return el.id === lbl
                })
                if (idx > 0) label += ', '
                label += labelObject.label
            })
        } else {
            label = 'no label'
        }
        switch(this.props.mode){
            case modes.VIEW:
                return (<g>
                    {/* <rect x={this.state.x} y={this.state.y} width="50" height="20"/> */}
                    <text x={this.state.left} y={this.state.top} 
                        fill="white"
                        onClick={e => this.handleClick(e)}
                    > 
                        {label}
                    </text>
                    </g>
                )
            default:
                return null
        }
        
    }
    
}

export default AnnoBar