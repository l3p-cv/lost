import React, { useState, useEffect } from 'react'
import { useInterval } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faWandMagicSparkles,
    faUsers,
    faTags,
    faGears,
    faDownload,
} from '@fortawesome/free-solid-svg-icons'

import { CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'

import TabUser from './TabUser'
import TabGenerateExport from './TabGenerateExport'
import TabAvailableExports from './TabAvailableExports'
import TabShowLabels from './TabShowLabel'
import TabAdaptConfiguration from './TabAdaptConfiguration'
import * as annoTaskApi from '../../../../../../../actions/annoTask/anno_task_api'

const AnnoTaskTabs = (props) => {
    const [active, setActive] = useState(0)
    const [dataExports, setDataExports] = useState([])
    const { data: dataExportData, refetch } = annoTaskApi.useGetDataexports(
        props.annotask.id,
    )
    useInterval(() => {
        refetch()
    }, 2000)
    useEffect(() => {
        if (dataExportData) {
            setDataExports(dataExportData)
        }
    }, [dataExportData])
    const renderGenOrShowExportLinks = () => {
        if (dataExports.length > 0) {
            return (
                <>
                    <CNavItem>
                        <CNavLink active={active === 0} onClick={() => setActive(0)}>
                            <FontAwesomeIcon
                                color="#092F38"
                                size="1x"
                                icon={faDownload}
                            />
                            {active === 0 && ' Available Exports'}
                        </CNavLink>
                    </CNavItem>
                    <CNavItem>
                        <CNavLink active={active === 1} onClick={() => setActive(1)}>
                            <FontAwesomeIcon
                                color="#092F38"
                                size="1x"
                                icon={faWandMagicSparkles}
                            />
                            {active === 1 && ' Generate Export'}
                        </CNavLink>
                    </CNavItem>
                </>
            )
        }
        return (
            <>
                <CNavItem>
                    <CNavLink active={active === 0} onClick={() => setActive(0)}>
                        <FontAwesomeIcon
                            color="#092F38"
                            size="1x"
                            icon={faWandMagicSparkles}
                        />
                        {active === 0 && ' Generate Export'}
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink active={active === 1} onClick={() => setActive(1)}>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faDownload} />
                        {active === 1 && ' Available Exports'}
                    </CNavLink>
                </CNavItem>
            </>
        )
    }
    const renderGenOrShowExport = () => {
        if (dataExports.length > 0) {
            return (
                <>
                    <CTabPane visible={active === 0} style={{ marginTop: 30, marginLeft: 5 }}>
                        <TabAvailableExports
                            dataExports={dataExports}
                            annotaskId={props.annotask.id}
                        />
                    </CTabPane>
                    <CTabPane visible={active === 1} style={{ marginTop: 30, marginLeft: 5 }}>
                        <TabGenerateExport
                            annotask={props.annotask}
                            setActive={setActive}
                        />
                    </CTabPane>
                </>
            )
        }
        return (
            <>
                <CTabPane visible={active === 0} style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabGenerateExport annotask={props.annotask} setActive={setActive} />
                </CTabPane>
                <CTabPane visible={active === 1} style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabAvailableExports
                        dataExports={dataExports}
                        annotaskId={props.annotask.id}
                    />
                </CTabPane>
            </>
        )
    }
    return (
        // <CTabs activeTab={active} onActiveTabChange={(idx) => setActive(idx)}>
        <CNav variant="tabs" role="tablist" className='w-100'>
            <CNav variant="tabs" className='w-100' style={{ marginTop: '20px', marginLeft: '5px' }}>
                {renderGenOrShowExportLinks()}

                <CNavItem>
                    <CNavLink active={active === 2} onClick={() => setActive(2)}>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faUsers} />
                        {active === 2 && ' Adapt Users'}
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink active={active === 3} onClick={() => setActive(3)}>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faTags} />
                        {active === 3 && ' Show Labels'}
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink active={active === 4} onClick={() => setActive(4)}>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faGears} />
                        {active === 4 && ' Adapt Configuration'}
                    </CNavLink>
                </CNavItem>
            </CNav>
            <CTabContent className='w-100' style={{ paddingBottom: '10px' }}>
                {renderGenOrShowExport()}
                <CTabPane visible={active === 2} style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabUser changeUser={props.changeUser} annoTask={props.annotask} />
                </CTabPane>
                <CTabPane visible={active === 3} style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabShowLabels annoTask={props.annotask} />
                </CTabPane>
                <CTabPane visible={active === 4} style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabAdaptConfiguration annoTask={props.annotask} />
                </CTabPane>
            </CTabContent>
            {/* </CTabs> */}
        </CNav>
    )
}
export default AnnoTaskTabs
