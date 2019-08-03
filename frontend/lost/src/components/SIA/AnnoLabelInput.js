import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Dropdown, Ref, Popup, Header} from 'semantic-ui-react'

import LabelInput from './LabelInput'

import actions from '../../actions'
import * as transform from './utils/transform'
import * as annoStatus from './types/annoStatus'
import * as constraints from './utils/constraints'

const {siaShowLabelInput, siaShowSingleAnno, selectAnnotation,
siaKeyDown} = actions


class AnnoLabelInput extends Component{

    constructor(props){
        super(props)
        this.state = {
            top: 400,
            left: 100,
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
        if (this.props.showLabelInput){
            console.log('ShowLabelInput')
            this.setPosition()
        } 

        
    }


    /*************
     * LOGIC     *
     *************/
    setPosition(){
        if (this.props.selectedAnno.id){
            const center = transform.getCenter(this.props.selectedAnno.data, this.props.selectedAnno.type)
            // const annoBox = transform.getBox(this.props.selectedAnno.anno, this.props.selectedAnno.type)
            const inputRect = this.inputGroupRef.current.getBoundingClientRect()
            const top = this.props.svg.top + center.y - 20
            let left = this.props.svg.left + center.x - inputRect.width /2.0
            if (left < this.props.svg.left) left = this.props.svg.left
            if (left+inputRect.width > this.props.svg.left+this.props.svg.width){
                console.log('labelinput right, svg right', left+inputRect.width, this.props.svg.left+this.props.svg.width)
                left = this.props.svg.left+this.props.svg.width - inputRect.width
                console.log('labelinput new left', left)
            }
            if (this.state.top !== top || this.state.left !== left){  
                this.setState({
                    top,
                    left
                })
            }
        }
    }

    onClose(){
        if (this.props.onClose){
            this.props.onClose()
        }
    }


    /*************
     * RENDERING *
    **************/
    render(){
        return (
            <div ref={this.inputGroupRef} style={{position:'fixed', top:this.state.top, left:this.state.left}}>
                <LabelInput svg={this.props.svg}
                    // svgRef={this.props.svgRef}
                    onClose={() => this.onClose()}
                    selectedAnno={this.props.selectedAnno}
                    keyDown={this.props.keyDown}
                    />
            </div>
        )
    }
    
}

function mapStateToProps(state) {
    return ({
        showLabelInput: state.sia.showLabelInput,
        possibleLabels: state.sia.possibleLabels,
        allowedActions: state.sia.config.actions,
        svg: state.sia.svg
    })
}

export default connect(
    mapStateToProps, 
    {siaShowLabelInput, siaShowSingleAnno, selectAnnotation, siaKeyDown}
    ,null,
    {forwardRef:true})(AnnoLabelInput)