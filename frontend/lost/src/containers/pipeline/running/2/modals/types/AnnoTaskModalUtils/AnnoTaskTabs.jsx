import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faWandMagicSparkles,
    faUsers,
    faTags,
    faGears,
    faDownload,
} from '@fortawesome/free-solid-svg-icons'

import { CNav, CNavItem, CNavLink, CTabContent, CTabPane, CTabs } from '@coreui/react'

import TabUser from './TabUser'
import TabGenerateExport from './TabGenerateExport'
import TabAvailableExports from './TabAvailableExports'
import TabShowLabels from './TabShowLabel'
import TabAdaptConfiguration from './TabAdaptConfiguration'
import { props } from 'lodash/fp'

const AnnoTaskTabs = (props) => {
    const [active, setActive] = useState(0)

    return (
        <CTabs activeTab={active} onActiveTabChange={(idx) => setActive(idx)}>
            <CNav variant="tabs" style={{ marginTop: '20px', marginLeft: '5px' }}>
                <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faDownload} />
                        {active === 0 && ' Available Exports'}
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon
                            color="#092F38"
                            size="1x"
                            icon={faWandMagicSparkles}
                        />
                        {active === 1 && ' Generate Export'}
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faUsers} />
                        {active === 2 && ' Adapt Users'}
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faTags} />
                        {active === 3 && ' Show Labels'}
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faGears} />
                        {active === 4 && ' Adapt Configuration'}
                    </CNavLink>
                </CNavItem>
            </CNav>
            <CTabContent>
                <CTabPane style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabAvailableExports annotaskId={props.annotask.id} />
                </CTabPane>
                <CTabPane style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabGenerateExport annotaskId={props.annotask.id} />
                </CTabPane>
                <CTabPane style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabUser changeUser={props.changeUser} annoTask={props.annotask} />
                </CTabPane>
                <CTabPane style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabShowLabels annoTask={props.annotask} />
                </CTabPane>
                <CTabPane style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabAdaptConfiguration annoTask={props.annotask} />
                </CTabPane>
            </CTabContent>
        </CTabs>
    )
}
export default AnnoTaskTabs
