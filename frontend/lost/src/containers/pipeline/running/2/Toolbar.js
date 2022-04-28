import React, { Component } from 'react'
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Card,
    CardBody,
    Form,
    FormGroup,
    Label,
    Input,
} from 'reactstrap'
import GrayLine from '../../globalComponents/GrayLine'
import IconButton from '../../../../components/IconButton'
import actions from '../../../../actions/pipeline/pipelineRunning'

import startActions from '../../../../actions/pipeline/pipelineStart'
import HelpButton from '../../../../components/HelpButton'
import { connect } from 'react-redux'
import {
    alertLoading,
    alertClose,
    alertDeletePipeline,
} from '../../globalComponents/Sweetalert'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTrash,
    faStickyNote,
    faPause,
    faPlay,
    faRedo,
    faTimes,
} from '@fortawesome/free-solid-svg-icons'
import ToolbarTooltip from './ToolbarTooltip'
import LogModal from '../../../../components/LogModal'

const { pausePipeline, playPipeline, deletePipeline, downloadLogfile } = actions
const { postPipeline } = startActions

class Toolbar extends Component {
    constructor() {
        super()
        this.delete = this.delete.bind(this)
        this.showLogfile = this.showLogfile.bind(this)
        this.pause = this.pause.bind(this)
        this.regenerate = this.regenerate.bind(this)
        this.play = this.play.bind(this)
        this.state = {
            modal: false,
            isLogFileModalOpen: false,
            name: undefined,
            description: undefined,
        }
        this.toggle = this.toggle.bind(this)
        this.nameOnInput = this.nameOnInput.bind(this)
        this.descriptionOnInput = this.descriptionOnInput.bind(this)
    }
    async delete() {
        const response = await alertDeletePipeline()
        if (response.value) {
            this.props.deletePipeline(this.props.data.id)
        }
    }

    toggle() {
        this.setState((prevState) => ({
            modal: !prevState.modal,
        }))
    }

    showLogfile() {
        this.setState({ isLogFileModalOpen: !this.state.isLogFileModalOpen })
    }

    pause() {
        this.props.pausePipeline(this.props.data.id)
    }

    play() {
        this.props.playPipeline(this.props.data.id)
    }

    async regenerate() {
        if (this.state.name && this.state.description) {
            const obj = this.props.data.startDefinition
            obj.name = this.state.name
            obj.description = this.state.description
            alertLoading()
            await this.props.postPipeline(this.props.data.startDefinition)
            alertClose()
            if (typeof window !== 'undefined') {
                window.location.href = `${window.location.origin}/pipelines`
            }
        }
    }

    nameOnInput(e) {
        this.setState({
            name: e.target.value,
        })
    }
    descriptionOnInput(e) {
        this.setState({
            description: e.target.value,
        })
    }

    render() {
        return (
            <div className="pipeline-running-toolbar">
                <GrayLine />
                <LogModal
                    isDownloadable={true}
                    isOpen={this.state.isLogFileModalOpen}
                    wiLogId={this.props.data ? this.props.data.id : null}
                    pipeId={this.props.data ? this.props.data.id : null}
                    toggle={() => {
                        this.setState({
                            isLogFileModalOpen: !this.state.isLogFileModalOpen,
                        })
                    }}
                    actionType={LogModal.TYPES.PIPELINE}
                />
                <Button
                    className="pipeline-running-toolbar-button"
                    id="pipeline-button-delete-pipeline"
                    onClick={this.delete}
                    color="secondary"
                >
                    <FontAwesomeIcon icon={faTrash} size="2x" />
                </Button>
                {this.props.data && (
                    <>
                        <Button
                            className="pipeline-running-toolbar-button"
                            id="pipeline-button-download-logfile"
                            onClick={this.showLogfile}
                            color="secondary"
                        >
                            <FontAwesomeIcon icon={faStickyNote} size="2x" />
                        </Button>
                        <Button
                            className="pipeline-running-toolbar-button"
                            id="pipeline-button-play-pause"
                            onClick={
                                this.props.data.progress === 'PAUSED'
                                    ? this.play
                                    : this.pause
                            }
                            color="secondary"
                        >
                            {this.props.data.progress === 'PAUSED' ? (
                                <FontAwesomeIcon icon={faPlay} size="2x" />
                            ) : (
                                <FontAwesomeIcon icon={faPause} size="2x" />
                            )}
                        </Button>
                        <Button
                            className="pipeline-running-toolbar-button"
                            id="pipeline-button-regenerate"
                            onClick={this.toggle}
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
                            text={
                                this.props.data.progress === 'PAUSED' ? 'Play' : 'Pause'
                            }
                        />
                        <ToolbarTooltip
                            target="pipeline-button-regenerate"
                            text="Regenerate"
                        />
                        <Modal
                            isOpen={this.state.modal}
                            toggle={this.toggle}
                            className={this.props.className}
                        >
                            <ModalHeader toggle={this.toggle}>
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
                                            defaultValue={this.state.name}
                                            onChange={this.nameOnInput}
                                            type="text"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="instruction">
                                            Pipeline Description
                                        </Label>
                                        <HelpButton
                                            id={'pipeline-start-desc'}
                                            text={
                                                'Give your pipeline a description so that you still know later what you started it for.'
                                            }
                                        />
                                        <Input
                                            defaultValue={this.state.description}
                                            onChange={this.descriptionOnInput}
                                            type="text"
                                        />
                                    </FormGroup>
                                </Form>
                            </ModalBody>
                            <ModalFooter>
                                <IconButton
                                    isOutline={false}
                                    color="primary"
                                    disabled={
                                        this.state.description === undefined ||
                                        this.state.name === undefined
                                    }
                                    icon={faRedo}
                                    text="Regenerate"
                                    onClick={this.regenerate}
                                ></IconButton>
                                <IconButton
                                    isOutline={false}
                                    color="secondary"
                                    icon={faTimes}
                                    text="Close"
                                    onClick={this.toggle}
                                ></IconButton>
                            </ModalFooter>
                        </Modal>
                    </>
                )}
            </div>
        )
    }
}

export default connect(null, {
    pausePipeline,
    playPipeline,
    deletePipeline,
    downloadLogfile,
    postPipeline,
})(Toolbar)
