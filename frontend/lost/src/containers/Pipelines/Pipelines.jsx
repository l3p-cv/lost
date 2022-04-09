import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTasks, faPlus } from '@fortawesome/free-solid-svg-icons'

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

import RunningPipeline from '../pipeline/running/RunningPipeline'
import StartPipeline from '../pipeline/start/StartPipeline'

const Pipelines = () => {
    const dispatch = useDispatch()
    const [active, setActive] = useState(0)
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
    }, [])

    const renderSystemInfo = () => <div>ToDo.</div>

    return (
        <BaseContainer>
            <CCol xs="12" md="12" className="mb-4">
                <CTabs activeTab={active} onActiveTabChange={(idx) => setActive(idx)}>
                    <CNav variant="tabs">
                        <CNavItem>
                            <CNavLink>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faTasks}
                                />
                                {active === 0 && ' Running Pipelines'}
                            </CNavLink>
                        </CNavItem>
                        {/* <CNavItem>
                            <CNavLink>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faRocket}
                                />
                                {active === 1 && ' LOST Pipelines'}
                            </CNavLink>
                        </CNavItem> */}
                        <CNavItem>
                            <CNavLink>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faPlus}
                                />
                                {active === 1 && ' Start Pipeline'}
                            </CNavLink>
                        </CNavItem>
                        {/* <CNavItem>
                            <CNavLink>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faFileImport}
                                />
                                {active === 3 && ' Import / Update'}
                            </CNavLink>
                        </CNavItem> */}
                    </CNav>
                    <CTabContent>
                        <CTabPane style={{ marginTop: 30 }}>
                            <RunningPipeline></RunningPipeline>
                        </CTabPane>
                        {/* <CTabPane style={{ marginTop: 30 }}>
                            <LOSTPipelines></LOSTPipelines>
                        </CTabPane> */}
                        <CTabPane style={{ marginTop: 30 }}>
                            <StartPipeline></StartPipeline>
                        </CTabPane>
                        {/* <CTabPane style={{ marginTop: 30 }}>
                            <div>{renderSystemInfo()}</div>
                        </CTabPane> */}
                    </CTabContent>
                </CTabs>
            </CCol>
        </BaseContainer>
    )
}
export default Pipelines
