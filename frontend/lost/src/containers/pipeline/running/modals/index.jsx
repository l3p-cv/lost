import { connect } from 'react-redux'
import actionsAll from '../../../../actions'
import AnnoTaskModal from './types/AnnoTaskModal'
import DataExportModal from './types/DataExportModal'
import DatasourceModal from './types/DatasourceModal'
import LoopModal from './types/LoopModal'
import ScriptModal from './types/ScriptModal'

const { siaReviewSetElement, chooseAnnoTask, forceAnnotationRelease, changeUser } =
  actionsAll

const BaseModal = (props) => {
  const onClose = (opened) => {
    if (opened) {
      props.toggleModal()
    }
  }
  const selectModal = () => {
    if (props.data && props.modalOpened) {
      if ('datasource' in props.data) {
        return (
          <DatasourceModal
            id={props.data.id}
            modalOpened={true}
            state={props.data.state}
            datasource={props.data.datasource}
            onClose={() => onClose(props.modalOpened)}
          />
        )
      } else if ('script' in props.data) {
        return (
          <ScriptModal
            script={props.data.script}
            id={props.data.id}
            modalOpened={true}
            state={props.data.state}
            onClose={() => onClose(props.modalOpened)}
          />
        )
      } else if ('annoTask' in props.data) {
        return (
          <AnnoTaskModal
            id={props.data.id}
            modalOpened={true}
            state={props.data.state}
            annoTask={props.data.annoTask}
            siaReviewSetElement={props.siaReviewSetElement}
            chooseAnnoTask={props.chooseAnnoTask}
            forceAnnotationRelease={props.forceAnnotationRelease}
            changeUser={props.changeUser}
            onClose={() => onClose(props.modalOpened)}
          />
        )
      } else if ('dataExport' in props.data) {
        return (
          <DataExportModal
            dataExport={{ ...props.data }}
            onClose={() => onClose(props.modalOpened)}
            modalOpened={true}
          />
        )
      } else if ('loop' in props.data) {
        return (
          <LoopModal
            modalOpened={true}
            onClose={() => onClose(props.modalOpened)}
            id={props.data.id}
            state={props.data.state}
            loop={props.data.loop}
          />
        )
      }
    }
  }

  if (props.data) {
    return selectModal()
  }
}

export default connect(null, {
  siaReviewSetElement,
  chooseAnnoTask,
  forceAnnotationRelease,
  changeUser,
})(BaseModal)
