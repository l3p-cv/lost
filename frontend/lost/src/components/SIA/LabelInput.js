import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Dropdown, Ref, Popup, Header} from 'semantic-ui-react'

import actions from '../../actions'
import * as transform from './utils/transform'
import * as annoStatus from './types/annoStatus'
import * as constraints from './utils/constraints'

const {siaShowLabelInput, siaShowSingleAnno, selectAnnotation,
siaKeyDown} = actions


class LabelInput extends Component{

    constructor(props){
        super(props)
        this.state = {
            label: undefined,
            possibleLabels: []
        }
        this.inputRef = React.createRef()
    }

    componentWillMount(){
        this.updatePossibleLabels()
    }
    
    componentDidUpdate(prevProps){
        if (this.props.showLabelInput){

            if (this.inputRef.current){
                console.log('LabelInput', this.inputRef.current)
                this.inputRef.current.click()
            }

        } 

        if (prevProps.canvasKeyDown !== this.props.canvasKeyDown){
            this.performKeyAction(this.props.canvasKeyDown)
        }
        if (prevProps.possibleLabels !== this.props.possibleLabels){
            this.updatePossibleLabels()
        }
        if (this.props.selectedAnno.labelIds){
            if (prevProps.selectedAnno !== this.props.selectedAnno){
                if(this.props.selectedAnno.labelIds.length > 0){
                    const lbl = this.state.possibleLabels.find(e => {
                        return e.value === this.props.selectedAnno.labelIds[0]
                    })
                    if (lbl){
                        this.setState({label:lbl})
                    }
                }
            }
        }
    }
    /*************
     * EVENTS    *
    **************/
    onKeyDown(e: Event){
        e.stopPropagation()
        console.log('LabelInput KeyDown on Input field: ', e.key)
        this.performKeyAction(e.key)
        
    }

    // onClickDelete(e){
    //     console.log('Clicked on delete')
    //     this.props.siaShowLabelInput(false)
    //     this.props.siaShowSingleAnno(undefined)
    //     this.props.selectAnnotation(undefined)
    //     //Reset keyDown on delete
    //     this.props.siaKeyDown(undefined) 
    //     if (this.props.onDeleteClick){
    //         this.props.onDeleteClick(this.props.selectedAnno.id)
    //     }
    // }

    // onAutocompleteClick(e){
    //     console.log('Clicked on Autocomplete :-) ')
    // }

    // onCheckClick(e){
    //     //this.closeLabelInput()
    //     //Reset keyDown after leaving with a click instead of keyDown
    //     //this.props.siaKeyDown(undefined) 
    //     this.confirmLabel()
    // }

    // onLabelSelect(value, item){
    //     console.log('LabelInput selected item', item)
    //     this.setState({ value, label: {...item} })
    // }

    onChange(e, item ){
        console.log('LabelInput onChange', e, item)
        this.setState({ label: item })
        this.updateSelectedAnnoLabel(item)
        // this.confirmLabel()
    }

    // onDropDownSelect(item){
    //     console.log('LabelInput selected Dropdown entry', item)
    //     if (this.state.label !== item ){
    //         this.setState({ label: item})
    //     }
    // }

    // onKeyUp(e:Event){
    //     e.stopPropagation()
    // }

    /*************
     * LOGIC     *
     *************/
    updatePossibleLabels(){
        let possibleLabels = []
        if (this.props.possibleLabels.length > 0){
            possibleLabels = this.props.possibleLabels.map(e => {
                return {key: e.id, value: e.id, text: e.label}
            })
        }
        possibleLabels = [{key: -1, text:"no label", value:-1}, ...possibleLabels]
        this.setState({possibleLabels})

    }

    performKeyAction(key){
        switch(key){
            case 'Enter':
                if (this.props.showLabelInput) this.confirmLabel()
                break
            case 'Escape':
                // console.log('LabelInput Escape current label', this.state.label.id)
                this.closeLabelInput()
                break
            default:
                break
        }
    }

    updateSelectedAnnoLabel(label){
        if (!constraints.allowedToLabel(
            this.props.allowedActions, this.props.selectedAnno)) return
        console.log('LabelInput confirmLabel label', label)
        if (label){
            if (label.value !== -1){
                this.props.selectAnnotation({
                    ...this.props.selectedAnno,
                    labelIds: [label.value],
                    status: this.props.selectedAnno.status !== annoStatus.NEW ? annoStatus.CHANGED : annoStatus.NEW
                })
            } else {
                this.props.selectAnnotation({
                    ...this.props.selectedAnno,
                    labelIds: [],
                    status: this.props.selectedAnno.status !== annoStatus.NEW ? annoStatus.CHANGED : annoStatus.NEW
                })
            }
        } else {
            this.props.selectAnnotation({
                ...this.props.selectedAnno,
                labelIds: [],
                status: this.props.selectedAnno.status !== annoStatus.NEW ? annoStatus.CHANGED : annoStatus.NEW
            })
        }
    }
    confirmLabel(){
        //If not allowed to label -> return
        this.updateSelectedAnnoLabel(this.state.label)
        this.closeLabelInput()
    }

    closeLabelInput(){
        if (this.props.onClose){
            this.props.onClose()
        }
        this.props.siaShowLabelInput(false)
        this.props.siaShowSingleAnno(undefined)
    }

    /*************
     * RENDERING *
    **************/
    renderLabelInput(){
        return (
            <Ref innerRef={this.inputRef}>
                    <Dropdown
                        multiple={false}
                        search
                        selection
                        closeOnChange
                        options={this.state.possibleLabels}
                        placeholder='Enter label'
                        tabIndex={0}
                        onKeyDown= {e => this.onKeyDown(e)}
                        defaultValue={
                            this.state.label ?
                            this.state.label.value :
                            -1
                        }
                        onChange={(e, item) => this.onChange(e, item)}
                        // searchInput={<Dropdown.SearchInput />}
                    />
                </Ref>
        )
    }
    renderLabelInfo(){
        if (!this.state.label) return null
        const lbl = this.props.possibleLabels.find(e => {
            return this.state.label.value === e.id
        })
        if (!lbl) return "No label"
        return <div>
            <Header>{
                lbl.label
            }</Header>
            {lbl.description}
        </div>
    }
    // renderAnnoDetails(){
    //     if (this.props.selectedAnno.id){
    //         let box = transform.getBox(this.props.selectedAnno.data, this.props.selectedAnno.type)
    //         if (!box[1]) return "No annotation selected!"
    //         box = transform.toBackend(box, this.props.svg, 'bBox')
    //         console.log('AnnoDetails box', box)
    //         return (
    //             <div>
    //             <Divider horizontal> Position </Divider>

    //             <Statistic.Group widths='one' size='mini'>
    //                 <Statistic>
    //                     <Statistic.Label> 
    //                         x / y
    //                     {/* <Icon name="arrow right"/> */}
    //                     </Statistic.Label>
    //                     <Statistic.Value>
    //                         {/* {"x / y"} */}
    //                         {/* <Icon name="arrow right"/> */}

    //                         {"("+box.x.toFixed(2)+" , "+ box.y.toFixed(2)+")"}
    //                     </Statistic.Value>
    //                 </Statistic>
    //             </Statistic.Group>
    //             <Divider horizontal> Size </Divider>

    //             <Statistic.Group widths='two' size='mini'>
    //                 <Statistic >
    //                     <Statistic.Value>
    //                         {Math.abs(box.w).toFixed(2)}
    //                     </Statistic.Value>
    //                     <Statistic.Label>
    //                         <Icon name="arrows alternate horizontal"/>
    //                         width
    //                     </Statistic.Label>
    //                 </Statistic>
    //                 <Statistic>
    //                     <Statistic.Value>
    //                         {Math.abs(box.h).toFixed(2)}
    //                     </Statistic.Value>
    //                     <Statistic.Label>
    //                         <Icon name="arrows alternate vertical"/>
    //                         height
    //                     </Statistic.Label>
    //                 </Statistic>
    //             </Statistic.Group>
    //             </div>
    //         )
    //     } else {
    //         return "No annotation selected!"
    //     }
    // }
    renderPopupContent(){
        return <div>
            {this.renderLabelInfo()}
            {/* {this.renderAnnoDetails()} */}
        </div>
    }


    render(){
        if (!this.props.showLabelInput) return null
        // console.log('Render LabelInput with state', this.state, this.props.possibleLabels)
        return (
            <Popup trigger={this.renderLabelInput()}
            content={this.renderPopupContent()}
            open
            position="right center"
            style={{opacity:0.9}}
            />
        )
    }
    
}

function mapStateToProps(state) {
    return ({
        showLabelInput: state.sia.showLabelInput,
        canvasKeyDown: state.sia.keyDown,
        possibleLabels: state.sia.possibleLabels,
        allowedActions: state.sia.config.actions,
        svg: state.sia.svg
    })
}

export default connect(
    mapStateToProps, 
    {siaShowLabelInput, siaShowSingleAnno, selectAnnotation, siaKeyDown}
    ,null,
    {forwardRef:true})(LabelInput)