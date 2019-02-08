import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'

import './Tag.scss';

const {getMiaAnnos,getMiaImage} = actions

class Tags extends Component{
    constructor(props){
        super(props)

    }
    componentWillMount(){
        
    }

    render(){
            return(<div className='mia-tags'>Tag Area...</div>)
        
    }
}

function mapStateToProps(state){
    return({labels: state.mia.images, maxAmount: state.mia.maxAmount})
}
export default connect(mapStateToProps, {getMiaAnnos, getMiaImage})(Tags)

