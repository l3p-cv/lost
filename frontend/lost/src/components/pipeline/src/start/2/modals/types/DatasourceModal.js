import React, {Component} from 'react'
import { FullFileBrowser } from 'chonky';
import {
  FileBrowser,
  FileContextMenu,
  FileList,
  FileNavbar,
  FileToolbar,
} from 'chonky';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import Table from '../../../../globalComponents/modals/Table'

import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import actions from '../../../../../../../actions/pipeline/pipelineStartModals/datasource'

import {connect} from 'react-redux'
const {selectDropdown, pipeStartUpdateDS} = actions


class DatasourceModal extends Component{
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.selectItem = this.selectItem.bind(this)
    this.state = {
      dropdownOpen: false,
      dsDropdownOpen: false,
      selectedFs: undefined
    };
  }

  componentDidMount(){
    setChonkyDefaults({ iconComponent: ChonkyIconFA })
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  toggleDs(){
    this.setState({
      dsDropdownOpen: !this.state.dsDropdownOpen
    })
  }

  selectItem(e){
    this.props.selectDropdown(this.props.peN, e.target.innerText)
  }

  selectDS(fs){
    console.log('fs_update fsId',fs)
    console.log(fs.name)
    this.setState({selectedFs:{...fs}})
  }
  folderDropDown(){
    const rawFilePath = this.props.exportData.datasource.rawFilePath
    return (
      <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle caret>
          {rawFilePath?rawFilePath:'Select Item...'}
        </DropdownToggle>
        <DropdownMenu>
          {this.props.datasource.fileTree.children.map((el)=>{
            return(
              <DropdownItem onClick={this.selectItem} key={el.name}>{el.name}</DropdownItem>
            )
          })}
        </DropdownMenu>
      </Dropdown>
    );
  }

  datasourceDropDown(){
    // const rawFilePath = this.props.exportData.datasource.rawFilePath
    // if (!this.state.dsDropdownOpen) return null
    return (
      <Dropdown isOpen={this.state.dsDropdownOpen} toggle={e => {this.toggleDs()}}>
        <DropdownToggle caret>
          {this.state.selectedFs?this.state.selectedFs.name:'Select Item...'}
          {/* {'Select Item ...'} */}
        </DropdownToggle>
        <DropdownMenu>
          {this.props.datasource.filesystems.map((el)=>{
            return(
              // <DropdownItem onClick={e => {this.props.pipeStartUpdateDS(this.props.peN, e.target.innerText); console.log('fs_update',e.target)}} key={el.name}>{el.name}</DropdownItem>
              <DropdownItem onClick={e => {this.selectDS(el)}} key={el.name}>{el.name}</DropdownItem>

            )
          })}
        </DropdownMenu>
      </Dropdown>
    );
  }

  render() {
    const files = [
        null, // Loading animation will be shown for this file
        null,
        {
          id: 'nTe',
          name: 'Normal file.yml',
          size: 890,
          modDate: new Date('2012-01-01'),
        },
        {
          id: 'zxc',
          name: 'Hidden file.mp4',
          isHidden: true,
          size: 890,
        },
        {
          id: 'bnm',
          name: 'Normal folder',
          isDir: true,
          childrenCount: 12,
        },
    ]
    return (
      <div>
      <div>{'Select Datasource:'}</div>
      <div>{this.datasourceDropDown()}</div>
      <FileBrowser files={files} onFileAction={e => {console.log('chonky action', e)}}>
            <FileNavbar />
            <FileToolbar />
            <FileList />
            <FileContextMenu />
        </FileBrowser>
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

    );
  }
}

export default connect(null, {selectDropdown, pipeStartUpdateDS}) (DatasourceModal)




