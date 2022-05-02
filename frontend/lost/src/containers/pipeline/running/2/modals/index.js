import React, { Component } from 'react'
import DatasourceModal from './types/DatasourceModal'
import ScriptModal from './types/ScriptModal'
import AnnoTaskModal from './types/AnnoTaskModal'
import LoopModal from './types/LoopModal'
import VisualOutputModal from './types/VisualOutputModal'
import DataExportModal from './types/DataExportModal'
import { Modal, ModalFooter } from 'reactstrap'
import IconButton from '../../../../../components/IconButton'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'
import actions from '../../../../../actions/pipeline/pipelineRunning'
import actionsAll from '../../../../../actions'

const { toggleModal } = actions
const { siaReviewSetElement, chooseAnnoTask, forceAnnotationRelease, changeUser } =
    actionsAll

class BaseModal extends Component {
    constructor() {
        super()
        this.toggleModal = this.toggleModal.bind(this)
    }

    selectModal() {
        if (this.props.data && this.props.step.modalOpened) {
            if ('datasource' in this.props.data) {
                return <DatasourceModal {...this.props.data} />
            } else if ('script' in this.props.data) {
                return <ScriptModal {...this.props.data} />
            } else if ('annoTask' in this.props.data) {
                return (
                    <AnnoTaskModal
                        siaReviewSetElement={this.props.siaReviewSetElement}
                        chooseAnnoTask={this.props.chooseAnnoTask}
                        forceAnnotationRelease={this.props.forceAnnotationRelease}
                        changeUser={this.props.changeUser}
                        {...this.props.data}
                    />
                )
            } else if ('dataExport' in this.props.data) {
                return <DataExportModal {...this.props.data} />
            } else if ('loop' in this.props.data) {
                return <LoopModal {...this.props.data} />
            } else if ('visualOutput' in this.props.data) {
                return <VisualOutputModal {...this.props.data} />
            }
        }
    }
    toggleModal() {
        this.props.toggleModal(this.props.step.modalClickedId)
    }
    renderModals() {
        return (
            <Modal
                size="lg"
                isOpen={this.props.step.modalOpened}
                toggle={this.toggleModal}
            >
                {this.selectModal()}
                <ModalFooter>
                    <IconButton
                        color="secondary"
                        isOutline={false}
                        icon={faTimes}
                        text="Close"
                        onClick={this.toggleModal}
                    />
                </ModalFooter>
            </Modal>
        )
    }

    render() {
        return <div>{this.renderModals()}</div>
    }
}

const mapStateToProps = (state) => {
    return {
        step: state.pipelineRunning.steps[1],
    }
}

export default connect(mapStateToProps, {
    toggleModal,
    siaReviewSetElement,
    chooseAnnoTask,
    forceAnnotationRelease,
    changeUser,
})(BaseModal)
