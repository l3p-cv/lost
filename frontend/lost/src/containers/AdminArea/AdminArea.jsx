import { useEffect, useState } from 'react'

import {
    faCubes,
    faDatabase,
    faProjectDiagram,
    faRobot,
    faTags,
    faUsers,
    faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
    CCol,
    CContainer,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
    CTooltip,
} from '@coreui/react'
import BaseContainer from '../../components/BaseContainer'

import { useLostConfig } from '../../hooks/useLostConfig'
import DSTable from '../DataSources/DSTable'
import Labels from '../Labels/Labels'
import PipelineProjects from '../Pipelines/PipelineProjects'
import UsersAndGroups from '../Users/UsersAndGroups'
import WorkersTable from '../Workers/WorkersTable'
import { TabInferenceModels } from './TabInferenceModels'
import TabJupyterLab from './TabJupyterLab'

const AdminArea = () => {
    const [active, setActive] = useState(0)
    const { jupyterLabUrl, refetchJupyterLabUrl } = useLostConfig()

    useEffect(() => {
        refetchJupyterLabUrl()
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
        <CContainer style={{ marginTop: '15px' }}>
            <h3 className="card-title mb-3" style={{ textAlign: 'center' }}>
                Admin
            </h3>
            <BaseContainer>
                <CCol xs="12" md="12" className="mb-4">
                    <CNav variant="tabs" role="tablist">
                        <CNav variant="tabs">
                            <CNavItem>
                                <CTooltip content="Users & Groups" placement="top">
                                    <CNavLink
                                        active={active === 0}
                                        onClick={() => setActive(0)}
                                    >
                                        <FontAwesomeIcon
                                            color="#092F38"
                                            size="1x"
                                            icon={faUsers}
                                        />
                                        {active === 0 && ' Users & Groups'}
                                    </CNavLink>
                                </CTooltip>
                            </CNavItem>
                            <CNavItem>
                                <CTooltip content="Pipeline Projects" placement="top">
                                    <CNavLink
                                        active={active === 1}
                                        onClick={() => setActive(1)}
                                    >
                                        <FontAwesomeIcon
                                            color="#092F38"
                                            size="1x"
                                            icon={faWandMagicSparkles}
                                        />
                                        {active === 1 && ' Pipeline Projects'}
                                    </CNavLink>
                                </CTooltip>
                            </CNavItem>
                            <CNavItem>
                                <CTooltip content="Global Datasources" placement="top">
                                    <CNavLink
                                        active={active === 2}
                                        onClick={() => setActive(2)}
                                    >
                                        <FontAwesomeIcon
                                            color="#092F38"
                                            size="1x"
                                            icon={faDatabase}
                                        />
                                        {active === 2 && ' Global Datasources'}
                                    </CNavLink>
                                </CTooltip>
                            </CNavItem>
                            <CNavItem>
                                <CTooltip content="Global Labels" placement="top">
                                    <CNavLink
                                        active={active === 3}
                                        onClick={() => setActive(3)}
                                    >
                                        <FontAwesomeIcon
                                            color="#092F38"
                                            size="1x"
                                            icon={faTags}
                                        />
                                        {active === 3 && ' Global Labels'}
                                    </CNavLink>
                                </CTooltip>
                            </CNavItem>
                            <CNavItem>
                                <CTooltip content="Worker" placement="top">
                                    <CNavLink
                                        active={active === 4}
                                        onClick={() => setActive(4)}
                                    >
                                        <FontAwesomeIcon
                                            color="#092F38"
                                            size="1x"
                                            icon={faCubes}
                                        />
                                        {active === 4 && ' Worker'}
                                    </CNavLink>
                                </CTooltip>
                            </CNavItem>
                            <CNavItem>
                                <CTooltip content="Inference Models" placement="top">
                                    <CNavLink
                                        active={active === 5}
                                        onClick={() => setActive(5)}
                                    >
                                        <FontAwesomeIcon
                                            color="#092F38"
                                            size="1x"
                                            icon={faProjectDiagram}
                                        />
                                        {active === 5 && ' Inference Models'}
                                    </CNavLink>
                                </CTooltip>
                            </CNavItem>
                            {renderJupyterLabNav()}
                        </CNav>
                        <CTabContent className="w-100">
                            <CTabPane
                                role="tabpanel"
                                aria-labelledby="users-tab-pane"
                                visible={active === 0}
                                style={{ marginTop: 30 }}
                            >
                                <UsersAndGroups></UsersAndGroups>
                            </CTabPane>
                            <CTabPane
                                role="tabpanel"
                                aria-labelledby="pipelineprojects-tab-pane"
                                visible={active === 1}
                                style={{ marginTop: 30 }}
                            >
                                <PipelineProjects visLevel="global"></PipelineProjects>
                            </CTabPane>
                            <CTabPane
                                role="tabpanel"
                                aria-labelledby="datasources-tab-pane"
                                visible={active === 2}
                                style={{ marginTop: 30 }}
                            >
                                <DSTable visLevel="global"></DSTable>
                            </CTabPane>
                            <CTabPane
                                role="tabpanel"
                                aria-labelledby="labels-tab-pane"
                                visible={active === 3}
                                style={{ marginTop: 30 }}
                            >
                                <Labels visLevel="global" showHeader={false}></Labels>
                            </CTabPane>
                            <CTabPane
                                role="tabpanel"
                                aria-labelledby="workers-tab-pane"
                                visible={active === 4}
                                style={{ marginTop: 30 }}
                            >
                                <WorkersTable></WorkersTable>
                            </CTabPane>
                            <CTabPane
                                role="tabpanel"
                                aria-labelledby="inference-models-tab-pane"
                                visible={active === 5}
                                style={{ marginTop: 30 }}
                            >
                                <TabInferenceModels />
                            </CTabPane>
                            {renderJupyterLabTab()}
                        </CTabContent>
                    </CNav>
                </CCol>
            </BaseContainer>
        </CContainer>
    )
}
export default AdminArea
