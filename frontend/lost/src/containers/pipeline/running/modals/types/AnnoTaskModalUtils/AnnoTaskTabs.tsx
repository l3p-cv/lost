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

import * as annoTaskApi from '../../../../../../api/anno_task'
import TabAdaptConfiguration from './TabAdaptConfiguration'
import TabAvailableExports from './TabAvailableExports'
import TabGenerateExport from './TabGenerateExport'
import TabShowLabels from './TabShowLabel'
import TabStorageSettings from './TabStorageSettings'
import TabUser from './TabUser'
import TabInstructions from './TabInstructions'

type AnnoTaskTabsProps = {
  annotask: {}
  changeUser: () => void
  hasChangeUser: boolean
  hasShowLabels: boolean
  hasAdaptConfiguration: boolean
  active: number
  setActive: () => void
  mergeExports?: boolean
}

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
  mergeExports = false,
}: AnnoTaskTabsProps) => {
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
  
  const getTabIndex = (originalIndex: number) => {
    if (mergeExports && originalIndex > 0) {
      return originalIndex - 1
    }
    return originalIndex
  }
  
  const renderGenOrShowExportLinks = () => {
    if (mergeExports) {
      return (
        <CNavItem>
          <CNavLink active={effectiveActive === 0} onClick={() => effectiveSetActive(0)}>
            <FontAwesomeIcon color="#092F38" size="1x" icon={faDownload} />
            {effectiveActive === 0 && ' Exports'}
          </CNavLink>
        </CNavItem>
      )
    }
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
    if (mergeExports) {
      return (
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
          {dataExports.length > 0 && (
            <>
              <h5 className="mt-4">Available Exports</h5>
              <TabAvailableExports dataExports={dataExports} annotaskId={annotask.id} pageSize={4} />
            </>
          )}
        </CTabPane>
      )
    }
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
          <CNavLink active={effectiveActive === getTabIndex(2)} onClick={() => effectiveSetActive(getTabIndex(2))}>
            <FontAwesomeIcon color="#092F38" size="1x" icon={faBox} />
            {effectiveActive === getTabIndex(2) && ' Storage options'}
          </CNavLink>
        </CNavItem>

        {hasChangeUser && (
          <CNavItem>
            <CNavLink
              active={effectiveActive === getTabIndex(3)}
              onClick={() => effectiveSetActive(getTabIndex(3))}
            >
              <FontAwesomeIcon color="#092F38" size="1x" icon={faUsers} />
              {effectiveActive === getTabIndex(3) && ' Adapt Users'}
            </CNavLink>
          </CNavItem>
        )}
        {hasShowLabels && (
          <CNavItem>
            <CNavLink
              active={effectiveActive === getTabIndex(4)}
              onClick={() => effectiveSetActive(getTabIndex(4))}
            >
              <FontAwesomeIcon color="#092F38" size="1x" icon={faTags} />
              {effectiveActive === getTabIndex(4) && ' Show Labels'}
            </CNavLink>
          </CNavItem>
        )}
        {hasAdaptConfiguration && (
          <CNavItem>
            <CNavLink
              active={effectiveActive === getTabIndex(5)}
              onClick={() => effectiveSetActive(getTabIndex(5))}
            >
              <FontAwesomeIcon color="#092F38" size="1x" icon={faGears} />
              {effectiveActive === getTabIndex(5) && ' Adapt Configuration'}
            </CNavLink>
          </CNavItem>
        )}
        <CNavItem>
          <CNavLink
            active={effectiveActive === getTabIndex(6)}
            onClick={() => effectiveSetActive(getTabIndex(6))}
            className="inactive-tab-class"
          >
            <FontAwesomeIcon color="#092F38" size="1x" icon={faFileAlt} />
            {effectiveSetActive === getTabIndex(6) && ' Instruction options'}
          </CNavLink>
        </CNavItem>
      </CNav>
      <CTabContent className="w-100" style={{ paddingBottom: '10px' }}>
        {renderGenOrShowExport()}

        <CTabPane
          visible={effectiveActive === getTabIndex(2)}
          style={{ marginTop: 30, marginLeft: 5 }}
        >
          <TabStorageSettings annotaskId={annotask.id} />
        </CTabPane>

        {hasChangeUser && (
          <CTabPane
            visible={effectiveActive === getTabIndex(3)}
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
            visible={effectiveActive === getTabIndex(4)}
            style={{ marginTop: 30, marginLeft: 5 }}
          >
            <TabShowLabels labelLeaves={annotask.labelLeaves} />
          </CTabPane>
        )}

        {hasAdaptConfiguration && (
          <CTabPane
            visible={effectiveActive === getTabIndex(5)}
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
          visible={effectiveActive === getTabIndex(6)}
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
