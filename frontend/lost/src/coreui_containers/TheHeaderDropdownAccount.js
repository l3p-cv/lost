import React from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { FaLock, FaUser } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import userPng from '../assets/img/avatars/user.png'

const TheHeaderDropdown = () => {
    const username = useSelector((state) => state.user.ownUser.user_name)
    const history = useHistory()

    return (
        <CDropdown inNav className="c-header-nav-items mx-2" direction="down">
            <CDropdownToggle className="c-header-nav-link" caret={false}>
                <span style={{ marginRight: 15 }}>{username}</span>
                <div className="c-avatar">
                    <img
                        alt=""
                        className="c-avatar-img"
                        src={userPng}
                        style={{ width: 40, height: 40 }}
                    />
                </div>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
                <CDropdownItem header tag="div" color="light" className="text-center">
                    <strong>Account</strong>
                </CDropdownItem>
                <CDropdownItem onClick={() => history.push('/my_profile')}>
                    <FaUser style={{ marginRight: 10 }} />
                    My Profile
                </CDropdownItem>
                <CDropdownItem onClick={() => history.push('/logout')}>
                    <FaLock style={{ marginRight: 10 }} />
                    Logout
                </CDropdownItem>
            </CDropdownMenu>
        </CDropdown>
    )
}

export default TheHeaderDropdown
