import React, {Component} from 'react'
import Table from '../../../../globalComponents/modals/Table'

import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import actions from '../../../../../../actions/pipeline/pipelineStartModals/datasource'

import {connect} from 'react-redux'
const {selectDropdown} = actions


class DatasourceModal extends Component{
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.selectItem = this.selectItem.bind(this)
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  selectItem(e){
    this.props.selectDropdown(this.props.peN, e.target.innerText)
  }

  dropDown(){
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

  render() {
    return (
      <Table
        data= {
          [
            {
              key: 'SelectFolder',
              value: this.dropDown()

            }
        ]
      }
      />
    );
  }
}

export default connect(null, {selectDropdown}) (DatasourceModal)




