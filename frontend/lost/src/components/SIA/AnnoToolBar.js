import React, {Component} from 'react'
import LabelInput from './LabelInput'
import * as transform from './utils/transform'
import * as constraints from './utils/constraints'
import * as annoStatus from './types/annoStatus'
import { Icon, Button } from 'semantic-ui-react';

class AnnoToolBar extends Component{

    constructor(props){
        super(props)
        this.state = {
            top: 400,
            left: 100,
            width: 50,
            label: undefined,
            visibility: 'hidden',
            possibleLabels: []
        }
        this.inputGroupRef = React.createRef()
    }

    componentWillMount(){
        this.setPosition()
    }
    
    componentDidUpdate(prevProps){
        if (this.props.visible){
            console.log('ShowLabelInput')
            this.setPosition()
        } 

        
    }

    /*************
     * LOGIC     *
     *************/
    setPosition(){
        if (this.props.selectedAnno){
            // const center = transform.getCenter(this.props.selectedAnno.data, this.props.selectedAnno.type)
            // const annoBox = transform.getBox(this.props.selectedAnno.data, this.props.selectedAnno.type)
            // console.log('AnnoToolBar annoBox', annoBox)
            let topPoint = transform.getTopPoint(this.props.selectedAnno.data)
            topPoint = transform.getMonstLeftPoint(topPoint)[0]
            const inputRect = this.inputGroupRef.current.getBoundingClientRect()
            let top = this.props.svg.top + (topPoint.y + this.props.svg.translateY) *this.props.svg.scale - 30
            let left = this.props.svg.left + (topPoint.x + this.props.svg.translateX) *this.props.svg.scale - inputRect.width /2.0 + 5
            // console.log('AnnoToolBar top, left', top, left)
            // if (left < this.props.svg.left) left = this.props.svg.left
            // if (left+inputRect.width > this.props.svg.left+this.props.svg.width){
            //     console.log('labelinput right, svg right', left+inputRect.width, this.props.svg.left+this.props.svg.width)
            //     left = this.props.svg.left+this.props.svg.width - inputRect.width
            //     console.log('labelinput new left', left)
            // }
            if (top < 0) top = this.props.svg.top + (topPoint.y + this.props.svg.translateY + 10) *this.props.svg.scale 
            if (this.state.top !== top || this.state.left !== left){  
                this.setState({
                    top,
                    left,
                    // width: annoBox[1].x - annoBox[0].x
                })
            }
        }
    }

    onClose(){
        if (this.props.onClose){
            this.props.onClose()
        }
    }

    handleClick(e){
        if (this.props.onClick){
            this.props.onClick(e)
        }
    }
    
    /*************
     * RENDERING *
    **************/
    render(){
        if (!this.props.visible) return null
        return (
            <div ref={this.inputGroupRef} 
                style={{
                    position:'fixed', 
                    top:this.state.top, 
                    left:this.state.left,
                }}
            >
            {/* <Button icon circular basic
                onClick={e => this.handleClick(e)}
            > */}
                <Icon name="pencil"
                    onClick={e => this.handleClick(e)}
                />
            {/* </Button> */}
            </div>
        )
    }
    
}

export default AnnoToolBar