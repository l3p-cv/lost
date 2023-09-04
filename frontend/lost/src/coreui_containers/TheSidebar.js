import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    CSidebar,
    CSidebarBrand,
    CSidebarNav,
    CNavTitle,
    CNavItem,
    CSidebarToggler,
} from '@coreui/react'

import actions from '../actions'
import lostLogoPng from '../assets/img/brand/lost_logo.png'

const TheSidebar = ({ navItems }) => {
    const dispatch = useDispatch()
    const isNavBarVisible = useSelector((state) => state.lost.isNavBarVisible)
    // remove component key from navItems
    const onShowChange = () => {
        console.log("Navbar visibility change event");
        // dispatch(actions.setNavbarVisible(!isNavBarVisible))
    }
    if (navItems) {
        const navbarItemsDom = []
        let itemKey = 0;
        navItems.forEach((item) => {
            let newItem = ''
            switch (item._tag) {
                case "CSidebarNavTitle":
                    newItem = (<CNavTitle key={itemKey++}>{item._children[0]}</CNavTitle>)
                    break;
                case "CSidebarNavItem":
                    newItem = (
                        <CNavItem key={itemKey++} href={item.to}>
                            {item.icon}
                            {item.name}
                        </CNavItem>
                    )
                    break;
                default:
                    newItem = (
                        <CNavItem key={itemKey++} href="#">
                            {item.name}
                        </CNavItem>
                    )
            }
            navbarItemsDom.push(newItem)
        })

        return (
            <CSidebar position="fixed" visible={isNavBarVisible} onVisibleChange={onShowChange}>
                <CSidebarBrand className="d-md-down-none" to="/dashboard">
                    <img
                        alt=""
                        src={lostLogoPng}
                        style={{ maxWidth: '60%', maxHeight: '60%' }}
                        className="img-avatar"
                    />
                </CSidebarBrand>
                <CSidebarNav>
                    {navbarItemsDom}
                    {/* <CreateElement
                        items={navItems}
                        components={{
                            // CNavDivider,
                            CNavGroup,
                            CNavItem,
                            CNavTitle,
                        }}
                    /> */}
                </CSidebarNav>
                {/* <CSidebarMinimizer className="c-d-md-down-none" /> */}
                <CSidebarToggler
                    className="d-none d-lg-flex"
                    onClick={() => dispatch(actions.setNavbarVisible(!isNavBarVisible))}
                />
            </CSidebar>
        )
    }
    return <div>Loading...</div>
}

export default React.memo(TheSidebar)
