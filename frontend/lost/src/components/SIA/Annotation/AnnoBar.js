import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Button, Popover, PopoverHeader, PopoverBody, Input } from 'reactstrap'
import actions from '../../../actions'
import Autocomplete from 'react-autocomplete'
import * as transform from '../utils/transform'
import * as modes from '../types/modes'

const {selectAnnotation, siaShowSingleAnno} = actions


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
        console.log('AnnoBar set Position', this.props.anno)
        const center = transform.getCenter(this.props.anno.data, this.props.anno.type)
        // const annoBox = transform.getBox(this.props.selectedAnno.anno, this.props.selectedAnno.type)
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
        let label = 'None'
        if (this.props.anno.labelIds){
            console.log('AnnoBar',this.props.anno)
            label = this.props.possibleLabels.find(el => {
                return el.id === this.props.anno.labelIds[0]
            }).label
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

function mapStateToProps(state) {
    console.log('AnnoBar selected anno', state.sia.selectedAnno)
    return ({
        selectedAnno: state.sia.selectedAnno,
        possibleLabels: state.sia.possibleLabels
    })
}

export default connect(
    mapStateToProps, 
    {}
    ,null,
    {}) (AnnoBar)