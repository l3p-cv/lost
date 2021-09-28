import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTags, faFileImport } from '@fortawesome/free-solid-svg-icons'

import {
    CCol,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
    CTabs,
  } from '@coreui/react'
import BaseContainer from '../../components/BaseContainer'

import Labels from './Labels'

const LabelDashboard = () => {
    const dispatch = useDispatch()
    const [active, setActive] = useState(0)
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
    }, [])


    const renderSystemInfo = () => (
        <div>
            ToDo.
        </div>
    )

    return (
        <BaseContainer>
            <CCol xs="12" md="12" className="mb-4">       
                <CTabs activeTab={active} onActiveTabChange={idx => setActive(idx)}>
                <CNav variant="tabs">
                    <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faTags} />
                        { active === 0 && ' Labels'}
                    </CNavLink>
                    </CNavItem>
                    <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faFileImport} />
                        { active === 1 && ' Import'}
                    </CNavLink>
                    </CNavItem>
                </CNav>
                <CTabContent>
                    <CTabPane  style={{marginTop: 30}}>
                    <Labels></Labels>
                    </CTabPane>
                    <CTabPane  style={{marginTop: 30}}>
                    <div>{renderSystemInfo()}</div>
                    </CTabPane>
                </CTabContent>
                </CTabs>
            </CCol>
        </BaseContainer>
    )
}
export default LabelDashboard
