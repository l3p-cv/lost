import React, {Component} from 'react'
import {Button} from 'reactstrap'
import GrayLine from 'pipelineGlobalComponents/grayLine'

class Toolbar extends Component{
    constructor(){
        super()
    }
    delete(){

    }
    download(){

    }
    pause(){

    }
    regenerate(){
        
    }

    render(){
        return(
            <div className='pipeline-running-toolbar'>
                <GrayLine/>
                <Button className='pipeline-running-toolbar-button' onClick={this.delete}  color="info">Delete Pipeline</Button>
                <Button className='pipeline-running-toolbar-button' onClick={this.download} color="info">Download Logfile</Button>
                <Button className='pipeline-running-toolbar-button' onClick ={this.pause} color="info">Pause Pipeline</Button>
                <Button className='pipeline-running-toolbar-button' onClick ={this.regenerate} color="info">Regenerate Pipeline</Button>
                <GrayLine/>
            </div>
        )
    }
}

export default Toolbar