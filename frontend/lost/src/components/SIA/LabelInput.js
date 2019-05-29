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
import actions from '../../actions'
import Autocomplete from 'react-autocomplete'
import * as transform from './utils/transform'

const {siaShowLabelInput, siaShowSingleAnno} = actions


class LabelInput extends Component{

    constructor(props){
        super(props)
        this.state = {
            value: '',
            top: 400,
            left: 100,
        }
        this.inputGroupRef = React.createRef()
        // this.inputRef = React.createRef()
    }

    componentWillMount(){
        this.setPosition()
    }
    
    componentDidUpdate(prevProps){
        if (!this.props.showLabelInput) return
        this.setPosition()
        // if (this.props.showLabelInput !== prevProps.showLabelInput){
        if (this.props.showLabelInput){
            console.log('ShowLabelInput')
            this.inputRef.focus()
        }
        // }
    }
    /*************
     * EVENTS    *
    **************/
    onKeyDown(e: Event){
        e.stopPropagation()
        console.log('LabelInput KeyDown on Input field: ', e.key)
        switch(e.key){
            case 'Enter':
                this.props.svgRef.current.focus()
                this.props.siaShowLabelInput(false)
                this.props.siaShowSingleAnno(undefined)
                break
            default:
                break
        }
    }

    // onKeyUp(e:Event){
    //     e.stopPropagation()
    // }

    /*************
     * LOGIC     *
     *************/
    setPosition(){
        if (this.props.selectedAnno.annoId){
            const center = transform.getCenter(this.props.selectedAnno.anno, this.props.selectedAnno.type)
            const annoBox = transform.getBox(this.props.selectedAnno.anno, this.props.selectedAnno.type)
            const inputRect = this.inputGroupRef.current.getBoundingClientRect()
            const top = this.props.svg.top + annoBox[0].y + 5
            const left = this.props.svg.left + center.x - inputRect.width /2.0
            if (this.state.top !== top || this.state.left !== left){  
                this.setState({
                    top,
                    left
                })
            }
        }
    }

    /*************
     * RENDERING *
    **************/

    render(){
        if (!this.props.showLabelInput) return null
        console.log('Render LabelInput with state', this.state)
        return (
            <div ref={this.inputGroupRef} style={{position:'fixed', top:this.state.top, left:this.state.left}}>
                <InputGroup >
                    {/* <Input onKeyDown={e => this.onKeyDown(e)}/> */}
                    <Autocomplete
                        ref = {el => this.inputRef = el}
                        items={[
                        { id: 'foo', label: 'foo' },
                        { id: 'bar', label: 'bar' },
                        { id: 'baz', label: 'baz' },
                        ]}
                        shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                        getItemValue={item => item.label}
                        renderItem={(item, highlighted) =>
                        <div
                            key={item.id}
                            style={{ backgroundColor: highlighted ? '#eee' : 'transparent'}}
                        >
                            {item.label}
                        </div>
                        }
                        inputProps={{className:"form-control", onKeyDown: e => this.onKeyDown(e)}} //Added bootstrap class for input styling -.-
                        value={this.state.value}
                        onChange={e => this.setState({ value: e.target.value })}
                        onSelect={value => this.setState({ value })}
                    />
                    <InputGroupAddon addonType="append">
                        <Button id="LabelInputPopover"><FontAwesomeIcon icon={faQuestionCircle}/></Button>
                    </InputGroupAddon>
                </InputGroup>
                <UncontrolledPopover placement="top" target="LabelInputPopover">
                    <PopoverHeader><input/></PopoverHeader>
                    <PopoverBody>Sed posuere consectetur est at lobortis. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</PopoverBody>
                </UncontrolledPopover>
            </div>
        )
    }
    
}

function mapStateToProps(state) {
    return ({
        selectedAnno: state.sia.selectedAnno,
        showLabelInput: state.sia.showLabelInput
    })
}

export default connect(
    mapStateToProps, 
    {siaShowLabelInput, siaShowSingleAnno}
    ,null,
    {forwardRef:true})(LabelInput)