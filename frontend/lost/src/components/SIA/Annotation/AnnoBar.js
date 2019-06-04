import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Button, Popover, PopoverHeader, PopoverBody, Input } from 'reactstrap'
import actions from '../../../actions'
import Autocomplete from 'react-autocomplete'
const {selectAnnotation, siaShowSingleAnno} = actions


class AnnoBar extends Component{

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
    }

    onKeyUp(e:Event){
        e.stopPropagation()
    }

    render(){
        return null
        return (
            // <text x={10} y={10} fill="red"> {this.props.label}</text>
            <foreignObject x={this.props.anno[0].x} y={this.props.anno[0].y} width="100" height="100"> 
                {/* <div xmlns="http://www.w3.org/1999/xhtml"> */}
                    <Input placeholder={this.props.label} onKeyDown={e => this.onKeyDown(e)} onKeyUp={e => this.onKeyUp(e)} ></Input>
                    {/* <Button id={'Popover-' + this.props.idx}></Button> */}
                    <div>TEXT</div>
                    {/* <Popover placement={'top'} isOpen={true} target={'Popover-' + this.props.idx} >
                    <PopoverHeader>Popover Title</PopoverHeader>
                    <PopoverBody>Sed posuere consectetur est at lobortis. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</PopoverBody>
                    </Popover> */}
                    {/* <Autocomplete
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
                        value={this.state.value}
                        onChange={e => this.setState({ value: e.target.value })}
                        onSelect={value => this.setState({ value })}
                        onKeyDown={e => this.onKeyDown(e)}
                        onKeyUp={e => this.onKeyUp(e)}
                    /> */}
                {/* </div> */}
            </foreignObject>
        //     <g class="drawable-menubar drawable-menubar-locked drawable-menubar-selected" transform="translate(0,-20)" style="display: block;">
        //     <svg data-ref="label" class="drawable-label" x="0" y="-22" height="20" style="display: none;"><rect data-ref="label-background" rx="3" ry="3" height="100%" width="8"></rect>
        //         <text data-ref="label-text" x="4" y="50%" dominant-baseline="central" style="font-size: 12px;">no label</text>
        //     </svg>
        //     <svg data-ref="menubar" class="drawable-menubar-bar" width="273" height="20">
        //         <rect data-ref="menubar-background" class="drawable-menubar-background" width="100%" height="100%"></rect>
        //         <svg data-ref="menubar-label" class="drawable-menubar-label" width="253">
        //             <text data-ref="menubar-label-text" y="50%" dominant-baseline="central" x="4" style="font-size: 14px; display: block;">no label</text>
        //         </svg>
        //         <svg data-ref="menubar-close-button" class="drawable-menubar-close-button" x="253" y="0" width="20" height="20">
        //             <line x1="20%" y1="20%" x2="80%" y2="80%"></line>
        //             <line x1="20%" y1="80%" x2="80%" y2="20%"></line>
        //             <rect width="100%" height="100%" fill="transparent"></rect>
        //         </svg>
        //     </svg>
        // </g>
        )
    }
    
}

function mapStateToProps(state) {
    return ({
        selectedAnno: state.sia.selectedAnno,
    })
}

export default connect(
    mapStateToProps, 
    {}
    ,null,
    {}) (AnnoBar)