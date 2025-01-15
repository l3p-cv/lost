import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CHeader, CHeaderToggler, CHeaderBrand, CHeaderNav } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
// import { useTranslation } from 'react-i18next'
// routes config

// import TheHeaderDropdownLanguageSelector from './TheHeaderDropdownLanguageSelector'
import TheHeaderDropdownAccount from './TheHeaderDropdownAccount'

import actions from '../actions'

const TheHeader = ({ numNavItems, canShowSidebar, setCanShowSidebar }) => {
    const dispatch = useDispatch()
    // const isNavBarVisible = useSelector((state) => state.lost.isNavBarVisible)
    // const sidebarShow = useSelector((state) => state.lost.sidebarShow)
    // const sidebarShow = useSelector((state) => state.lost.isNavBarVisible)
    // const toggleSidebar = () => {
    //     dispatch(actions.setNavbarVisible(!isNavBarVisible))
    // }

    const renderSidebarToggler = () => {
        if (numNavItems) {
            if (numNavItems > 1) {
                return (
                    <>
                        <CHeaderToggler
                            className="ps-1"
                            onClick={() => setCanShowSidebar(!canShowSidebar)}
                        >
                            <CIcon icon={cilMenu} size="lg" />
                        </CHeaderToggler>
                    </>
                )
            } else {
                dispatch(actions.setNavbarVisible(false))
            }
        }
        return null
    }

    // const { t } = useTranslation()
    return (
        <CHeader>
            {renderSidebarToggler()}
            <CHeaderBrand className="mx-auto d-lg-none" to="/dashboard">
                <img alt="" style={{ height: 40 }} className="img-avatar" />
            </CHeaderBrand>

            <CHeaderNav className="px-3">
                {/* <div>{t('general.selectedLanguage')}</div>
                <TheHeaderDropdownLanguageSelector /> */}
                <TheHeaderDropdownAccount />
            </CHeaderNav>
        </CHeader>
    )
}

export default TheHeader
