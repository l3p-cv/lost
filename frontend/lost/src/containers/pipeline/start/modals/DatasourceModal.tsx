import { useCallback, useEffect, useMemo, useState } from 'react'
import LostFileBrowser from '../../../../components/FileBrowser/LostFileBrowser'

import { useNodesData, useReactFlow } from '@xyflow/react'
import { Datasource } from '../../../../types/pipelines/pipeline-template-response'
import { PipelineTemplateElement } from '../../../../types/pipelines/pipeline-template-response'
import { DatasourceNodeData } from '../nodes'
import { faDatabase, faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { FaInfoCircle } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  CAlert,
  CBadge,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
} from '@coreui/react'
import LDivider from '../../../../components/LDivider'
import CoreIconButton from '../../../../components/CoreIconButton'
import * as Notification from '../../../../components/Notification'
import { validateDatasource } from '../../../../api/file_browser'
import { detectDatasourceFamily } from './datasourceValidation'

const DEFAULT_TEXT_PATH = 'No path selected!'

type ValidationStatus = 'idle' | 'checking' | 'valid' | 'invalid'

interface DatasourceModalProps {
  toggle: () => void
  isOpen: boolean
  datasource: Datasource
  nodeId: string
  elements: PipelineTemplateElement[]
}

export const DatasourceModal = ({
  datasource,
  nodeId,
  isOpen,
  toggle,
  elements,
}: DatasourceModalProps) => {
  const nodeData = useNodesData(nodeId)
  const datasourceNodeData = nodeData?.data as DatasourceNodeData

  const { updateNodeData } = useReactFlow()
  const [selectedFs, setSelectedFs] = useState(() => {
    if (datasourceNodeData.fsId) {
      return datasource.filesystems.find((el) => el.id === datasourceNodeData.fsId)
    }
    return undefined
  })

  const [selectedPath, setSelectedPath] = useState(() => {
    if (
      datasourceNodeData.selectedPath &&
      datasourceNodeData.selectedPath !== DEFAULT_TEXT_PATH
    ) {
      return datasourceNodeData.selectedPath
    }
    return DEFAULT_TEXT_PATH
  })

  const [selectedPathColor, setSelectedPathColor] = useState(() => {
    return datasourceNodeData.selectedPath !== DEFAULT_TEXT_PATH ? 'green' : 'red'
  })

  const [initPath] = useState(() => {
    if (
      datasourceNodeData.selectedPath &&
      datasourceNodeData.selectedPath !== DEFAULT_TEXT_PATH
    ) {
      return datasourceNodeData.selectedPath
    }
    return undefined
  })

  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle')
  const [validationMessage, setValidationMessage] = useState('')

  const dsElement = useMemo(
    () => elements.find((e) => e.peN === parseInt(nodeId)),
    [elements, nodeId],
  )
  const scriptPeN = dsElement?.peOut?.[0]?.toString()
  const scriptNodeData = useNodesData(scriptPeN ?? '')
  const family = useMemo(
    () =>
      detectDatasourceFamily(
        elements,
        nodeId,
        (scriptNodeData?.data as { arguments?: unknown })?.arguments as never,
      ),
    [elements, nodeId, scriptNodeData],
  )

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const modalContent = document.querySelector('.modal-content')
        if (modalContent && !modalContent.id) {
          modalContent.id = 'datasource-modal'
        }
      }, 100)

      setTimeout(() => {
        const dropdownBtn = document.querySelector('#datasource-dropdown button')
        if (dropdownBtn && !dropdownBtn.id) {
          dropdownBtn.id = 'select-datasource-button'
        }
      }, 100)
    }
  }, [isOpen])

  const runValidation = useCallback(
    async (path: string) => {
      if (!selectedFs || path === DEFAULT_TEXT_PATH || !path) {
        setValidationStatus('idle')
        return
      }

      if (family.family === 'unknown') {
        setValidationStatus('invalid')
        setValidationMessage(
          'Could not determine the required data type for this pipeline. Select an image folder or CSV/Parquet dataset file as appropriate for your script.',
        )
        Notification.showError(
          'Could not determine the required data type for this pipeline. Select an image folder or CSV/Parquet dataset file as appropriate for your script.',
        )
        updateNodeData(nodeId, { verified: false })
        return
      }

      setValidationStatus('checking')
      setValidationMessage('')
      Notification.showInfo('Checking folder contents...')

      try {
        const result = await validateDatasource({
          fs: selectedFs,
          path,
          expectedType: family.family,
          validExtensions: family.validExtensions,
          recursive: family.recursive,
        })
        if (result.valid) {
          setValidationStatus('valid')
          setValidationMessage(result.reason)
          Notification.showSuccess(result.reason)
          updateNodeData(nodeId, { verified: true })
        } else {
          setValidationStatus('invalid')
          setValidationMessage(result.reason)
          Notification.showError(result.reason)
          updateNodeData(nodeId, { verified: false })
        }
      } catch (err) {
        setValidationStatus('invalid')
        setValidationMessage(`Validation failed: ${err}`)
        Notification.showError(`Validation failed: ${err}`)
        updateNodeData(nodeId, { verified: false })
      }
    },
    [selectedFs, family, updateNodeData, nodeId],
  )

  const selectItem = useCallback(
    (path) => {
      if (path !== selectedPath) {
        const color = path !== DEFAULT_TEXT_PATH ? 'green' : 'red'
        setSelectedPath(path)
        setSelectedPathColor(color)

        if (selectedFs) {
          updateNodeData(nodeId, {
            selectedPath: path,
            fsId: selectedFs.id,
          })
        }

        const isJoyrideRunning = localStorage.getItem('joyrideRunning') === 'true'
        console.log(
          'Joyride running:',
          isJoyrideRunning,
          'Path:',
          path,
          'Selected Path:',
          selectedPath,
        )
        const isValidPath = path && path !== DEFAULT_TEXT_PATH
        if (isJoyrideRunning && isValidPath) {
          window.dispatchEvent(
            new CustomEvent('joyride-next-step', {
              detail: { step: 'path-selected' },
            }),
          )
        }

        if (isValidPath) {
          runValidation(path)
        } else {
          setValidationStatus('idle')
        }
      }
    },
    [selectedPath, selectedFs, updateNodeData, nodeId, runValidation],
  )

  const selectDS = useCallback((fs) => {
    setSelectedFs({ ...fs })
    setValidationStatus('idle')
    setValidationMessage('')

    window.dispatchEvent(
      new CustomEvent('joyride-next-step', {
        detail: { step: 'datasource-selected' },
      }),
    )
  }, [])

  const datasourceDropDown = () => {
    return (
      <div>
        <CDropdown
          id="datasource-dropdown"
          onShow={() => {
            const isJoyrideRunning = localStorage.getItem('joyrideRunning') === 'true'
            if (isJoyrideRunning) {
              window.dispatchEvent(
                new CustomEvent('joyride-next-step', {
                  detail: { step: 'dropdown-open' },
                }),
              )
            }
          }}
        >
          <CDropdownToggle caret color="primary" variant="outline">
            <FontAwesomeIcon icon={faDatabase} />
            {selectedFs ? ` ${selectedFs.name}` : ' Select Datasource ...'}
          </CDropdownToggle>
          <CDropdownMenu>
            {datasource.filesystems.map(
              (el) =>
                el.name !== 'default' && (
                  <CDropdownItem onClick={() => selectDS(el)} key={el.name}>
                    {el.name}
                  </CDropdownItem>
                ),
            )}
          </CDropdownMenu>
        </CDropdown>
        <CAlert color="secondary" dismissible className="mt-2 mb-0">
          <div className="d-flex align-items-center">
            <FaInfoCircle className="me-2" size={20} />
            <p className="mb-0">
              {family.family === 'imageFolder' &&
                'This pipeline expects an image folder (e.g. containing .jpg, .jpeg, .png, .bmp files).'}
              {family.family === 'datasetFile' &&
                'This pipeline expects a CSV or Parquet dataset file (e.g. a LOST annotask export).'}
              {family.family === 'unknown' &&
                'Could not determine the required data type for this pipeline. Select an image folder or CSV/Parquet dataset file as appropriate for your script.'}
            </p>
          </div>
        </CAlert>
      </div>
    )
  }

  const verifyNode = useCallback(() => {
    if (
      selectedPath &&
      selectedPath !== DEFAULT_TEXT_PATH &&
      validationStatus === 'valid'
    ) {
      updateNodeData(nodeId, {
        verified: true,
      })
    } else {
      updateNodeData(nodeId, {
        verified: false,
      })
    }
  }, [selectedPath, validationStatus, nodeId, updateNodeData])

  useEffect(() => {
    if (isOpen && selectedPath && selectedPath !== DEFAULT_TEXT_PATH && selectedFs) {
      if (validationStatus === 'idle') {
        runValidation(selectedPath)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    //TODO: make sure it opens with the first click every time
    <CModal
      size="lg"
      onShow={verifyNode}
      visible={isOpen}
      onClose={() => {
        if (isOpen) {
          toggle()
        }
        verifyNode()
      }}
    >
      <CModalHeader>Datasource</CModalHeader>
      <CModalBody>
        <div>
          <div id="datasource-dropdown-container">{datasourceDropDown()}</div>
          <LDivider text={'File Browser'} className="fw-bold fs-5"></LDivider>
          <div id="file-browser-container">
            <LostFileBrowser
              fs={selectedFs}
              onPathSelected={(path) => selectItem(path)}
              initPath={initPath}
              allowedExtensions={
                family.family === 'datasetFile' ? ['csv', 'parquet'] : undefined
              }
            />
          </div>
          <LDivider text={'Selected Datasource'} className="fw-bold fs-5"></LDivider>
          <CBadge color={selectedPathColor} id="selected-datasource-path">
            <FontAwesomeIcon icon={faFolderOpen} /> {selectedPath}
          </CBadge>
        </div>
      </CModalBody>
      <CModalFooter>
        <CoreIconButton
          text="Done"
          color="primary"
          onClick={() => {
            toggle()
            window.dispatchEvent(
              new CustomEvent('joyride-next-step', {
                detail: { step: 'done-clicked' },
              }),
            )
          }}
          id="done-button"
          disabled={
            validationStatus !== 'valid' ||
            (localStorage.getItem('joyrideRunning') === 'true' &&
              (!selectedPath || selectedPath === DEFAULT_TEXT_PATH))
          }
        />
      </CModalFooter>
    </CModal>
  )
}
