import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faInfoCircle, faUsers, faCubes, faDatabase } from '@fortawesome/free-solid-svg-icons'

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

import WorkersTable from '../Workers/WorkersTable'
import UsersAndGroups from '../Users/UsersAndGroups'

const AdminArea = () => {
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
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faInfoCircle} />
                        { active === 0 && ' System Information'}
                    </CNavLink>
                    </CNavItem>
                    <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faUsers} />
                        { active === 1 && ' Users & Groups'}
                    </CNavLink>
                    </CNavItem>
                    <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faCogs} />
                        { active === 2 && ' Settings'}
                    </CNavLink>
                    </CNavItem>
                    <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faCubes} />
                        { active === 3 && ' Worker'}
                    </CNavLink>
                    </CNavItem>
                    <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faDatabase} />
                        { active === 4 && ' Global Datasources'}
                    </CNavLink>
                    </CNavItem>
                </CNav>
                <CTabContent>
                    <CTabPane  style={{marginTop: 30}}>
                    <div>{renderSystemInfo()}</div>
                    </CTabPane>
                    <CTabPane  style={{marginTop: 30}}>
                    <UsersAndGroups></UsersAndGroups>
                    </CTabPane>
                    <CTabPane  style={{marginTop: 30}}>
                    <div>{renderSystemInfo()}</div>
                    </CTabPane>
                    <CTabPane  style={{marginTop: 30}}>
                    <WorkersTable></WorkersTable>
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
export default AdminArea
