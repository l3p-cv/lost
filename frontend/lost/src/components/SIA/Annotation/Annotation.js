import React, {Component} from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'

import actions from '../../../actions'

import Point from './Point'
import BBox from './BBox'
import Line from './Line'
import Polygon from './Polygon'

const {selectAnnotation} = actions


class Annotation extends Component{

    constructor(props){
        super(props)
        this.state = {
            mode: 'view',
            selAreaCss: 'sel-area-off',
        }
        this.myAnno = React.createRef()
        // this.myKey = _.uniqueId('annokey')
        
    }

    componentDidMount(){
        if (this.props.data.createMode){
            this.props.selectAnnotation(this.props.data.id)
        }
    }
    componentDidUpdate(prevProps){
        console.log('Annotation did update', this.props.data.id)
    }
    
    /*************
     * EVENTS    *
    **************/
    onClick(e: Event){
        e.stopPropagation()
        console.log('Clicked on: ', this.props.type)
        this.props.selectAnnotation(this.props.data.id)
        //Create a new key in order to create a completely new compontent
        //this.myKey = _.uniqueId('annokey')

    }
    onMouseDown(e: Event){
        switch(e.button){
            case 0:
                if (this.isSelected()){
                    this.setMode('move')
                }
            default:
                break
        }
    }
    onMouseUp(e: Event){
        switch(e.button){
            case 0:
                this.setMode('view')
                this.disableSelArea()
            default:
                break
        }
    }
    onMouseOut(e: Event){
        // if (this.state.readyToMove){
        //     this.setState({readyToMove: false})
        // }
    }

    onMouseMove(e: Event){
        if (this.state.mode === 'move'){
            this.enableSelArea()
            this.myAnno.current.move(
                e.movementX/this.props.svg.scale, 
                e.movementY/this.props.svg.scale)
        }
    }
    
    onNodeClick(e, idx){
        console.log('Annotation')
        console.log('NodeClick on ', idx, e.pageX)
    }

    /*************
     * LOGIC     *
     *************/
    setMode(mode){
        if (this.state.mode !== mode){
            this.setState({mode: mode})
        }
    }

    isSelected(){
        return this.props.selectedAnno === this.props.data.id
    }

    enableSelArea(){
        if (this.state.selAreaCss !== 'sel-area-on'){
            this.setState({selAreaCss: 'sel-area-on'})
        }
    }
    disableSelArea(){
        if (this.state.selAreaCss !== 'sel-area-off'){
            this.setState({selAreaCss: 'sel-area-off'})
        }
    }
    getResult(){
        // console.log('Hi there i am a ', this.props.type, 
        //     this.props.data.id, this.props.data)
        // console.log('My annos are: ', this.myAnno.current.state.anno)
        return {
            ...this.props.data,
            data: this.myAnno.current.state.anno,
            createMode: this.myAnno.current.state.mode === 'create' 
        }
    }
    
    getStyle(){
        if (this.isSelected()){
            return {
                stroke: 'blue'
            }
        } else {
            return {
                stroke: 'blue'
            }
        }
    }

    getCssClass(){
        if (this.isSelected()){
            return 'selected'
        } else {
            return 'not-selected'
        }
    }

    /*************
     * RENDERING *
    **************/
    renderAnno(){
        const type = this.props.type
        const data = this.props.data

        switch(type) {
            case 'point':
                return <Point ref={this.myAnno} data={data} 
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    />
            case 'bBox':
                return <BBox ref={this.myAnno} data={data} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    />
            case 'polygon':
                return <Polygon ref={this.myAnno} data={data} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    />
            case 'line':
                return <Line ref={this.myAnno} data={data}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    />
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
                <circle 
                    cx={this.props.svg.width/2} 
                    cy={this.props.svg.height/2} 
                    r={'100%'}
                    className={this.state.selAreaCss}
                    onMouseMove={e => {this.onMouseMove(e)}}

                />
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

export default connect(
    mapStateToProps, 
    {selectAnnotation}
    ,null,
    {forwardRef:true})(Annotation)