import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import guiSetup from '../guiSetup'
import { useLostConfig } from '../hooks/useLostConfig'
import TheContent from './TheContent'
import TheFooter from './TheFooter'
import TheHeader from './TheHeader'
import TheSidebar from './TheSidebar'

const TheLayout = () => {
    const role = useRef()
    const navigate = useNavigate()
    const [navItems, setNavItems] = useState([])
    const [routes, setRoutes] = useState([])
    const [canShowSidebar, setCanShowSidebar] = useState(true)
    const { i18n } = useTranslation()

    const { setRoles } = useLostConfig()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            axios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem(
                'token',
            )}`
            const { roles } = jwtDecode(token).user_claims
            role.current = roles[0]
            if (!guiSetup[role.current]) {
                throw new Error(`Role ${role.current} not found in Gui Setup`)
            } else {
                const roles = Object.keys(guiSetup).filter(
                    (e) => e !== 'additionalRoutes',
                )
                setRoles(roles)
                const newRoutes1 = guiSetup[role.current].navItems.map((navItem) => ({
                    path: navItem.to,
                    name: navItem,
                    component: navItem.component,
                }))
                let newRoutes2 = []
                if (guiSetup.additionalRoutes) {
                    newRoutes2 = guiSetup.additionalRoutes.map((route) => ({
                        path: route.path,
                        name: route.path,
                        component: route.component,
                    }))
                }
                const newRoutes = [...newRoutes1, ...newRoutes2]
                setRoutes(newRoutes)

                if (window.location.pathname === '/') {
                    navigate(guiSetup[role.current].redirect)
                }
            }
        } else {
            navigate('/login')
        }
    }, [])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            // ???
            const navItemsFiltered = guiSetup[role.current].navItems.map(
                ({ component, ...navItem }) => {
                    const name =
                        i18n.language === 'de' && navItem.de_name
                            ? navItem.de_name
                            : navItem.name
                    if (navItem.title) {
                        return {
                            _tag: 'CSidebarNavTitle',
                            _children: [name],
                        }
                    }

                    return {
                        _tag: 'CSidebarNavItem',
                        ...navItem,
                        name,
                    }
                },
            )
            setNavItems(navItemsFiltered)
        }
    }, [i18n.language])

    return (
        <div>
            <TheSidebar
                navItems={navItems}
                canShowSidebar={canShowSidebar}
                setCanShowSidebar={setCanShowSidebar}
            />
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <TheHeader
                    numNavItems={navItems.length}
                    canShowSidebar={canShowSidebar}
                    setCanShowSidebar={setCanShowSidebar}
                />
                <div className="body flex-grow-1 px-3">
                    <TheContent routes={routes} />
                </div>
                <TheFooter />
            </div>
        </div>
    )
}

export default TheLayout
