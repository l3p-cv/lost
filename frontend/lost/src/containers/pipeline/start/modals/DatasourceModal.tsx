import { useCallback, useState } from 'react'
import LostFileBrowser from '../../../../components/FileBrowser/LostFileBrowser'

import { useNodesData, useReactFlow } from '@xyflow/react'
import { Datasource } from '../../../../actions/pipeline/model/pipeline-template-response'
import { DatasourceNodeData } from '../nodes'
import { faDatabase, faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    CBadge, CButton,
    CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, // TODO: use
    CModal, CModalBody, CModalFooter, CModalHeader
} from '@coreui/react'
import LDivider from '../../../../components/LDivider'

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

            const isJoyrideRunning = localStorage.getItem('joyrideRunning') === 'true';
            const isValidPath = path && path !== DEFAULT_TEXT_PATH;
            if (isJoyrideRunning && isValidPath) {
                window.dispatchEvent(new CustomEvent('joyride-next-step', {
                    detail: { step: 'path-selected' }
                }));
            }}
        },
        [selectedPath, selectedFs, updateNodeData, nodeId]
    )

    const selectDS = useCallback((fs) => {
        setSelectedFs({ ...fs });

        window.dispatchEvent(new CustomEvent('joyride-next-step', {
            detail: { step: 'datasource-selected' }
        }));
    }, [])

    const datasourceDropDown = () => {
        return (
            <div>
                <CDropdown id="datasource-dropdown">
                    <CDropdownToggle caret color='primary'>
                        <FontAwesomeIcon icon={faDatabase} />
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
            <CModal size="lg" visible={isOpen} onClose={verifyNode} id="datasource-modal">
                <CModalHeader>Datasource</CModalHeader>
                <CModalBody>
                    <div>
                        <div id="datasource-dropdown-container">{datasourceDropDown()}</div>
                        <LDivider text={"File Browser"} className='fw-bold fs-5'></LDivider>
                        <div id="file-browser-container">
                            <LostFileBrowser
                                fs={selectedFs}
                                onPathSelected={(path) => selectItem(path)}
                                initPath={initPath}
                            />
                        </div>
                        <LDivider text={"Selected Datasource"} className='fw-bold fs-5'></LDivider>
                        <CBadge color={selectedPathColor}>
                            <FontAwesomeIcon icon={faFolderOpen} /> {selectedPath}
                        </CBadge>
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color='primary'
                        onClick={() => {
                            toggle();
                            window.dispatchEvent(new CustomEvent('joyride-next-step', {
                                detail: { step: 'done-clicked' },
                            }));
                        }}
                        id="done-button"
                        disabled={
                            localStorage.getItem('joyrideRunning') === 'true' &&
                            (!selectedPath || selectedPath === DEFAULT_TEXT_PATH)
                        }
                    >
                        Done
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}
