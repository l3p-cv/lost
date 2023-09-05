import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import actions from '../../actions'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCogs,
    faWandMagicSparkles,
    faUsers,
    faCubes,
    faDatabase,
    faTags,
    faRobot,
    faTasks,
} from '@fortawesome/free-solid-svg-icons'

import {
    CCol,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
} from '@coreui/react'
import BaseContainer from '../../components/BaseContainer'

import WorkersTable from '../Workers/WorkersTable'
import UsersAndGroups from '../Users/UsersAndGroups'
import TabJupyterLab from './TabJupyterLab'
import Labels from '../Labels/Labels'
import DSTable from '../DataSources/DSTable'
import PipelineProjects from '../Pipelines/PipelineProjects'

const AdminArea = () => {
    const dispatch = useDispatch()
    const [active, setActive] = useState(0)
    const jupyterLabUrl = useSelector((state) => state.lost.jupyterLabUrl)
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
        dispatch(actions.getJupyterLabUrl(true))
    }, [])

    const renderJupyterLabNav = () => {
        if (jupyterLabUrl !== '') {
            return (
                <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faRobot} />
                        {active === 5 && ' JupyterLab'}
                    </CNavLink>
                </CNavItem>
            )
        }
    }
    const renderJupyterLabTab = () => {
        if (jupyterLabUrl !== '') {
            return (
                <CTabPane style={{ marginTop: 30 }}>
                    <TabJupyterLab jupyterLabUrl={jupyterLabUrl}></TabJupyterLab>
                </CTabPane>
            )
        }
    }

    return (
        <BaseContainer>
            <CCol xs="12" md="12" className="mb-4">
                <CNav variant="tabs" role="tablist">
                    <CNav variant="tabs">
                        {/* <CNavItem>
                            <CNavLink>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faInfoCircle}
                                />
                                {active === 0 && ' System Information'}
                            </CNavLink>
                        </CNavItem> */}
                        <CNavItem>
                            <CNavLink active={active === 0} onClick={() => setActive(0)}>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faUsers}
                                />
                                {active === 0 && ' Users & Groups'}
                            </CNavLink>
                        </CNavItem>
                        <CNavItem>
                            <CNavLink active={active === 1} onClick={() => setActive(1)}>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faWandMagicSparkles}
                                />
                                {active === 1 && ' Pipeline Projects'}
                            </CNavLink>
                        </CNavItem>
                        <CNavItem>
                            <CNavLink active={active === 2} onClick={() => setActive(2)}>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faDatabase}
                                />
                                {active === 2 && ' Global Datasources'}
                            </CNavLink>
                        </CNavItem>
                        <CNavItem>
                            <CNavLink active={active === 3} onClick={() => setActive(3)}>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faTags}
                                />
                                {active === 3 && ' Global Labels'}
                            </CNavLink>
                        </CNavItem>
                        {/* <CNavItem>
                            <CNavLink>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faTasks}
                                />
                                {active === 6 && ' Global Pipelines'}
                            </CNavLink>
                        </CNavItem> */}
                        <CNavItem>
                            <CNavLink active={active === 4} onClick={() => setActive(4)}>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faCubes}
                                />
                                {active === 4 && ' Worker'}
                            </CNavLink>
                        </CNavItem>
                        {/* <CNavItem>
                            <CNavLink active={active=== 5} onClick={() => setActive(5)}>
                                <FontAwesomeIcon
                                    color="#092F38"
                                    size="1x"
                                    icon={faCogs}
                                />
                                {active === 5 && ' Settings'}
                            </CNavLink>
                        </CNavItem> */}
                        {renderJupyterLabNav()}
                    </CNav>
                    <CTabContent className='w-100'>
                        <CTabPane role="tabpanel" aria-labelledby="users-tab-pane" visible={active === 0} style={{ marginTop: 30 }}>
                            <UsersAndGroups></UsersAndGroups>
                        </CTabPane>
                        <CTabPane role="tabpanel" aria-labelledby="pipelineprojects-tab-pane" visible={active === 1} style={{ marginTop: 30 }}>
                            <PipelineProjects visLevel="global"></PipelineProjects>
                        </CTabPane>
                        <CTabPane role="tabpanel" aria-labelledby="datasources-tab-pane" visible={active === 2} style={{ marginTop: 30 }}>
                            <DSTable visLevel="global"></DSTable>
                        </CTabPane>
                        <CTabPane role="tabpanel" aria-labelledby="labels-tab-pane" visible={active === 3} style={{ marginTop: 30 }}>
                            <Labels visLevel="global"></Labels>
                        </CTabPane>
                        <CTabPane role="tabpanel" aria-labelledby="workers-tab-pane" visible={active === 4} style={{ marginTop: 30 }}>
                            <WorkersTable></WorkersTable>
                        </CTabPane>
                        {/* <CTabPane style={{ marginTop: 30 }}>
                            <div>
                                <ConfigPage />
                            </div>
                        </CTabPane> */}
                        {renderJupyterLabTab()}
                    </CTabContent>
                </CNav>
            </CCol>
        </BaseContainer>
    )
}
export default AdminArea
