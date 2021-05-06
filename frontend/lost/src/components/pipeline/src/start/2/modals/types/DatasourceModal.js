import React, {Component} from 'react'
import LostFileBrowser from '../../../../../../FileBrowser/LostFileBrowser'
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
    return (
      <div>
      <div>{'Select Datasource:'}</div>
      <div>{this.datasourceDropDown()}</div>
      <div><LostFileBrowser></LostFileBrowser></div>
      
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




