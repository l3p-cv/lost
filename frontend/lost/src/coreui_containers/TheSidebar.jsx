import {
    CNavItem,
    CNavLink,
    CNavTitle,
    CSidebar,
    CSidebarBrand,
    CSidebarHeader,
    CSidebarNav,
    CSidebarToggler,
} from '@coreui/react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const TheSidebar = ({ navItems, canShowSidebar, setCanShowSidebar }) => {
    const [isUnfoldable, setisUnfoldable] = useState(false)

    const sidebarStyling = {
        '--cui-sidebar-bg': '#092f38',
        '--cui-sidebar-color': '#eee',
    }

    if (navItems) {
        const navbarItemsDom = []
        let itemKey = 0
        navItems.forEach((item) => {
            let newItem = ''
            switch (item._tag) {
                case 'CSidebarNavTitle':
                    newItem = <CNavTitle key={itemKey++}>{item._children[0]}</CNavTitle>
                    break
                case 'CSidebarNavItem':
                    newItem = (
                        <CNavItem key={itemKey++}>
                            <Link to={item.to}>
                                <CNavLink>
                                    <span
                                        style={{
                                            width: '20px',
                                            marginLeft: '5px',
                                            marginRight: '25px',
                                        }}
                                    >
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </CNavLink>
                            </Link>
                        </CNavItem>
                    )
                    break
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
                colorScheme="dark"
                narrow={isUnfoldable}
                visible={canShowSidebar}
                onVisibleChange={(visible) => {
                    setCanShowSidebar(visible)
                }}
                style={sidebarStyling}
            >
                <CSidebarHeader className="d-md-down-none">
                    <CSidebarBrand>
                    <img
                        alt=""
                        src="/assets/lost_logo.png"
                        style={{ maxWidth: '60%', maxHeight: '60%' }}
                        className="img-avatar"
                    />
                    </CSidebarBrand>
                </CSidebarHeader>
                <CSidebarNav>{navbarItemsDom}</CSidebarNav>
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
