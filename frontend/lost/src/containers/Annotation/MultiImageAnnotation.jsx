import React, { Component } from 'react'
import { connect } from 'react-redux'

import MIA from './MIA/MIA'
import AnnotationTop from './AnnoTask/AnnotationTop'

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
        <CCol xs="12" sm="12" lg="12">
          <div style={{ marginBottom: '8px' }}>
            <AnnotationTop annoTask={this.props.workingOnAnnoTask} isSIA={false} />
          </div>
          <MIA></MIA>
        </CCol>
      </CRow>
    )
  }
}

function mapStateToProps(state) {
  return { workingOnAnnoTask: state.annoTask.workingOnAnnoTask }
}

export default connect(mapStateToProps, { getWorkingOnAnnoTask })(MultiImageAnnotation)
