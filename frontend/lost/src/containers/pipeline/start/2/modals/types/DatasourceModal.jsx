import { useCallback, useEffect, useState } from 'react'
import LostFileBrowser from '../../../../../../components/FileBrowser/LostFileBrowser'

import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
import { Divider, Icon, Label } from 'semantic-ui-react'
import actions from '../../../../../../actions/pipeline/pipelineStartModals/datasource'

import { connect } from 'react-redux'
const { selectDropdown, pipeStartUpdateDS } = actions

const DEFAULT_TEXT_PATH = 'No path selected!'

const DatasourceModal = ({ exportData, datasource, selectDropdown, peN }) => {
    useEffect(() => {
        console.log('datasource:', datasource)
        console.log('exportData:', exportData)
    }, [exportData, datasource])

    const [dsDropdownOpen, setDsDropdownOpen] = useState(false)

    const [selectedFs, setSelectedFs] = useState(() => {
        if (exportData.datasource.fs_id) {
            return datasource.filesystems.find(
                (el) => el.id === exportData.datasource.fs_id,
            )
        }
        return undefined
    })

    const [selectedPath, setSelectedPath] = useState(() => {
        if (
            exportData.datasource.selectedPath &&
            exportData.datasource.selectedPath !== DEFAULT_TEXT_PATH
        ) {
            return exportData.datasource.selectedPath
        }
        return DEFAULT_TEXT_PATH
    })

    const [selectedPathColor, setSelectedPathColor] = useState(() => {
        return exportData.datasource.selectedPath !== DEFAULT_TEXT_PATH ? 'green' : 'red'
    })

    const [initPath] = useState(() => {
        if (
            exportData.datasource.selectedPath &&
            exportData.datasource.selectedPath !== DEFAULT_TEXT_PATH
        ) {
            return exportData.datasource.selectedPath
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
                    selectDropdown(peN, path, selectedFs.id)
                }
            }
        },
        [selectedPath, selectedFs, selectDropdown, peN],
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

    return (
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
            <Label color={selectedPathColor}>
                <Icon name="folder open" /> {selectedPath}
            </Label>
        </div>
    )
}

export default connect(null, { selectDropdown, pipeStartUpdateDS })(DatasourceModal)
