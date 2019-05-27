import React, {Component} from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'

import actions from '../../../actions'

import AnnoBar from './AnnoBar'
import Point from './Point'
import BBox from './BBox'
import Line from './Line'
import Polygon from './Polygon'
import * as modes from '../types/modes'
import * as colorlut from '../utils/colorlut'


const {selectAnnotation, siaShowSingleAnno} = actions


class Annotation extends Component{

    constructor(props){
        super(props)
        this.state = {
            mode: modes.VIEW,
            selAreaCss: 'sel-area-off',
            visibility: 'visible',
            anno: undefined
        }
        this.myAnno = React.createRef()
        // this.myKey = _.uniqueId('annokey')
        
    }

    
    componentWillMount(){
        console.log('Annotation did mount ', this.props.data.id)
        if (this.props.data.createMode){
            this.props.selectAnnotation(this.props.data.id)
            this.setState({anno: [...this.props.data.data]})
            this.setMode(modes.CREATE)
        }
    }

    componentDidUpdate(prevProps){
        console.log('Annotation did update', this.props.data.id, this.state.mode)
        if (prevProps.keyDown !== this.props.keyDown){
            if (this.isSelected()){
                switch (this.props.keyDown){
                    case 'Control':
                        this.setMode(modes.ADD)
                        break
                    default:
                        break
                }
            }
        }
        if (prevProps.keyUp !== this.props.keyUp){
            if (this.isSelected()){
                switch (this.props.keyUp){
                    case 'Control':
                        this.setMode(modes.VIEW)
                        break
                    default:
                        break
                }
            }
        }
        if (prevProps.showSingleAnno !== this.props.showSingleAnno){
            if (this.props.showSingleAnno === undefined){
                this.setVisible(true)
            } else {
                if (this.props.showSingleAnno !== this.props.data.id){
                    this.setVisible(false)
                } else {
                    this.setVisible(true)
                }
            }
        }
    }
    
    /*************
     * EVENTS    *
    **************/
    onMouseEnter(e: Event){
        e.stopPropagation()
        console.log('Clicked on: ', this.props.type)
        this.props.selectAnnotation(this.props.data.id)
        //Create a new key in order to create a completely new compontent
        //this.myKey = _.uniqueId('annokey')

    }

    onModeChange(newMode, oldMode){
        console.log('MODE CHANGED: ',this.props.data.id, newMode, oldMode)
        switch (newMode){
            case modes.ADD:
            case modes.EDIT:
            case modes.MOVE:
            case modes.CREATE:
                this.props.siaShowSingleAnno(this.props.data.id)
                break
            default:
                this.props.siaShowSingleAnno(undefined)
                break
        }
    }

    /*************
     * LOGIC     *
     *************/
    setMode(mode){
        if (this.state.mode !== mode){
            this.setState({mode: mode})
        }
    }

    setVisible(visible){
        if (visible){
            if (this.state.visibility !== 'visible'){
                this.setState({visibility: 'visible'})
            }
        } else {
            if (this.state.visibility !== 'hidden'){
                this.setState({visibility: 'hidden'})
            }
        }
    }

    isSelected(){
        return this.props.selectedAnno === this.props.data.id
    }

    getResult(){
        // console.log('Hi there i am a ', this.props.type, 
        //     this.props.data.id, this.props.data)
        // console.log('My annos are: ', this.myAnno.current.state.anno)
        return {
            ...this.props.data,
            data: this.myAnno.current.state.anno,
            createMode: this.myAnno.current.state.mode === modes.CREATE
        }
    }
    
    getStyle(){
        let color
        if (this.props.data.labelIds){
            color = colorlut.getColor(this.props.data.labelIds[0])
        }
        else {
            color = colorlut.getDefaultColor()
        }
        if (this.isSelected()){
            return {
                stroke: color,
                fill: color,
                strokeWidth: this.props.uiConfig.strokeWidth/this.props.svg.scale,
                r:this.props.uiConfig.nodeRadius/this.props.svg.scale

            }
        } else {
            return {
                stroke: color,
                fill: color,
                strokeWidth: this.props.uiConfig.strokeWidth/this.props.svg.scale,
                r:this.props.uiConfig.nodeRadius/this.props.svg.scale
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
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    mode={this.state.mode}
                    onModeChange={(newMode, oldMode) => {this.onModeChange(newMode, oldMode)}}
                    />
            case 'bBox':
                return <BBox ref={this.myAnno} data={data} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                    onNodeMouseDown={(e, idx) => this.onNodeMouseDown(e, idx)}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    mode={this.state.mode}
                    onModeChange={(newMode, oldMode) => {this.onModeChange(newMode, oldMode)}}
                    />
            case 'polygon':
                return <Polygon ref={this.myAnno} data={data} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    mode={this.state.mode}
                    onModeChange={(newMode, oldMode) => {this.onModeChange(newMode, oldMode)}}
                    />
            case 'line':
                return <Line ref={this.myAnno} data={data}
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    mode={this.state.mode}
                    onModeChange={(newMode, oldMode) => {this.onModeChange(newMode, oldMode)}}
                    />
            default:
                console.error("Wrong annoType for annotations: ",
                    this.props.annoType)
        } 
    }

    renderAnnoBar(){
        if (!this.myAnno.current) return null
        return <AnnoBar anno={this.myAnno.current.anno} label={'Test'}/>
    }

    render(){
        return (
            <g visibility={this.state.visibility}
                onMouseEnter={e => this.onMouseEnter(e)}
            >
                {this.renderAnno()}
                {this.renderAnnoBar()}
            </g>
        )
    }
    
    // render(){
    //     if (this.props.showSingleAnno === undefined){
    //         return this.renderStuff()
    //     } else if (this.props.showSingleAnno === this.props.data.id) {
    //         return this.renderStuff()
    //     } else {
    //         return null
    //     }
        
        
    // }
}

function mapStateToProps(state) {
    return ({
        selectedAnno: state.sia.selectedAnno,
        keyDown: state.sia.keyDown,
        keyUp: state.sia.keyUp,
        uiConfig: state.sia.uiConfig,
        showSingleAnno: state.sia.showSingleAnno
    })
}

export default connect(
    mapStateToProps, 
    {selectAnnotation, siaShowSingleAnno}
    ,null,
    {forwardRef:true})(Annotation)