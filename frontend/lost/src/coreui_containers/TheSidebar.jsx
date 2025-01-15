import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
    CNavItem,
    CNavLink,
    CNavTitle,
    CSidebar,
    CSidebarBrand,
    CSidebarNav,
    CSidebarToggler,
} from '@coreui/react'

// import actions from '../actions'
import lostLogoPng from '../assets/img/brand/lost_logo.png'

const TheSidebar = ({ navItems, canShowSidebar, setCanShowSidebar }) => {
    const [isUnfoldable, setisUnfoldable] = useState(false)

    // remove component key from navItems
    // const onShowChange = () => {
    //     console.log("Navbar visibility change event");
    //     // dispatch(actions.setNavbarVisible(!isNavBarVisible))
    // }
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
                        <CNavItem key={itemKey++}>
                            <NavLink key={itemKey++} to={item.to}>
                                <CNavLink key={itemKey++}>
                                    <span style={{ width: '20px', marginLeft: '5px', marginRight: '25px' }}>{item.icon}</span>
                                    {item.name}
                                </CNavLink>
                            </NavLink>
                        </CNavItem >
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
            <CSidebar
                position="fixed"
                unfoldable={isUnfoldable}
                visible={canShowSidebar}
                onVisibleChange={(visible) => {
                    setCanShowSidebar(visible)
                }}
            >
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
                </CSidebarNav>
                <CSidebarToggler
                    className="d-none d-lg-flex"
                    onClick={() => setisUnfoldable(!isUnfoldable)}
                />
            </CSidebar>
        )
    }
    return <div>Loading...</div>
}

export default React.memo(TheSidebar)
