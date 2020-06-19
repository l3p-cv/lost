import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import 'semantic-ui-css/semantic.min.css'
import { Button } from 'reactstrap'
import { createHashHistory } from 'history'



const { 
    siaLayoutUpdate, getSiaAnnos,
    getSiaLabels, getSiaConfig, siaSetSVG, getSiaImage, 
    siaUpdateAnnos, siaSendFinishToBackend,
    selectAnnotation, siaShowImgLabelInput, siaImgIsJunk, getWorkingOnAnnoTask,
    siaGetNextImage, siaGetPrevImage
} = actions

class SIAReview extends Component {

    constructor(props) {
        super(props)
        this.state = {
        
        }
        this.siteHistory = createHashHistory()

    }

   

    onDashboarClick(e){
        console.log('Dasboard clicked')
        this.siteHistory.push('/dashboard')

    }

    render() {
        return (
            <div className={this.state.fullscreenCSS} ref={this.container}>
                "SIAReview"
                <Button onClick={e => this.onDashboarClick(e)}>Dashboard</Button>
             </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        fullscreenMode: state.sia.fullscreenMode,
        selectedAnno: state.sia.selectedAnno,
        svg: state.sia.svg,
        annos: state.sia.annos,
        getNextImage: state.sia.getNextImage,
        getPrevImage: state.sia.getPrevImage,
        uiConfig: state.sia.uiConfig,
        layoutUpdate: state.sia.layoutUpdate,
        selectedTool: state.sia.selectedTool,
        appliedFullscreen: state.sia.appliedFullscreen,
        imageLoaded: state.sia.imageLoaded,
        requestAnnoUpdate: state.sia.requestAnnoUpdate,
        taskFinished: state.sia.taskFinished,
        possibleLabels: state.sia.possibleLabels,
        imgLabelInput: state.sia.imgLabelInput,
        canvasConfig: state.sia.config,
        isJunk: state.sia.isJunk,
        currentImage: state.sia.annos.image
    })
}

export default connect(
    mapStateToProps,
    {
        siaLayoutUpdate, getSiaAnnos,
        getSiaConfig, getSiaLabels, siaSetSVG, getSiaImage,
        siaUpdateAnnos, siaSendFinishToBackend,
        selectAnnotation,
        siaShowImgLabelInput,
        siaImgIsJunk,
        getWorkingOnAnnoTask,
        siaGetNextImage, siaGetPrevImage
    }
    , null,
    {})(SIAReview)

