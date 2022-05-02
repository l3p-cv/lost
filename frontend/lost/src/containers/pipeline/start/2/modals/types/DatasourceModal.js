import React, { Component } from 'react'
import LostFileBrowser from '../../../../../../components/FileBrowser/LostFileBrowser'
import Table from '../../../../globalComponents/modals/Table'

import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { Divider, Icon, Label } from 'semantic-ui-react'
import actions from '../../../../../../actions/pipeline/pipelineStartModals/datasource'

import { connect } from 'react-redux'
const { selectDropdown, pipeStartUpdateDS } = actions

const DEFAULT_TEXT_PATH = 'No path selected!'
class DatasourceModal extends Component {
    constructor(props) {
        super(props)

        this.toggle = this.toggle.bind(this)
        this.selectItem = this.selectItem.bind(this)
        let selectedFs = undefined
        let selectedPath = DEFAULT_TEXT_PATH
        let selectedPathColor = 'red'
        let initPath = undefined
        if (props.exportData.datasource.fs_id) {
            selectedFs = props.datasource.filesystems.find((el) => {
                if (el.id === props.exportData.datasource.fs_id) {
                    return el
                }
                return undefined
            })
            selectedPath = props.exportData.datasource.selectedPath
            if (selectedPath !== DEFAULT_TEXT_PATH) {
                initPath = selectedPath
                selectedPathColor = 'green'
            }
        }
        this.state = {
            dropdownOpen: false,
            dsDropdownOpen: false,
            selectedFs: selectedFs,
            selectedPath: selectedPath,
            selectedPathColor: selectedPathColor,
            initPath: initPath,
        }
    }

    toggle() {
        this.setState((prevState) => ({
            dropdownOpen: !prevState.dropdownOpen,
        }))
    }

    toggleDs() {
        this.setState({
            dsDropdownOpen: !this.state.dsDropdownOpen,
        })
    }

    selectItem(path) {
        if (path !== this.state.selectedPath) {
            let color = 'red'
            if (path !== DEFAULT_TEXT_PATH) color = 'green'
            this.setState({
                selectedPath: path,
                selectedPathColor: color,
            })
            this.props.selectDropdown(this.props.peN, path, this.state.selectedFs.id)
        }
    }

    selectDS(fs) {
        this.setState({ selectedFs: { ...fs } })
    }
    folderDropDown() {
        const rawFilePath = this.props.exportData.datasource.rawFilePath
        return (
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle caret>
                    {rawFilePath ? rawFilePath : 'Select Item...'}
                </DropdownToggle>
                <DropdownMenu>
                    {this.props.datasource.fileTree.children.map((el) => {
                        return (
                            <DropdownItem onClick={this.selectItem} key={el.name}>
                                {el.name}
                            </DropdownItem>
                        )
                    })}
                </DropdownMenu>
            </Dropdown>
        )
    }

    datasourceDropDown() {
        // const rawFilePath = this.props.exportData.datasource.rawFilePath
        // if (!this.state.dsDropdownOpen) return null
        return (
            <div>
                <Dropdown
                    isOpen={this.state.dsDropdownOpen}
                    toggle={(e) => {
                        this.toggleDs()
                    }}
                >
                    <DropdownToggle caret>
                        <Icon name="database" />
                        {this.state.selectedFs
                            ? this.state.selectedFs.name
                            : 'Select Datasource ...'}
                        {/* {'Select Item ...'} */}
                    </DropdownToggle>
                    <DropdownMenu>
                        {this.props.datasource.filesystems.map((el) => {
                            return (
                                <>
                                    {el.name !== 'default' ? (
                                        <DropdownItem
                                            onClick={(e) => {
                                                this.selectDS(el)
                                            }}
                                            key={el.name}
                                        >
                                            {el.name}
                                        </DropdownItem>
                                    ) : (
                                        ''
                                    )}
                                </>
                            )
                        })}
                    </DropdownMenu>
                </Dropdown>
            </div>
        )
    }

    render() {
        return (
            <div>
                <div>{this.datasourceDropDown()}</div>
                <Divider horizontal>File Browser</Divider>
                <div>
                    <LostFileBrowser
                        fs={this.state.selectedFs}
                        onPathSelected={(path) => this.selectItem(path)}
                        initPath={this.state.initPath}
                    />
                </div>
                <Divider horizontal>Selected Datasource</Divider>
                <Label color={this.state.selectedPathColor}>
                    <Icon name="folder open" /> {this.state.selectedPath}
                </Label>

                {/* <FullFileBrowser files={files}/> */}
                {/* <Table
        data= {
          [
            {
              key: 'Select Datasource',
              value: this.datasourceDropDown()

            },
            {
              key: 'Select Folder',
              value: this.folderDropDown()

            }
        ]
      }
      /> */}
            </div>
        )
    }
}

export default connect(null, { selectDropdown, pipeStartUpdateDS })(DatasourceModal)
