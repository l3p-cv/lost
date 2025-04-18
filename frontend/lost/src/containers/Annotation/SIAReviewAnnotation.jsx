import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import { Col, Row } from 'reactstrap'
// import MIA from './MIA/MIA'
import SIAReview from './SIAReview/SIAReview'
// import WorkingOnMIA from './AnnoTask/WorkingOnMIA'

import actions from '../../actions'
const { getWorkingOnAnnoTask } = actions

const SiaReviewComponent = ({}) => {
    useEffect(() => {
        // getWorkingOnAnnoTask()
    }, [getWorkingOnAnnoTask])

    return (
        <Row>
            <Col>
                <Row>
                    <Col xs="12" sm="12" lg="12">
                        {/* <WorkingOnMIA annoTask={this.props.workingOnAnnoTask}></WorkingOnMIA> */}
                        <SIAReview />
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

function mapStateToProps(state) {
    return { workingOnAnnoTask: state.annoTask.workingOnAnnoTask }
}

export default connect(mapStateToProps, { getWorkingOnAnnoTask })(SiaReviewComponent)
