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
import * as annoStatus from '../types/annoStatus'
import * as colorlut from '../utils/colorlut'


const {selectAnnotation, siaShowSingleAnno, siaShowLabelInput} = actions


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
        console.log('Annotation did mount ', this.props.data.id, this.props.data)
        if (this.props.data.createMode){
            this.props.selectAnnotation(this.props.data)
            this.setMode(modes.CREATE)
        } 
        this.setState({anno: {...this.props.data}})
        if (this.props.data.status === annoStatus.DELETED){
            this.setVisible(false)
        }
    }

    componentDidUpdate(prevProps){
        console.log('Annotation Update', this.state, this.props.type, this.props.data.id)
        if (prevProps.data !== this.props.data){
            console.log('Annotation got new annotation data from props', this.props.data)
            this.setState({anno: {...this.props.data}})
        }
        if (prevProps.keyDown !== this.props.keyDown){
            if (this.isSelected()){
                switch (this.props.keyDown){
                    case 'Control':
                        this.setMode(modes.ADD)
                        break
                    case 'Enter':
                        this.setMode(modes.EDIT_LABEL)
                        break
                    case 'Delete':
                        this.setMode(modes.DELETED)
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
        if (prevProps.showLabelInput !== this.props.showLabelInput){
            if (!this.props.showLabelInput) this.setMode(modes.VIEW)
        }
        if (this.isSelected()){
            if(this.state.anno !== this.props.selectedAnno){
                this.setState({anno: this.props.selectedAnno})
                console.log('Annotation update anno', this.props.selectedAnno)
            }
        }
        if (this.state.anno.status === annoStatus.DELETED){
            this.setVisible(false)
        }
    }
    
    /*************
     * EVENTS    *
    **************/
    onClick(e: Event){
        e.stopPropagation()
        console.log('Clicked on: ', this.props.type)
        this.props.selectAnnotation(this.state.anno)
        //Create a new key in order to create a completely new compontent
        //this.myKey = _.uniqueId('annokey')

    }

    onModeChange(newMode, oldMode){
        console.log('MODE CHANGED (id, old, new): ',this.props.data.id, oldMode, '->', newMode)
        switch (newMode){
            case modes.ADD:
            case modes.EDIT:
            case modes.MOVE:
            case modes.CREATE:
                this.props.siaShowSingleAnno(this.props.data.id)
                break
            case modes.EDIT_LABEL:
                break
            case modes.VIEW:
                this.props.siaShowSingleAnno(undefined)
                break
            default:
                break
        }
        let newAnno
        switch (oldMode){
            case modes.ADD:
            case modes.EDIT:
            case modes.MOVE:
                newAnno = {
                    ...this.state.anno,
                    data: [...this.myAnno.current.state.anno],
                    status: this.state.anno.status !== annoStatus.NEW ? annoStatus.CHANGED : annoStatus.NEW
                }
                this.setState({anno: newAnno})
                this.props.selectAnnotation(newAnno)
                break
            case modes.CREATE:
                newAnno = {
                    ...this.state.anno,
                    data: [...this.myAnno.current.state.anno],
                    status: annoStatus.NEW
                }
                this.setState({anno: newAnno})
                this.props.selectAnnotation(newAnno)
                break
            // case modes.CREATE:
            //     console.log('oldMode Create anno', this.myAnno.current.state.anno)
            //     this.setState({anno: {...this.myAnno.current.state.anno}})
            //     this.props.selectAnnotation(this.myAnno.current.state.anno)
            //     break
            default:
                break
                
        }
        this.setMode(newMode)
    }

    /*************
     * LOGIC     *
     *************/
    setMode(mode){
        if (this.state.mode !== mode){
            this.setState({mode: mode})
            switch (mode){
                case modes.EDIT_LABEL:
                    this.props.siaShowLabelInput(true)
                    this.props.siaShowSingleAnno(this.props.data.id)
                    break
                case modes.DELETED:
                    this.props.siaShowSingleAnno(undefined)
                    this.props.selectAnnotation(undefined)
                    this.setVisible(false)
                    this.setState({
                        anno: {
                            ...this.state.anno, 
                            status: annoStatus.DELETED
                        }
                    })
                    console.log('Annotation in deleted state')
                    break
                default:
                    break
            }
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
        return this.props.selectedAnno.id === this.props.data.id
    }

    getResult(){
        // console.log('Hi there i am a ', this.props.type, 
        //     this.props.data.id, this.props.data)
        // console.log('My annos are: ', this.myAnno.current.state.anno)
        return {
            ...this.state.anno,
            data: this.myAnno.current.state.anno,
            createMode: this.myAnno.current.state.mode === modes.CREATE
        }
    }
    
    getStyle(){
        let color
        if (this.state.anno.labelIds){
            color = colorlut.getColor(this.state.anno.labelIds[0])
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
        const anno = this.state.anno.data
        switch(type) {
            case 'point':
                return <Point ref={this.myAnno} anno={anno} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    mode={this.state.mode}
                    onModeChange={(newMode, oldMode) => {this.onModeChange(newMode, oldMode)}}
                    />
            case 'bBox':
                return <BBox ref={this.myAnno} anno={anno} 
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
                return <Polygon ref={this.myAnno} anno={anno} 
                    style={this.getStyle()}
                    className={this.getCssClass()}
                    onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                    isSelected={this.isSelected()}
                    svg={this.props.svg}
                    mode={this.state.mode}
                    onModeChange={(newMode, oldMode) => {this.onModeChange(newMode, oldMode)}}
                    />
            case 'line':
                return <Line ref={this.myAnno} anno={anno}
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
        // console.log('Inputfile gerändert')
        // return (
        //     <foreignObject x="10" y="10" width="100" height="150"> 
        //         <div xmlns="http://www.w3.org/1999/xhtml">
        //             <input placeholder='JUnge' onKeyDown={e => this.onFocus(e)} onKeyUp={e => this.onFocus(e)}></input>
        //         </div>
        //     </foreignObject>
        // )
        // if (!this.myAnno.current) return null
        //return <g style={{position:'absolute', color:'orange', left:this.props.svg.left}}>Text</g>


        return <AnnoBar anno={this.state.anno} mode={this.state.mode}/>
    }
    render(){
        if(!this.state.anno.data) return null
        return (
            <g>
            <g visibility={this.state.visibility}
                onClick={e => this.onClick(e)}
            >
                {this.renderAnno()}
                {this.renderAnnoBar()}

            </g>
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
        showSingleAnno: state.sia.showSingleAnno,
        showLabelInput: state.sia.showLabelInput
    })
}

export default connect(
    mapStateToProps, 
    {selectAnnotation, siaShowSingleAnno, siaShowLabelInput}
    ,null,
    {forwardRef:true})(Annotation)