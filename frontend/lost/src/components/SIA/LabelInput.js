import React, {Component} from 'react'
import {connect} from 'react-redux'
import { InputGroup,
    InputGroupAddon,
    Input,
    Button,
    UncontrolledPopover, 
    PopoverHeader, 
    PopoverBody
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
import { faTrashAlt, faCheck } from '@fortawesome/free-solid-svg-icons'
import actions from '../../actions'
import Autocomplete from 'react-autocomplete'
import * as transform from './utils/transform'
import * as annoStatus from './types/annoStatus'

const {siaShowLabelInput, siaShowSingleAnno, selectAnnotation,
siaKeyDown} = actions


class LabelInput extends Component{

    constructor(props){
        super(props)
        this.state = {
            value: '',
            top: 400,
            left: 100,
            deleteColor: '#505050',
            label: undefined,
            visibility: 'hidden',
            possibleLabels: []
        }
        this.inputGroupRef = React.createRef()
        // this.inputRef = React.createRef()
    }

    componentWillMount(){
        this.updatePossibleLabels()
        this.setPosition()
    }
    
    componentDidUpdate(prevProps){
        if (this.props.showLabelInput){
            console.log('ShowLabelInput')
            this.setPosition()
            this.inputRef.focus()
        } 
        // }
        if (prevProps.canvasKeyDown !== this.props.canvasKeyDown){
            this.performKeyAction(this.props.canvasKeyDown)
        }
        if (prevProps.possibleLabels !== this.props.possibleLabels){
            this.updatePossibleLabels()
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

    mouseOverDelete(e){
        console.log('Mouse over delete :-)')
        this.setState({deleteColor:'#A9A9A9'})
    }
    
    mouseOutDelete(e){
        console.log('Mouse over delete :-)')
        this.setState({deleteColor:'#505050'})
    }

    onClickDelete(e){
        console.log('Clicked on delete')
        this.props.siaShowLabelInput(false)
        this.props.siaShowSingleAnno(undefined)
        this.props.selectAnnotation(undefined)
        //Reset keyDown on delete
        this.props.siaKeyDown(undefined) 
        if (this.props.onDeleteClick){
            this.props.onDeleteClick(this.props.selectedAnno.id)
        }
    }

    onAutocompleteClick(e){
        console.log('Clicked on Autocomplete :-) ')
    }

    onCheckClick(e){
        //this.closeLabelInput()
        //Reset keyDown after leaving with a click instead of keyDown
        //this.props.siaKeyDown(undefined) 
        this.confirmLabel()
    }

    onLabelSelect(value, item){
        console.log('LabelInput selected item', item)
        this.setState({ value, label: {...item} })
    }

    onChange(e){
        // const label = this.props.possibleLabels.find( el => {
        //     return el.label.toLowerCase().includes(e.target.value.toLowerCase())
        // })
        // console.log('LabelInput label search', label)
        this.setState({ value: e.target.value })
    }

    onDropDownSelect(item){
        console.log('LabelInput selected Dropdown entry', item)
        if (this.state.label !== item ){
            this.setState({ label: item})
        }
    }

    // onKeyUp(e:Event){
    //     e.stopPropagation()
    // }

    /*************
     * LOGIC     *
     *************/
    updatePossibleLabels(){
        const possibleLabels = [{id: -1, label:"no label"},...this.props.possibleLabels]
        this.setState({possibleLabels})

    }
    setPosition(){
        if (this.props.selectedAnno.id){
            const center = transform.getCenter(this.props.selectedAnno.data, this.props.selectedAnno.type)
            // const annoBox = transform.getBox(this.props.selectedAnno.anno, this.props.selectedAnno.type)
            const inputRect = this.inputGroupRef.current.getBoundingClientRect()
            const top = this.props.svg.top + center.y - 20
            const left = this.props.svg.left + center.x - inputRect.width /2.0
            if (this.state.top !== top || this.state.left !== left){  
                this.setState({
                    top,
                    left
                })
            }
        }
    }

    performKeyAction(key){
        switch(key){
            // case 'Enter':
            case 'Escape':
                // console.log('LabelInput Escape current label', this.state.label.id)
                this.confirmLabel()
                
                break
            default:
                break
        }
    }

    confirmLabel(){
        console.log('LabelInput confirmLabel label', this.state.label)
        if (this.state.label){
            if (this.state.label.id !== -1){
                this.props.selectAnnotation({
                    ...this.props.selectedAnno,
                    labelIds: [this.state.label.id],
                    status: annoStatus.CHANGED
                })
            } else {
                this.props.selectAnnotation({
                    ...this.props.selectedAnno,
                    labelIds: [],
                    status: annoStatus.CHANGED
                })
            }
        } else {
            this.props.selectAnnotation({
                ...this.props.selectedAnno,
                labelIds: [],
                status: annoStatus.CHANGED
            })
        }
        this.closeLabelInput()
    }

    closeLabelInput(){
        this.props.svgRef.current.focus()
        this.props.siaShowLabelInput(false)
        this.props.siaShowSingleAnno(undefined)
    }

    /*************
     * RENDERING *
    **************/

    render(){
        if (!this.props.showLabelInput) return null
        // console.log('Render LabelInput with state', this.state, this.props.possibleLabels)
        return (
            <div ref={this.inputGroupRef} style={{position:'fixed', top:this.state.top, left:this.state.left}}>
                <InputGroup >
                    {/* <Input onKeyDown={e => this.onKeyDown(e)}/> */}
                    {/* <InputGroupAddon addonType="prepend">
                    <Button><FontAwesomeIcon icon={faCheck}/></Button>
                    </InputGroupAddon> */}
                    <Autocomplete
                        ref = {el => this.inputRef = el}
                        items={this.state.possibleLabels}
                        shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                        getItemValue={item => item.label}
                        renderItem={(item, highlighted) => {
                        if (highlighted){
                            this.onDropDownSelect(item)
                        }
                        return (
                        <div
                            key={item.id}
                            style={{ backgroundColor: highlighted ? 'orange' : 'transparent'}}
                            // onMouseOver={e => this.onDropDownSelect(e, item)}
                        >
                            {item.label}
                        </div>
                        )
                        }}
                        inputProps={{
                            className:"form-control", //Added bootstrap class for input styling -.-
                            onKeyDown: e => this.onKeyDown(e),
                        }} 
                        value={this.state.value}
                        onChange={e => this.onChange(e)}
                        onSelect={(value, item) => this.onLabelSelect(value, item)}
                    />
                    <InputGroupAddon addonType="append">
                        <Button id="LabelInputPopover"><FontAwesomeIcon icon={faQuestionCircle}/></Button>
                        <Button onClick={e => this.onCheckClick(e)}><FontAwesomeIcon icon={faCheck} />
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
                <UncontrolledPopover placement="top" target="LabelInputPopover">
                    <PopoverHeader style={{minHeight:'30px'}}>
                        {!this.state.label ? 'No label': this.state.label.label}
                        {/* <Button style={{right:'0', position:'absolute'}}> */}
                            
                            <FontAwesomeIcon icon={faTrashAlt} 
                                style={{float:'right', color:this.state.deleteColor}} 
                                onMouseOut={e => this.mouseOutDelete(e)} 
                                onMouseOver={e => this.mouseOverDelete(e)}
                                onClick={e => this.onClickDelete(e)}
                                />
                        {/* </Button> */}
                    </PopoverHeader>
                    <PopoverBody>
                        {!this.state.label ? 'no label selected': this.state.label.description}
                        
                    </PopoverBody>
                </UncontrolledPopover>
            </div>
        )
    }
    
}

function mapStateToProps(state) {
    return ({
        selectedAnno: state.sia.selectedAnno,
        showLabelInput: state.sia.showLabelInput,
        canvasKeyDown: state.sia.keyDown,
        possibleLabels: state.sia.possibleLabels
    })
}

export default connect(
    mapStateToProps, 
    {siaShowLabelInput, siaShowSingleAnno, selectAnnotation, siaKeyDown}
    ,null,
    {forwardRef:true})(LabelInput)