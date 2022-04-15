import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    CCreateElement,
    CSidebar,
    CSidebarBrand,
    CSidebarNav,
    CSidebarNavDivider,
    CSidebarNavTitle,
    CSidebarMinimizer,
    CSidebarNavDropdown,
    CSidebarNavItem,
} from '@coreui/react'

import actions from '../actions'
import lostLogoPng from '../assets/img/brand/lost_logo.png'

const TheSidebar = ({ navItems }) => {
    const dispatch = useDispatch()
    const isNavBarVisible = useSelector((state) => state.lost.isNavBarVisible)
    // remove component key from navItems
    const onShowChange = () => {
        dispatch(actions.setNavbarVisible(!isNavBarVisible))
    }
    if (navItems) {
        return (
            <CSidebar show={isNavBarVisible} onShowChange={onShowChange}>
                <CSidebarBrand className="d-md-down-none" to="/dashboard">
                    <img
                        alt=""
                        src={lostLogoPng}
                        style={{ maxWidth: '60%', maxHeight: '60%' }}
                        className="img-avatar"
                    />
                </CSidebarBrand>
                <CSidebarNav>
                    <CCreateElement
                        items={navItems}
                        components={{
                            CSidebarNavDivider,
                            CSidebarNavDropdown,
                            CSidebarNavItem,
                            CSidebarNavTitle,
                        }}
                    />
                </CSidebarNav>
                <CSidebarMinimizer className="c-d-md-down-none" />
            </CSidebar>
        )
    }
    return <div>Loading...</div>
}

export default React.memo(TheSidebar)
