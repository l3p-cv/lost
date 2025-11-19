import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import { CCol, CRow } from '@coreui/react'
// import MIA from './MIA/MIA'
// import SIAReview from './SIAReview/SIAReview'
// import WorkingOnMIA from './AnnoTask/WorkingOnMIA'

import actions from '../../actions'

const { getWorkingOnAnnoTask } = actions

const SiaReviewComponent = ({}) => {
  useEffect(() => {
    // getWorkingOnAnnoTask()
  }, [getWorkingOnAnnoTask])

  return (
    <CRow>
      <CCol>
        <CRow>
          <CCol xs="12" sm="12" lg="12">
            {/* <WorkingOnMIA annoTask={this.props.workingOnAnnoTask}></WorkingOnMIA> */}
            {/* <SIAReview /> */}
          </CCol>
        </CRow>
      </CCol>
    </CRow>
  )
}

function mapStateToProps(state) {
  return { workingOnAnnoTask: state.annoTask.workingOnAnnoTask }
}

export default connect(mapStateToProps, { getWorkingOnAnnoTask })(SiaReviewComponent)
