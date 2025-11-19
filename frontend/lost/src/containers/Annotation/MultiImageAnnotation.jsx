import React, { Component } from 'react'
import { connect } from 'react-redux'

import MIA from './MIA/MIA'
import WorkingOnMIA from './AnnoTask/WorkingOnMIA'

import actions from '../../actions'
import { CCol, CRow } from '@coreui/react'
const { getWorkingOnAnnoTask } = actions

class MultiImageAnnotation extends Component {
  componentDidMount() {
    this.props.getWorkingOnAnnoTask()
  }
  render() {
    return (
      <CRow>
        <CCol>
          <CRow>
            <CCol xs="12" sm="12" lg="12">
              <WorkingOnMIA annoTask={this.props.workingOnAnnoTask}></WorkingOnMIA>
              <MIA></MIA>
            </CCol>
          </CRow>
        </CCol>
      </CRow>
    )
  }
}

function mapStateToProps(state) {
  return { workingOnAnnoTask: state.annoTask.workingOnAnnoTask }
}

export default connect(mapStateToProps, { getWorkingOnAnnoTask })(MultiImageAnnotation)
