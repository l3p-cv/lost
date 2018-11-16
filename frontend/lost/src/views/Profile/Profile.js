import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'

const {getOwnUser} = actions

class MyProfile extends Component{
    render(){
        return(
            <div>
                In Profile View !
            </div>
        )
    }
}

function mapStateToProps(state){
    return{ownUser: state.user.ownUser}
}
export default connect(mapStateToProps, {getOwnUser})(MyProfile)