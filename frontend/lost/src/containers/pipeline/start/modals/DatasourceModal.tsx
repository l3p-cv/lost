import { useCallback, useState } from 'react'
import LostFileBrowser from '../../../../components/FileBrowser/LostFileBrowser'

import { useNodesData, useReactFlow } from '@xyflow/react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { Datasource } from '../../../../actions/pipeline/model/pipeline-template-response'
import { DatasourceNodeData } from '../nodes'
import IconButton from '../../globalComponents/IconButton'
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { FaDatabase } from 'react-icons/fa'
import {
    CButton,
    CCol,
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CRow,
} from '@coreui/react'

const DEFAULT_TEXT_PATH = 'No path selected!'

interface DatasourceModalProps {
    toggle: () => void
    isOpen: boolean
    datasource: Datasource
    nodeId: string
}

export const DatasourceModal = ({
    datasource,
    nodeId,
    isOpen,
    toggle,
}: DatasourceModalProps) => {
    const nodeData = useNodesData(nodeId)
    const datasourceNodeData = nodeData?.data as DatasourceNodeData

    const { updateNodeData } = useReactFlow()

    const [dsDropdownOpen, setDsDropdownOpen] = useState(false)

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
        return datasourceNodeData.selectedPath !== DEFAULT_TEXT_PATH ? 'success' : 'error'
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

    const toggleDs = useCallback(() => {
        setDsDropdownOpen((prevState) => {
            const isOpening = !prevState
            if (isOpening) {
                window.dispatchEvent(
                    new CustomEvent('joyride-next-step', {
                        detail: { step: 'dropdown-open' },
                    }),
                )
            }
            return isOpening
        })
    }, [])

    const selectItem = useCallback(
        (path) => {
            if (path !== selectedPath) {
                const color = path !== DEFAULT_TEXT_PATH ? 'success' : 'error'
                setSelectedPath(path)
                setSelectedPathColor(color)

                if (selectedFs) {
                    updateNodeData(nodeId, {
                        selectedPath: path,
                        fsId: selectedFs.id,
                    })
                }

                const isJoyrideRunning = localStorage.getItem('joyrideRunning') === 'true'
                const isValidPath = path && path !== DEFAULT_TEXT_PATH
                if (isJoyrideRunning && isValidPath) {
                    window.dispatchEvent(
                        new CustomEvent('joyride-next-step', {
                            detail: { step: 'path-selected' },
                        }),
                    )
                }
            }
        },
        [selectedPath, selectedFs, updateNodeData, nodeId],
    )

    const selectDS = useCallback((fs) => {
        setSelectedFs({ ...fs })

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
                    visible={dsDropdownOpen}
                    toggle={toggleDs}
                >
                    <CDropdownToggle color="secondary">
                        <FaDatabase />
                        &nbsp;&nbsp;
                        {selectedFs ? selectedFs.name : 'Select Datasource ...'}
                    </CDropdownToggle>
                    <CDropdownMenu>
                        {datasource.filesystems.map(
                            (el) =>
                                el.name !== 'default' && (
                                    <CDropdownItem
                                        onClick={() => selectDS(el)}
                                        key={el.name}
                                    >
                                        {el.name}
                                    </CDropdownItem>
                                ),
                        )}
                    </CDropdownMenu>
                </CDropdown>
            </div>
        )
    }

    const verifyNode = useCallback(() => {
        if (datasourceNodeData.selectedPath) {
            updateNodeData(nodeId, {
                verified: true,
            })
        } else {
            updateNodeData(nodeId, {
                verified: false,
            })
        }
    }, [datasourceNodeData.selectedPath, nodeId, updateNodeData])

    return (
        <>
            <Modal
                size="lg"
                isOpen={isOpen}
                toggle={toggle}
                onClosed={verifyNode}
                id="datasource-modal"
            >
                <ModalHeader toggle={toggle}>Datasource</ModalHeader>
                <ModalBody>
                    <div>
                        <div id="datasource-dropdown-container">
                            {datasourceDropDown()}
                        </div>
                        <hr />
                        <h4>File Browser:</h4>
                        <div id="file-browser-container">
                            <LostFileBrowser
                                fs={selectedFs}
                                onPathSelected={(path) => selectItem(path)}
                                initPath={initPath}
                            />
                        </div>
                        <hr />
                        <CRow>
                            <CCol md="3">
                                <h4>Selected Datasource:</h4>
                            </CCol>
                            <CCol>
                                <IconButton
                                    color={selectedPathColor}
                                    icon={faFolderOpen}
                                    text={selectedPath}
                                    onClick={() => {}}
                                />
                            </CCol>
                        </CRow>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <CButton
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
                            localStorage.getItem('joyrideRunning') === 'true' &&
                            (!selectedPath || selectedPath === DEFAULT_TEXT_PATH)
                        }
                    >
                        Done
                    </CButton>
                </ModalFooter>
            </Modal>
        </>
    )
}
