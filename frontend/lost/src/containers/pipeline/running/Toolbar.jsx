import {
  faFileDownload,
  faPause,
  faPlay,
  faRedo,
  faStickyNote,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import saveAs from 'file-saver'
import { useState } from 'react'
import {
  useCreateAndStartPipeline,
  useDeletePipeline,
  usePausePipeline,
  usePlayPipeline,
} from '../../../actions/pipeline/pipeline_api'
import HelpButton from '../../../components/HelpButton'
import IconButton from '../../../components/IconButton'
import GrayLine from '../globalComponents/GrayLine'
import { alertDeletePipeline } from '../globalComponents/Sweetalert'
import { PipelineLogModal } from './PipelineLogModal'
import CoreIconButton from '../../../components/CoreIconButton'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
} from '@coreui/react'

const downloadJSON = (obj, fileName = 'data.json') => {
  const jsonString = JSON.stringify(obj, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  saveAs(blob, fileName)
}

const Toolbar = (props) => {
  const [modal, setModal] = useState(false)
  const [isLogFileModalOpen, setIsLogFileModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { mutate: pausePipeline } = usePausePipeline()
  const { mutate: playPipeline } = usePlayPipeline()
  const { mutate: deletePipeline } = useDeletePipeline()
  const { mutate: postPipeline } = useCreateAndStartPipeline()

  const toggleModal = () => setModal((prev) => !prev)
  const toggleLogfileModal = () => setIsLogFileModalOpen((prev) => !prev)

  const deletePipelineHandler = async () => {
    const response = await alertDeletePipeline()
    if (response.value) {
      deletePipeline(props.data.id)
    }
  }

  const pausePipelineHandler = () => {
    pausePipeline(props.data.id)
  }

  const playPipelineHandler = () => {
    playPipeline(props.data.id)
  }

  const regeneratePipelineHandler = async () => {
    if (name && description) {
      const obj = props.data.startDefinition
      obj.name = name
      obj.description = description
      postPipeline(props.data.startDefinition)
    }
  }

  return (
    <div className="pipeline-running-toolbar">
      <PipelineLogModal
        isOpen={isLogFileModalOpen}
        toggle={toggleLogfileModal}
        pipelineId={props.data?.id}
      />
      {/* TODO: add tooltips */}
      <CoreIconButton
        className="pipeline-running-toolbar-button"
        onClick={() => {
          downloadJSON(
            props.data.startDefinition,
            `start_definition_${props.data.id}.json`,
          )
        }}
        color="info"
        outline={true}
        icon={faFileDownload}
        size="lg"
        loadingSize="2x"
        toolTip="Download Start Definition"
      />
      {props.data && (
        <>
          <CoreIconButton
            className="pipeline-running-toolbar-button"
            id="pipeline-button-download-logfile"
            onClick={toggleLogfileModal}
            color="info"
            outline={true}
            size="lg"
            icon={faStickyNote}
            loadingSize="2x"
            toolTip="Show Logs"
          />
          <CoreIconButton
            className="pipeline-running-toolbar-button"
            id="pipeline-button-regenerate"
            onClick={toggleModal}
            color="success"
            outline={true}
            size="lg"
            icon={faRedo}
            loadingSize="2x"
            toolTip="Regenerate"
          />

          <CoreIconButton
            className="pipeline-running-toolbar-button"
            id="pipeline-button-play-pause"
            onClick={
              props.data.progress === 'PAUSED'
                ? playPipelineHandler
                : pausePipelineHandler
            }
            color={props.data.progress === 'PAUSED' ? 'success' : 'warning'}
            outline={true}
            disabled={props.data.progress === 'ERROR' || props.data.progress === '100%'}
            size="lg"
            icon={props.data.progress === 'PAUSED' ? faPlay : faPause}
            loadingSize="2x"
            toolTip={
              props.data.progress === 'PAUSED' ? 'Play Pipeline' : 'Pause Pipeline'
            }
          />
          <CoreIconButton
            className="pipeline-running-toolbar-button"
            id="pipeline-button-delete-pipeline"
            onClick={deletePipelineHandler}
            color="danger"
            outline={true}
            size="lg"
            icon={faTrash}
            loadingSize="2x"
            toolTip="Delete Pipeline"
          />
          <GrayLine />
          <CModal visible={modal} onClose={toggleModal} className={props.className}>
            <CModalHeader>Regenerate Pipeline</CModalHeader>
            <CModalBody>
              <CForm>
                <CFormLabel>Pipeline Name</CFormLabel>
                &nbsp;
                <HelpButton
                  id={'pipeline-start-name'}
                  text={'Give your pipeline a name so that you can identify it later.'}
                />
                <CInputGroup>
                  <CFormInput
                    defaultValue={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                  />
                </CInputGroup>
                <CFormLabel>Pipeline Description</CFormLabel>
                &nbsp;
                <HelpButton
                  id={'pipeline-start-desc'}
                  text={
                    'Give your pipeline a description so that you still know later what you started it for.'
                  }
                />
                <CInputGroup>
                  <CFormInput
                    defaultValue={description}
                    onChange={(e) => setDescription(e.target.value)}
                    type="text"
                  />
                </CInputGroup>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <IconButton
                isOutline={false}
                color="primary"
                disabled={description === undefined || name === undefined}
                icon={faRedo}
                text="Regenerate"
                onClick={regeneratePipelineHandler}
              ></IconButton>
            </CModalFooter>
          </CModal>
        </>
      )}
    </div>
  )
}

export default Toolbar
