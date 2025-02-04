import {
    faPause,
    faPlay,
    faRedo,
    faStickyNote,
    faTimes,
    faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { connect } from 'react-redux'
import {
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap'
import actions from '../../../../actions/pipeline/pipelineRunning'
import startActions from '../../../../actions/pipeline/pipelineStart'
import HelpButton from '../../../../components/HelpButton'
import IconButton from '../../../../components/IconButton'
import LogModal from '../../../../components/LogModal'
import GrayLine from '../../globalComponents/GrayLine'
import {
    alertClose,
    alertDeletePipeline,
    alertLoading,
} from '../../globalComponents/Sweetalert'
import ToolbarTooltip from './ToolbarTooltip'

const { pausePipeline, playPipeline, deletePipeline, downloadLogfile } = actions
const { postPipeline } = startActions

const Toolbar = (props) => {
    const [modal, setModal] = useState(false)
    const [isLogFileModalOpen, setIsLogFileModalOpen] = useState(false)
    const [name, setName] = useState(undefined)
    const [description, setDescription] = useState(undefined)

    const toggleModal = () => setModal((prev) => !prev)
    const toggleLogfileModal = () => setIsLogFileModalOpen((prev) => !prev)

    const deletePipelineHandler = async () => {
        const response = await alertDeletePipeline()
        if (response.value) {
            props.deletePipeline(props.data.id)
        }
    }

    const pausePipelineHandler = () => {
        props.pausePipeline(props.data.id)
    }

    const playPipelineHandler = () => {
        props.playPipeline(props.data.id)
    }

    const regeneratePipelineHandler = async () => {
        if (name && description) {
            const obj = props.data.startDefinition
            obj.name = name
            obj.description = description
            alertLoading()
            await props.postPipeline(props.data.startDefinition)
            alertClose()
            if (typeof window !== 'undefined') {
                window.location.href = `${window.location.origin}/pipelines`
            }
        }
    }

    return (
        <div className="pipeline-running-toolbar">
            <LogModal
                isDownloadable={true}
                isOpen={isLogFileModalOpen}
                wiLogId={props.data ? props.data.id : null}
                pipeId={props.data ? props.data.id : null}
                toggle={toggleLogfileModal}
                actionType={LogModal.TYPES.PIPELINE}
            />
            <Button
                className="pipeline-running-toolbar-button"
                id="pipeline-button-delete-pipeline"
                onClick={deletePipelineHandler}
                color="secondary"
            >
                <FontAwesomeIcon icon={faTrash} size="2x" />
            </Button>
            {props.data && (
                <>
                    <Button
                        className="pipeline-running-toolbar-button"
                        id="pipeline-button-download-logfile"
                        onClick={toggleLogfileModal}
                        color="secondary"
                    >
                        <FontAwesomeIcon icon={faStickyNote} size="2x" />
                    </Button>
                    <Button
                        className="pipeline-running-toolbar-button"
                        id="pipeline-button-play-pause"
                        onClick={
                            props.data.progress === 'PAUSED'
                                ? playPipelineHandler
                                : pausePipelineHandler
                        }
                        color="secondary"
                    >
                        {props.data.progress === 'PAUSED' ? (
                            <FontAwesomeIcon icon={faPlay} size="2x" />
                        ) : (
                            <FontAwesomeIcon icon={faPause} size="2x" />
                        )}
                    </Button>
                    <Button
                        className="pipeline-running-toolbar-button"
                        id="pipeline-button-regenerate"
                        onClick={toggleModal}
                        color="secondary"
                    >
                        <FontAwesomeIcon icon={faRedo} size="2x" />
                    </Button>
                    <GrayLine />

                    <ToolbarTooltip
                        target="pipeline-button-delete-pipeline"
                        text="Delete Pipeline"
                    />
                    <ToolbarTooltip
                        target="pipeline-button-download-logfile"
                        text="Show Logs"
                    />
                    <ToolbarTooltip
                        target="pipeline-button-play-pause"
                        text={props.data.progress === 'PAUSED' ? 'Play' : 'Pause'}
                    />
                    <ToolbarTooltip
                        target="pipeline-button-regenerate"
                        text="Regenerate"
                    />
                    <Modal
                        isOpen={modal}
                        toggle={toggleModal}
                        className={props.className}
                    >
                        <ModalHeader toggle={toggleModal}>
                            Regenerate Pipeline
                        </ModalHeader>
                        <ModalBody>
                            <Form>
                                <FormGroup>
                                    <Label for="name">Pipeline Name</Label>
                                    <HelpButton
                                        id={'pipeline-start-name'}
                                        text={
                                            'Give your pipeline a name so that you can identify it later.'
                                        }
                                    />
                                    <Input
                                        defaultValue={name}
                                        onChange={(e) => setName(e.target.value)}
                                        type="text"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="instruction">Pipeline Description</Label>
                                    <HelpButton
                                        id={'pipeline-start-desc'}
                                        text={
                                            'Give your pipeline a description so that you still know later what you started it for.'
                                        }
                                    />
                                    <Input
                                        defaultValue={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        type="text"
                                    />
                                </FormGroup>
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <IconButton
                                isOutline={false}
                                color="primary"
                                disabled={description === undefined || name === undefined}
                                icon={faRedo}
                                text="Regenerate"
                                onClick={regeneratePipelineHandler}
                            ></IconButton>
                            <IconButton
                                isOutline={false}
                                color="secondary"
                                icon={faTimes}
                                text="Close"
                                onClick={toggleModal}
                            ></IconButton>
                        </ModalFooter>
                    </Modal>
                </>
            )}
        </div>
    )
}

export default connect(null, {
    pausePipeline,
    playPipeline,
    deletePipeline,
    downloadLogfile,
    postPipeline,
})(Toolbar)
