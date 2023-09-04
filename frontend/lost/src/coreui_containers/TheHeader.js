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

const TheHeader = ({ numNavItems }) => {
    const dispatch = useDispatch()
    const isNavBarVisible = useSelector((state) => state.lost.isNavBarVisible)
    const toggleSidebar = () => {
        dispatch(actions.setNavbarVisible(!isNavBarVisible))
    }
    const toggleSidebarMobile = () => {
        dispatch(actions.setNavbarVisible(!isNavBarVisible))
    }

    const renderSidebarToggler = () => {
        if (numNavItems) {
            if (numNavItems > 1) {
                return (
                    <>
                        <CHeaderToggler
                            className="ps-1 ml-md-3 d-lg-none"
                            onClick={toggleSidebarMobile}
                        >
                            <CIcon icon={cilMenu} size="lg" />
                        </CHeaderToggler >
                        <CHeaderToggler
                            className="ps-1 ml-3 d-md-down-none"
                            onClick={toggleSidebar}
                        >
                            <CIcon icon={cilMenu} size="lg" />
                        </CHeaderToggler >
                        {/* <CToggler
                            inHeader
                            className="ml-md-3 d-lg-none"
                            onClick={toggleSidebarMobile}
                        />
                        <CToggler
                            inHeader
                            className="ml-3 d-md-down-none"
                            onClick={toggleSidebar}
                        /> */}
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
