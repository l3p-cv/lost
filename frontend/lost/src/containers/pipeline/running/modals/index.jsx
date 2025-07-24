import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'
import actionsAll from '../../../../actions'
import IconButton from '../../../../components/IconButton'
import AnnoTaskModal from './types/AnnoTaskModal'
import DataExportModal from './types/DataExportModal'
import DatasourceModal from './types/DatasourceModal'
import LoopModal from './types/LoopModal'
import ScriptModal from './types/ScriptModal'
import { CModal, CModalFooter } from '@coreui/react'

const { siaReviewSetElement, chooseAnnoTask, forceAnnotationRelease, changeUser } =
    actionsAll

const BaseModal = (props) => {
    const selectModal = () => {
        if (props.data && props.modalOpened) {
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
            }
        }
    }

    const renderModals = () => {
        return (
            <CModal size="lg" visible={props.modalOpened} onClose={() => {
                    if (props.modalOpened){
                        props.toggleModal()
                    }
                }}>
                {selectModal()}
                <CModalFooter>
                    <IconButton
                        color="secondary"
                        isOutline={false}
                        icon={faTimes}
                        text="Close"
                        onClick={props.toggleModal}
                    />
                </CModalFooter>
            </CModal>
        )
    }

    return <div>{renderModals()}</div>
}

export default connect(null, {
    siaReviewSetElement,
    chooseAnnoTask,
    forceAnnotationRelease,
    changeUser,
})(BaseModal)
