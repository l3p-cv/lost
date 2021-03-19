import React, {Component} from 'react'
import * as transform from '../utils/transform'
import * as modes from '../types/modes'

const defaultFontSize = 10
const defaultRectHeight = 15

class AnnoBar extends Component{

    constructor(props){
        super(props)
        this.state = {
            top: 0,
            left: 0,
            width: 50,
            height: defaultRectHeight,
            fontSize:defaultFontSize,
        }
        this.textRef = React.createRef()
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
        topPoint = transform.getMostLeftPoint(topPoint)[0]
        if (this.textRef.current){
            const text = this.textRef.current.getBoundingClientRect()
            const textPadding = 2
            let rectWidth = (text.width + textPadding)/this.props.svg.scale
            if (rectWidth !== this.state.width){
                this.setState({
                    width: rectWidth,
                    fontSize: Math.ceil(defaultFontSize/this.props.svg.scale),
                    // height: Math.ceil(defaultFontSize/this.props.svg.scale)
                })
            }
        }
        let top = topPoint.y - 10 
        let left = topPoint.x + 7
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
        if (!this.props.possibleLabels) return null
        let labelObject 
        if (this.props.anno.labelIds && this.props.anno.labelIds.length > 0){
            this.props.anno.labelIds.forEach((lbl, idx) => {
                labelObject = this.props.possibleLabels.find(el => {
                    return el.id === lbl
                })
                if (idx > 0) label += ', '
                label += labelObject.label
            })
        } else {
            if (this.props.defaultLabel){
                if (Number.isInteger(this.props.defaultLabel)){
                    labelObject = this.props.possibleLabels.find(el => {
                        return el.id === this.props.defaultLabel
                    })
                    label = labelObject.label
                } else {
                    label = this.props.defaultLabel
                }
            } else {
                label = 'no label'
            }
        }
        switch(this.props.mode){
            case modes.VIEW:
                return (<g>
                    <rect x={this.state.left} y={this.state.top - 6} 
                        width={this.state.width} height={this.state.height} rx="5" 
                        opacity='0.5'
                        style={this.props.style}
                        />
                    <text x={this.state.left} y={this.state.top} 
                        fill="white"
                        onClick={e => this.handleClick(e)}
                        textAnchor="start"
                        alignmentBaseline="central"
                        ref={this.textRef} 
                        fontSize={this.state.fontSize+"pt"}
                        // textLength="50"
                        // style={{...this.props.style, strokeWidth:1}}
                    > 
                        {label}
                    </text>
                    {/* This second rect is to prevent text from getting marked */}
                    <rect x={this.state.left} y={this.state.top - 6} 
                        width={this.state.width} 
                        height={this.state.height} rx="5" 
                        opacity='0.01'
                        style={this.props.style}
                        />
                    </g>
                )
            default:
                return null
        }
        
    }
    
}

export default AnnoBar