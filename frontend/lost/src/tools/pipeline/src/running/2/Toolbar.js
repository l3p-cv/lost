import React, { Component } from 'react'
import { Button } from 'reactstrap'
import GrayLine from 'pipelineGlobalComponents/grayLine'
import actions from 'actions/pipeline/pipelineRunning'
import startActions from 'actions/pipeline/pipelineStart'
import { connect } from 'react-redux'
import { alertLoading, alertClose, alertSuccess, alertDeletePipeline } from 'pipelineGlobalComponents/sweetalert'

const { pausePipeline, playPipeline, deletePipeline, regeneratePipeline, downloadLogfile } = actions
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
        alertClose ()
        if (typeof window !== 'undefined') {
            window.location.href = `${window.location.origin}`;
        }
    }

    render() {
        return (
            <div className='pipeline-running-toolbar'>
                {this.props.data && <>
                    <GrayLine />
                    <Button className='pipeline-running-toolbar-button' onClick={this.delete} color="info">Delete Pipeline</Button>
                    <Button className='pipeline-running-toolbar-button' onClick={this.downloadLogfile} color="info">Download Logfile</Button>
                    <Button className='pipeline-running-toolbar-button'
                        onClick={this.props.data.progress === 'PAUSED' ? this.play : this.pause}
                        color="info">
                        {this.props.data.progress === 'PAUSED' ? 'Play' : 'Pause'}
                    </Button>
                    <Button className='pipeline-running-toolbar-button' onClick={this.regenerate} color="info">Regenerate Pipeline</Button>
                    <GrayLine />
                </>}
            </div>
        )
    }
}

export default connect(null, { pausePipeline, playPipeline, deletePipeline, regeneratePipeline, downloadLogfile, postPipeline })(Toolbar)

