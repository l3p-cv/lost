import React, { Component } from 'react'
import { Button, Tooltip } from 'reactstrap'
import GrayLine from 'pipelineGlobalComponents/grayLine'
import actions from 'actions/pipeline/pipelineRunning'
import startActions from 'actions/pipeline/pipelineStart'
import { connect } from 'react-redux'
import { alertLoading, alertClose, alertSuccess, alertDeletePipeline } from 'pipelineGlobalComponents/sweetalert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faDownload, faPause, faPlay, faRedo } from '@fortawesome/free-solid-svg-icons'
import ToolbarTooltip from './ToolbarTooltip'


const { pausePipeline, playPipeline, deletePipeline, downloadLogfile } = actions
const { postPipeline } = startActions
class Toolbar extends Component {
    constructor() {
        super()
        this.delete = this.delete.bind(this)
        this.downloadLogfile = this.downloadLogfile.bind(this)
        this.pause = this.pause.bind(this)
        this.regenerate = this.regenerate.bind(this)
        this.play = this.play.bind(this)
    }
    async delete() {
        const response = await alertDeletePipeline()
        if (response.value) {
            this.props.deletePipeline(this.props.data.id)

        }

    }

    downloadLogfile() {
        this.props.downloadLogfile(this.props.data.logfilePath, this.props.data.id)
    }

    pause() {
        this.props.pausePipeline(this.props.data.id)

    }

    play() {
        this.props.playPipeline(this.props.data.id)

    }

    async regenerate() {
        alertLoading()
        await this.props.postPipeline(this.props.data.startDefinition)
        alertClose()
        if (typeof window !== 'undefined') {
            window.location.href = `${window.location.origin}`;
        }
    }

    render() {
        return (
            <div className='pipeline-running-toolbar'>

                <GrayLine />
                <Button className='pipeline-running-toolbar-button'
                    id='pipeline-button-delete-pipeline'
                    onClick={this.delete}
                    color="secondary">
                    <FontAwesomeIcon
                        icon={faTrash}
                        size="2x"
                    />
                </Button>
                {this.props.data && <>
                    <Button className='pipeline-running-toolbar-button'
                        id='pipeline-button-download-logfile'
                        onClick={this.downloadLogfile}
                        color="secondary">
                        <FontAwesomeIcon
                            icon={faDownload}
                            size="2x"
                        />
                    </Button>
                    <Button className='pipeline-running-toolbar-button'
                        id='pipeline-button-play-pause'
                        onClick={this.props.data.progress === 'PAUSED' ? this.play : this.pause}
                        color="secondary">
                        {this.props.data.progress === 'PAUSED' ?
                            <FontAwesomeIcon
                                icon={faPlay}
                                size="2x"
                            /> :
                            <FontAwesomeIcon
                                icon={faPause}
                                size="2x"
                            />
                        }
                    </Button>
                    <Button className='pipeline-running-toolbar-button'
                        id='pipeline-button-regenerate'
                        onClick={this.regenerate}
                        color="secondary">
                        <FontAwesomeIcon
                            icon={faRedo}
                            size="2x"
                        />
                    </Button>
                    <GrayLine />

                    <ToolbarTooltip
                        target='pipeline-button-delete-pipeline'
                        text='Delete Pipeline'
                    />
                    <ToolbarTooltip
                        target='pipeline-button-download-logfile'
                        text='Download Logfile'
                    />
                    <ToolbarTooltip
                        target='pipeline-button-play-pause'
                        text={this.props.data.progress === 'PAUSED' ?
                            'Play' :
                            'Pause'
                        }
                    />
                    <ToolbarTooltip
                        target='pipeline-button-regenerate'
                        text='Regenerate'
                    />


                </>}
            </div>
        )
    }
}

export default connect(null, { pausePipeline, playPipeline, deletePipeline, downloadLogfile, postPipeline })(Toolbar)

