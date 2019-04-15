import React, {Component} from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'

import actions from '../../../actions'

import Point from './Point'
import BBox from './BBox'
import Line from './Line'
import Polygon from './Polygon'

const {selectAnnotation } = actions


class Annotation extends Component{

    constructor(props){
        super(props)
        this.state = {
            readyToMove: false
        }
        this.myAnno = React.createRef()
        // this.myKey = _.uniqueId('annokey')
    }

    componentDidUpdate(){
        console.log('Annotation did update', this.props.data.id)
        if (this.selected()){
            console.log('I am selected :-)')
        }
    }
    
    onClick(e: Event){
        e.stopPropagation()
        console.log('Clicked on: ', this.props.type)
        this.props.selectAnnotation(this.props.data.id)
        //Create a new key in order to create a completely new compontent
        //this.myKey = _.uniqueId('annokey')

    }
    onMouseDown(e: Event){
        this.setState({readyToMove: true})
    }
    onMouseUp(e: Event){
        this.setState({readyToMove: false})
    }
    onMouseOut(e: Event){
        if (this.state.readyToMove){
            this.setState({readyToMove: false})
        }
    }

    onMouseMove(e: Event){
        if (this.state.readyToMove && this.selected()){
            this.myAnno.current.move(e.movementX, e.movementY)
        }
    }
    
    selected(){
        return this.props.selectedAnno === this.props.data.id
    }

    getResult(){
        console.log('Hi there i am a ', this.props.type, this.props.data.id)
        console.log('My annos are: ', this.myAnno.current.state.anno)
    }
    
    getStyle(){
        if (this.selected()){
            return {
                stroke: 'red',
                fillOpacity: '0.1',
                strokeWidth: 4
            }
        } else {
            return {}
        }
    }
    renderAnno(){
        const type = this.props.type
        const data = this.props.data

        switch(type) {
            case 'point':
                return <Point ref={this.myAnno} data={data}></Point>
            case 'bBox':
                return <BBox ref={this.myAnno} data={data} style={this.getStyle()}></BBox>
            case 'polygon':
                return <Polygon ref={this.myAnno} data={data} style={this.getStyle()}></Polygon>
            case 'line':
                return <Line ref={this.myAnno} data={data}></Line>
            default:
                console.log("Wrong annoType for annotations: ",
                    this.props.annoType)
        } 
    }
    render(){
        return (
            <g 
                onClick={e => this.onClick(e)}
                onMouseDown={e => {this.onMouseDown(e)}}
                onMouseUp={e => {this.onMouseUp(e)}}
                onMouseMove={e => {this.onMouseMove(e)}}
                onMouseOut={e => {this.onMouseOut(e)}}
            >
                {this.renderAnno()}
            </g>
        )
        
    }
}

function mapStateToProps(state) {
    return ({
        selectedAnno: state.sia.selectedAnno
    })
}

export default connect(mapStateToProps, {selectAnnotation})(Annotation)