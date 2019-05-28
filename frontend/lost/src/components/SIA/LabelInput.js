import React, {Component} from 'react'
// import {connect} from 'react-redux'
import { InputGroup,
    InputGroupAddon,
    InputGroupButtonDropdown,
    InputGroupDropdown,
    Input,
    Button,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledPopover, 
    PopoverHeader, 
    PopoverBody
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
// import actions from '../../../actions'
import Autocomplete from 'react-autocomplete'
// const {selectAnnotation, siaShowSingleAnno} = actions


class LabelInput extends Component{

    constructor(props){
        super(props)
        this.state = {
            value: ''
        }
    }
    
    /*************
     * EVENTS    *
    **************/


    /*************
     * LOGIC     *
     *************/


    /*************
     * RENDERING *
    **************/
    onKeyDown(e: Event){
        e.stopPropagation()
        console.log('LabelInput KeyDown on Input field: ', e.key)
    }

    onKeyUp(e:Event){
        e.stopPropagation()
    }

    renderInput(props){
        return <Input {...props} />
    }
    render(){
        console.log('LabelInput', this.props.anno)
        return (
            <div style={{position:'fixed', height:'auto', width:'400px', top:'400px', left:'100px'}}>
                <InputGroup>
                    {/* <Input onKeyDown={e => this.onKeyDown(e)}/> */}
                    <Autocomplete
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
                        inputProps={{className:"form-control"}} //Added bootstrap class for input styling -.-
                        value={this.state.value}
                        onChange={e => this.setState({ value: e.target.value })}
                        onSelect={value => this.setState({ value })}
                    />
                    <InputGroupAddon addonType="append">
                        <Button id="LabelInputPopover"><FontAwesomeIcon icon={faQuestionCircle}/></Button>
                    </InputGroupAddon>
                </InputGroup>
                <UncontrolledPopover placement="top" target="LabelInputPopover">
                    <PopoverHeader>Popover Title</PopoverHeader>
                    <PopoverBody>Sed posuere consectetur est at lobortis. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</PopoverBody>
                </UncontrolledPopover>
            </div>
        )
    }
    
}

// function mapStateToProps(state) {
//     return ({
//         selectedAnno: state.sia.selectedAnno,
//     })
// }

export default LabelInput