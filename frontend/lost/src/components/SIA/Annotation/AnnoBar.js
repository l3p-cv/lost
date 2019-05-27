import React, {Component} from 'react'
// import {connect} from 'react-redux'
import { Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap'

// import actions from '../../../actions'

// const {selectAnnotation, siaShowSingleAnno} = actions


class AnnoBar extends Component{

    constructor(props){
        super(props)
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

    render(){
        console.log('AnnoBar', this.props.anno)

        return (<text x={10} y={10} fill="red"> {this.props.label}</text>
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

// function mapStateToProps(state) {
//     return ({
//         selectedAnno: state.sia.selectedAnno,
//     })
// }

export default AnnoBar