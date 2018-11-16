import React, {Component} from 'react'
import {DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import {AppHeaderDropdown} from '@coreui/react'

import {createHashHistory} from 'history'

const history = createHashHistory()

export default class AccountDropdown extends Component {
    render() {
        return (
            <AppHeaderDropdown direction='down'>
                <DropdownToggle nav>
                    <img
                        src={'assets/img/avatars/user.png'}
                        className='img-avatar'
                        alt='admin@bootstrapmaster.com'/>
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
        )
    }
}