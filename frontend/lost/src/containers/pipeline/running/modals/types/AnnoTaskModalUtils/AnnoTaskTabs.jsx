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
  // datastoreList,
  // datasetList,
  hasChangeUser = true,
  hasShowLabels = true,
  hasAdaptConfiguration = true,
  active = 0,
  setActive,
}) => {
  // const [active, setActive] = useState(0) // now given from the parent
  const [internalActive, internalSetActive] = useState(0)
  const effectiveActive = setActive ? active : internalActive
  const effectiveSetActive = setActive || internalSetActive

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
    setUpdatedAnnotask((prevState) => ({
      ...prevState,
      ...newData,
    }))
  }
  const renderGenOrShowExportLinks = () => {
    if (dataExports.length > 0) {
      return (
        <>
          <CNavItem>
            <CNavLink
              active={effectiveActive === 0}
              onClick={() => effectiveSetActive(0)}
            >
              <FontAwesomeIcon color="#092F38" size="1x" icon={faDownload} />
              {effectiveActive === 0 && ' Available Exports'}
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={effectiveActive === 1}
              onClick={() => effectiveSetActive(1)}
            >
              <FontAwesomeIcon color="#092F38" size="1x" icon={faWandMagicSparkles} />
              {effectiveActive === 1 && ' Generate Export'}
            </CNavLink>
          </CNavItem>
        </>
      )
    }
    return (
      <>
        <CNavItem>
          <CNavLink active={effectiveActive === 0} onClick={() => effectiveSetActive(0)}>
            <FontAwesomeIcon color="#092F38" size="1x" icon={faWandMagicSparkles} />
            {effectiveActive === 0 && ' Generate Export'}
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={effectiveActive === 1} onClick={() => effectiveSetActive(1)}>
            <FontAwesomeIcon color="#092F38" size="1x" icon={faDownload} />
            {effectiveActive === 1 && ' Available Exports'}
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
            visible={effectiveActive === 0}
            style={{ marginTop: 30, marginLeft: 5 }}
          >
            <TabAvailableExports dataExports={dataExports} annotaskId={annotask.id} />
          </CTabPane>
          <CTabPane
            visible={effectiveActive === 1}
            style={{ marginTop: 30, marginLeft: 5 }}
          >
            <TabGenerateExport
              annotaskId={annotask.id}
              imgCount={annotask.imgCount}
              annotatedImgCount={annotask.annotatedImgCount}
              setActive={effectiveSetActive}
            />
          </CTabPane>
        </>
      )
    }

    return (
      <>
        <CTabPane
          visible={effectiveActive === 0}
          style={{ marginTop: 30, marginLeft: 5 }}
        >
          <TabGenerateExport
            annotaskId={annotask.id}
            imgCount={annotask.imgCount}
            annotatedImgCount={annotask.annotatedImgCount}
            setActive={effectiveSetActive}
          />
        </CTabPane>
        <CTabPane
          visible={effectiveActive === 1}
          style={{ marginTop: 30, marginLeft: 5 }}
        >
          <TabAvailableExports dataExports={dataExports} annotaskId={annotask.id} />
        </CTabPane>
      </>
    )
  }
  return (
    // <CTabs activeTab={active} onActiveTabChange={(idx) => effectiveSetActive(idx)}>
    <CNav variant="tabs" role="tablist" className="w-100">
      <CNav
        variant="tabs"
        className="w-100"
        style={{ marginTop: '20px', marginLeft: '5px' }}
      >
        {renderGenOrShowExportLinks()}

        <CNavItem>
          <CNavLink active={effectiveActive === 2} onClick={() => effectiveSetActive(2)}>
            <FontAwesomeIcon color="#092F38" size="1x" icon={faBox} />
            {effectiveActive === 2 && ' Storage options'}
          </CNavLink>
        </CNavItem>

        {hasChangeUser && (
          <CNavItem>
            <CNavLink
              active={effectiveActive === 3}
              onClick={() => effectiveSetActive(3)}
            >
              <FontAwesomeIcon color="#092F38" size="1x" icon={faUsers} />
              {effectiveActive === 3 && ' Adapt Users'}
            </CNavLink>
          </CNavItem>
        )}
        {hasShowLabels && (
          <CNavItem>
            <CNavLink
              active={effectiveActive === 4}
              onClick={() => effectiveSetActive(4)}
            >
              <FontAwesomeIcon color="#092F38" size="1x" icon={faTags} />
              {effectiveActive === 4 && ' Show Labels'}
            </CNavLink>
          </CNavItem>
        )}
        {hasAdaptConfiguration && (
          <CNavItem>
            <CNavLink
              active={effectiveActive === 5}
              onClick={() => effectiveSetActive(5)}
            >
              <FontAwesomeIcon color="#092F38" size="1x" icon={faGears} />
              {effectiveActive === 5 && ' Adapt Configuration'}
            </CNavLink>
          </CNavItem>
        )}
        <CNavItem>
          <CNavLink
            active={effectiveActive === 6}
            onClick={() => effectiveSetActive(6)}
            className="inactive-tab-class"
          >
            <FontAwesomeIcon color="#092F38" size="1x" icon={faFileAlt} />
            {effectiveSetActive === 6 && ' Instruction options'}
          </CNavLink>
        </CNavItem>
      </CNav>
      <CTabContent className="w-100" style={{ paddingBottom: '10px' }}>
        {renderGenOrShowExport()}

        <CTabPane
          visible={effectiveActive === 2}
          style={{ marginTop: 30, marginLeft: 5 }}
        >
          <TabStorageSettings annotaskId={annotask.id} />
        </CTabPane>

        {hasChangeUser && (
          <CTabPane
            visible={effectiveActive === 3}
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
            visible={effectiveActive === 4}
            style={{ marginTop: 30, marginLeft: 5 }}
          >
            <TabShowLabels labelLeaves={annotask.labelLeaves} />
          </CTabPane>
        )}

        {hasAdaptConfiguration && (
          <CTabPane
            visible={effectiveActive === 5}
            style={{ marginTop: 30, marginLeft: 5 }}
          >
            <TabAdaptConfiguration
              id={annotask.id}
              type={annotask.type}
              configuration={annotask.configuration}
            />
          </CTabPane>
        )}
        <CTabPane
          visible={effectiveActive === 6}
          style={{ marginTop: 30, marginLeft: 5 }}
          className="instruction-tab"
        >
          <TabInstructions annotask={updatedAnnotask} updateAnnotask={updateAnnotask} />
        </CTabPane>
      </CTabContent>
      {/* </CTabs> */}
    </CNav>
  )
}
export default AnnoTaskTabs
