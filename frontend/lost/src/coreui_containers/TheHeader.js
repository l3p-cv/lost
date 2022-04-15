import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CHeader, CToggler, CHeaderBrand, CHeaderNav } from '@coreui/react'
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
                        <CToggler
                            inHeader
                            className="ml-md-3 d-lg-none"
                            onClick={toggleSidebarMobile}
                        />
                        <CToggler
                            inHeader
                            className="ml-3 d-md-down-none"
                            onClick={toggleSidebar}
                        />
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
        <CHeader withSubheader>
            {renderSidebarToggler()}
            <CHeaderBrand className="mx-auto d-lg-none" to="/dashboard">
                <img alt="" style={{ height: 40 }} className="img-avatar" />
            </CHeaderBrand>

            <CHeaderNav className="d-md-down-none mr-auto" />

            <CHeaderNav className="px-3">
                {/* <div>{t('general.selectedLanguage')}</div>
                <TheHeaderDropdownLanguageSelector /> */}
                <TheHeaderDropdownAccount />
            </CHeaderNav>
        </CHeader>
    )
}

export default TheHeader
