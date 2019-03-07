import React, {Component} from 'react'
import {Button} from 'reactstrap'
import GrayLine from 'pipelineGlobalComponents/grayLine'
import actions from 'actions/pipeline/pipelineRunning'
import {connect} from 'react-redux'

const {pausePipeline, playPipeline, deletePipeline, regeneratePipeline} = actions

class Toolbar extends Component{
    constructor(){
        super()
        this.delete = this.delete.bind(this)
        this.download = this.download.bind(this)
        this.pause = this.pause.bind(this)
        this.regenerate = this.regenerate.bind(this)
        this.play = this.play.bind(this)
    }
    delete(){

        if(this.props.data){
            this.props.deletePipeline(this.props.data.templateId)
        }
        
    }
    download(){
    }

    pause(){
        if(this.props.data){
            this.props.pausePipeline(this.props.data.id)
        }
    }

    play(){
        if(this.props.data){
            this.props.playPipeline(this.props.data.id)
        }
    }

    regenerate(){
        
    }

    render(){
        return(
            <div className='pipeline-running-toolbar'>
                <GrayLine/>
                <Button className='pipeline-running-toolbar-button' onClick={this.delete}  color="info">Delete Pipeline</Button>
                <Button className='pipeline-running-toolbar-button' onClick={this.download} color="info">Download Logfile</Button>
                <Button className='pipeline-running-toolbar-button' 
                onClick ={this.props.data.progress === 'PAUSED'?this.play: this.pause} 
                color="info">
                {this.props.data.progress === 'PAUSED'?'Play': 'Pause'}
                </Button>
                <Button className='pipeline-running-toolbar-button' onClick ={this.regenerate} color="info">Regenerate Pipeline</Button>
                <GrayLine/>
            </div>
        )
    }
}

export default connect(null, {pausePipeline, playPipeline, deletePipeline, regeneratePipeline})(Toolbar)