import {
    faBox,
    faDownload,
    faFileAlt,
    faGears,
    faTags,
    faUsers,
    faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useInterval } from 'react-use'

import { CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'

import * as annoTaskApi from '../../../../../../actions/annoTask/anno_task_api'
import TabAdaptConfiguration from './TabAdaptConfiguration'
import TabAvailableExports from './TabAvailableExports'
import TabGenerateExport from './TabGenerateExport'
import TabShowLabels from './TabShowLabel'
import TabStorageSettings from './TabStorageSettings'
import TabUser from './TabUser'
import TabInstructions from './TabInstructions'

const AnnoTaskTabs = ({
    annotask,
    changeUser,
    datastoreList,
    datasetList,
    hasChangeUser = true,
    hasShowLabels = true,
    hasAdaptConfiguration = true,
}) => {
    const [active, setActive] = useState(0)
    const [dataExports, setDataExports] = useState([])
    const { data: dataExportData, refetch } = annoTaskApi.useGetDataexports(annotask.id)
    const [updatedAnnotask, setUpdatedAnnotask] = useState(annotask)
    useInterval(() => {
        refetch()
    }, 2000)
    useEffect(() => {
        if (dataExportData) {
            setDataExports(dataExportData)
        }
    }, [dataExportData])
    const updateAnnotask = (newData) => {
        setUpdatedAnnotask(prevState => ({
            ...prevState,
            ...newData
        }))
    }
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
                    <CTabPane
                        visible={active === 0}
                        style={{ marginTop: 30, marginLeft: 5 }}
                    >
                        <TabAvailableExports
                            dataExports={dataExports}
                            annotaskId={annotask.id}
                        />
                    </CTabPane>
                    <CTabPane
                        visible={active === 1}
                        style={{ marginTop: 30, marginLeft: 5 }}
                    >
                        <TabGenerateExport
                            annotaskId={annotask.id}
                            imgCount={annotask.imgCount}
                            annotatedImgCount={annotask.annotatedImgCount}
                            setActive={setActive}
                        />
                    </CTabPane>
                </>
            )
        }

        return (
            <>
                <CTabPane visible={active === 0} style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabGenerateExport
                        annotaskId={annotask.id}
                        imgCount={annotask.imgCount}
                        annotatedImgCount={annotask.annotatedImgCount}
                        setActive={setActive}
                    />
                </CTabPane>
                <CTabPane visible={active === 1} style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabAvailableExports
                        dataExports={dataExports}
                        annotaskId={annotask.id}
                    />
                </CTabPane>
            </>
        )
    }
    return (
        // <CTabs activeTab={active} onActiveTabChange={(idx) => setActive(idx)}>
        <CNav variant="tabs" role="tablist" className="w-100">
            <CNav
                variant="tabs"
                className="w-100"
                style={{ marginTop: '20px', marginLeft: '5px' }}
            >
                {renderGenOrShowExportLinks()}

                <CNavItem>
                    <CNavLink active={active === 2} onClick={() => setActive(2)}>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faBox} />
                        {active === 2 && ' Storage options'}
                    </CNavLink>
                </CNavItem>

                {hasChangeUser && (
                    <CNavItem>
                        <CNavLink active={active === 3} onClick={() => setActive(3)}>
                            <FontAwesomeIcon color="#092F38" size="1x" icon={faUsers} />
                            {active === 3 && ' Adapt Users'}
                        </CNavLink>
                    </CNavItem>
                )}
                {hasShowLabels && (
                    <CNavItem>
                        <CNavLink active={active === 4} onClick={() => setActive(4)}>
                            <FontAwesomeIcon color="#092F38" size="1x" icon={faTags} />
                            {active === 4 && ' Show Labels'}
                        </CNavLink>
                    </CNavItem>
                )}
                {hasAdaptConfiguration && (
                    <CNavItem>
                        <CNavLink active={active === 5} onClick={() => setActive(5)}>
                            <FontAwesomeIcon color="#092F38" size="1x" icon={faGears} />
                            {active === 5 && ' Adapt Configuration'}
                        </CNavLink>
                    </CNavItem>
                )}
                                <CNavItem>
                    <CNavLink active={active === 6} onClick={() => setActive(6)}  className='inactive-tab-class'>
                        <FontAwesomeIcon color="#092F38" size="1x" icon={faFileAlt} />
                        {active === 6 && ' Instruction options'}
                    </CNavLink>
                </CNavItem>
            </CNav>
            <CTabContent className="w-100" style={{ paddingBottom: '10px' }}>
                {renderGenOrShowExport()}

                <CTabPane visible={active === 2} style={{ marginTop: 30, marginLeft: 5 }}>
                    <TabStorageSettings annotaskId={annotask.id} />
                </CTabPane>

                {hasChangeUser && (
                    <CTabPane
                        visible={active === 3}
                        style={{ marginTop: 30, marginLeft: 5 }}
                    >
                        <TabUser
                            annotaskId={annotask.id}
                            annotaskUser={annotask.userName}
                            changeUser={changeUser}
                        />
                    </CTabPane>
                )}

                {hasShowLabels && (
                    <CTabPane
                        visible={active === 4}
                        style={{ marginTop: 30, marginLeft: 5 }}
                    >
                        <TabShowLabels labelLeaves={annotask.labelLeaves} />
                    </CTabPane>
                )}

                {hasAdaptConfiguration && (
                    <CTabPane
                        visible={active === 5}
                        style={{ marginTop: 30, marginLeft: 5 }}
                    >
                        <TabAdaptConfiguration
                            id={annotask.id}
                            type={annotask.type}
                            configuration={annotask.configuration}
                        />
                    </CTabPane>
                )}
                <CTabPane visible={active === 6} style={{ marginTop: 30, marginLeft: 5 }} className='instruction-tab'>
                <TabInstructions annotask={updatedAnnotask} updateAnnotask={updateAnnotask} />
                </CTabPane>
            </CTabContent>
            {/* </CTabs> */}
        </CNav>
    )
}
export default AnnoTaskTabs
