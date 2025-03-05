import { useCallback, useState } from 'react'
import LostFileBrowser from '../../../../components/FileBrowser/LostFileBrowser'

import { useNodesData, useReactFlow } from '@xyflow/react'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap'
import { Divider, Icon, Label } from 'semantic-ui-react'
import { Datasource } from '../../../../actions/pipeline/model/pipeline-template-response'
import { DatasourceNodeData } from '../nodes'

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

    const toggleDs = useCallback(() => {
        setDsDropdownOpen((prevState) => !prevState)
    }, [])

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
            }
        },
        [selectedPath, selectedFs, updateNodeData, nodeId],
    )

    const selectDS = useCallback((fs) => {
        setSelectedFs({ ...fs })
    }, [])

    const datasourceDropDown = () => {
        return (
            <div>
                <Dropdown isOpen={dsDropdownOpen} toggle={toggleDs}>
                    <DropdownToggle caret>
                        <Icon name="database" />
                        {selectedFs ? selectedFs.name : 'Select Datasource ...'}
                    </DropdownToggle>
                    <DropdownMenu>
                        {datasource.filesystems.map(
                            (el) =>
                                el.name !== 'default' && (
                                    <DropdownItem
                                        onClick={() => selectDS(el)}
                                        key={el.name}
                                    >
                                        {el.name}
                                    </DropdownItem>
                                ),
                        )}
                    </DropdownMenu>
                </Dropdown>
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
            <Modal size="lg" isOpen={isOpen} toggle={toggle} onClosed={verifyNode}>
                <ModalHeader>Datasource</ModalHeader>
                <ModalBody>
                    <div>
                        <div>{datasourceDropDown()}</div>
                        <Divider horizontal>File Browser</Divider>
                        <div>
                            <LostFileBrowser
                                fs={selectedFs}
                                onPathSelected={(path) => selectItem(path)}
                                initPath={initPath}
                            />
                        </div>
                        <Divider horizontal>Selected Datasource</Divider>
                        {/* @ts-expect-error Still works with string color */}
                        <Label color={selectedPathColor}>
                            <Icon name="folder open" /> {selectedPath}
                        </Label>
                    </div>
                </ModalBody>
                <ModalFooter />
            </Modal>
        </>
    )
}
