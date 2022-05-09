import React, { Component } from 'react'
import { connect } from 'react-redux'
import MIAImage from './NewMIAImage'
import actions from '../../../actions'

import './Cluster.scss'
import { Alert, Button } from 'reactstrap'
import { withRouter } from 'react-router-dom'

const { getMiaAnnos, getMiaImage, getWorkingOnAnnoTask, getMiaLabel, finishMia } = actions

class Cluster extends Component {
    componentDidMount() {
        this.props.getMiaAnnos(this.props.maxAmount)
    }
    componentWillReceiveProps(props) {
        if (props.workingOnAnnoTask) {
            const { size, finished } = props.workingOnAnnoTask
            if (size - finished > 0) {
                if (props.images.length === 0) {
                    this.props.getMiaAnnos(this.props.maxAmount)
                    this.props.getMiaLabel()
                }
            }
        } else {
            this.props.getWorkingOnAnnoTask()
        }
    }

    renderFinishTask() {
        if (this.props.workingOnAnnoTask) {
            const { size, finished } = this.props.workingOnAnnoTask
            if (size - finished === 0) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div>
                            <Alert color="success">
                                No more images available. Please press finish in order to
                                continue the pipeline.
                            </Alert>
                            <Button
                                color="primary"
                                size="lg"
                                onClick={() =>
                                    this.props.finishMia(
                                        this.props.history.push('dashboard'),
                                        this.props.getWorkingOnAnnoTask,
                                    )
                                }
                            >
                                <i className="fa fa-check"></i> Finish Task
                            </Button>{' '}
                        </div>
                    </div>
                )
            }
        }
        return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div>
                    {/* <Spinner color="primary" /> */}
                    <i className="fa fa-image fa-spin fa-4x"></i>
                </div>
            </div>
        )
    }
    render() {
        if (this.props.images.length > 0) {
            return (
                <div className="mia-images">
                    {this.props.images.map((image) => {
                        return (
                            <MIAImage
                                key={image.id}
                                image={image}
                                miaKey={image.id}
                                height={this.props.zoom}
                            ></MIAImage>
                        )
                    })}
                </div>
            )
        } else {
            return <React.Fragment>{this.renderFinishTask()}</React.Fragment>
        }
    }
}

function mapStateToProps(state) {
    return {
        images: state.mia.images,
        maxAmount: state.mia.maxAmount,
        zoom: state.mia.zoom,
        workingOnAnnoTask: state.annoTask.workingOnAnnoTask,
        proposedLabel: state.mia.proposedLabel,
    }
}
export default connect(mapStateToProps, {
    getMiaAnnos,
    getMiaImage,
    getWorkingOnAnnoTask,
    getMiaLabel,
    finishMia,
})(withRouter(Cluster))
