import React from 'react'
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
const { siaReviewSetElement, chooseAnnoTask, forceAnnotationRelease, changeUser } = actionsAll

const BaseModal = (props) => {
    const toggleModal = () => {
        props.toggleModal(props.step.modalClickedId)
    }

    const selectModal = () => {
        if (props.data && props.step.modalOpened) {
            if ('datasource' in props.data) {
                return <DatasourceModal {...props.data} />
            } else if ('script' in props.data) {
                return <ScriptModal {...props.data} />
            } else if ('annoTask' in props.data) {
                return (
                    <AnnoTaskModal
                        siaReviewSetElement={props.siaReviewSetElement}
                        chooseAnnoTask={props.chooseAnnoTask}
                        forceAnnotationRelease={props.forceAnnotationRelease}
                        changeUser={props.changeUser}
                        {...props.data}
                    />
                )
            } else if ('dataExport' in props.data) {
                return <DataExportModal {...props.data} />
            } else if ('loop' in props.data) {
                return <LoopModal {...props.data} />
            } else if ('visualOutput' in props.data) {
                return <VisualOutputModal {...props.data} />
            }
        }
    }

    const renderModals = () => {
        return (
            <Modal
                size="lg"
                isOpen={props.step.modalOpened}
                toggle={toggleModal}
            >
                {selectModal()}
                <ModalFooter>
                    <IconButton
                        color="secondary"
                        isOutline={false}
                        icon={faTimes}
                        text="Close"
                        onClick={toggleModal}
                    />
                </ModalFooter>
            </Modal>
        )
    }

    return <div>{renderModals()}</div>
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