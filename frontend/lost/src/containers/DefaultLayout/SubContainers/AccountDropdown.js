import React, {Component} from 'react'
import {DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import {AppHeaderDropdown} from '@coreui/react'
import {connect} from 'react-redux'
import {createHashHistory} from 'history'
import actions from '../../../actions'

const history = createHashHistory()
const {getOwnUser} = actions

class AccountDropdown extends Component {
    constructor(props){
        super(props)
        this.state = {
            user_name: '',
            first_name: '',
            last_name: '',
            email: ''
        }
        this.callback = this.callback.bind(this)
    }
    componentDidMount(){
        this.props.getOwnUser(this.callback)
    }
    callback(){
        const { user_name, first_name, last_name, email } = this.props.ownUser
        this.setState({user_name, first_name, last_name, email})
    }
    render() {
        return (
            <React.Fragment>
            <AppHeaderDropdown direction='down'>
                <DropdownToggle nav>
                {this.state.user_name} 
                    <img
                        src={'assets/img/avatars/user.png'}
                        className='img-avatar'
                        alt={this.state.email}/>
                </DropdownToggle>
                <DropdownMenu
                    right
                    style={{
                    right: 'auto'
                }}>
                    <DropdownItem header tag='div' className='text-center'>
                        <strong>Settings</strong>
                    </DropdownItem>
                    <DropdownItem onClick={() => history.push('profile')}>
                        <i className='fa fa-user'></i>
                        Profile</DropdownItem>
                    <DropdownItem header tag='div' className='text-center'>
                        <strong>Account</strong>
                    </DropdownItem>
                    <DropdownItem onClick={() => history.push('/logout')}>
                        <i className='fa fa-lock'></i>
                        Logout</DropdownItem>
                </DropdownMenu>
            </AppHeaderDropdown>
            </React.Fragment>
        )
    }
}

function mapStateToProps(state){
    return({ownUser: state.user.ownUser})
}
export default connect(mapStateToProps, {getOwnUser})(AccountDropdown)