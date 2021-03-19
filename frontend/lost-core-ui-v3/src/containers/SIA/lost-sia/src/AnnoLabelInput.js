import React, {Component} from 'react'
import LabelInput from './LabelInput'
import * as constraints from './utils/constraints'
import * as annoStatus from './types/annoStatus'

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
        if (this.props.visible){
            this.setPosition()
        } 

        
    }

    /*************
     * LOGIC     *
     *************/
    setPosition(){

        if (this.props.mousePos){
            const top = this.props.mousePos.y + this.props.svg.top - 10
            const left = this.props.mousePos.x + this.props.svg.left - 10
            if (this.state.top !== top|| this.state.left !== left){  
                this.setState({
                    top: top,
                    left: left,
                })
            }
        }
    }

    onClose(){
        if (this.props.onClose){
            this.props.onClose()
        }
    }
    
    annoLabelUpdate(anno){
        if (this.props.onLabelUpdate){
            this.props.onLabelUpdate(anno)
        }
    }

    updateAnnoLabel(label){
        if (!constraints.allowedToLabel(
            this.props.allowedActions, this.props.selectedAnno)) return
        this.annoLabelUpdate({
            ...this.props.selectedAnno,
            labelIds: label,
            status: this.props.selectedAnno.status !== annoStatus.NEW ? annoStatus.CHANGED : annoStatus.NEW
        })
    }


    /*************
     * RENDERING *
    **************/
    render(){
        if (!this.props.visible) return null
        return (
            <div ref={this.inputGroupRef} style={{position:'fixed', top:this.state.top, left:this.state.left}}>
                <LabelInput svg={this.props.svg}
                    onClose={() => this.onClose()}
                    initLabelIds={this.props.selectedAnno.labelIds}
                    relatedId={this.props.selectedAnno.id}
                    visible={this.props.visible}
                    onLabelUpdate={label => this.updateAnnoLabel(label)}
                    possibleLabels={this.props.possibleLabels}
                    multilabels={this.props.multilabels}
                    disabled={!this.props.allowedActions.label}
                    renderPopup
                    focusOnRender
                    open={true}
                    defaultLabel={this.props.defaultLabel}
                    />
            </div>
        )
    }
    
}

export default AnnoLabelInput