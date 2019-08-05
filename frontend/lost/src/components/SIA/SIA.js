import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import './SIA.scss';
import 'semantic-ui-css/semantic.min.css'

import Canvas from './Canvas'
import ToolBar from './ToolBar'
import ImgBar from './ImgBar'
import SIASettingModal from './SIASettingModal'
import InfoBoxArea from './InfoBoxes/InfoBoxArea'
import InfoBox from './InfoBoxes/InfoBox'

const { 
    siaAppliedFullscreen, siaLayoutUpdate, getSiaAnnos,
    getSiaLabels, getSiaConfig, siaSetSVG, getSiaImage, 
    siaSetImageLoaded, siaUpdateAnnos, siaSendFinishToBackend
} = actions

class SIA extends Component {

    constructor(props) {
        super(props)
        this.state = {
            fullscreenCSS: '',
            didMount: false,
            image: {
                id: undefined,
                data: undefined,
            },
            annoUpdateTrigger: 0
        }
        
        this.container = React.createRef()
    }

    componentDidMount() {
        document.body.style.overflow = "hidden"
        this.setState({didMount:true})
        //document.body.style.position = "fixed"
        window.addEventListener("resize", this.props.siaLayoutUpdate);
        this.props.getSiaAnnos(-1)
        this.props.getSiaLabels()
        this.props.getSiaConfig()
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.props.siaLayoutUpdate);
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('Sia did update', this.container.current.getBoundingClientRect())
        this.setFullscreen(this.props.fullscreenMode)
        if (prevState.fullscreenCSS !== this.state.fullscreenCSS){
            // this.props.siaAppliedFullscreen(this.props.fullscreenMode)
            this.props.siaLayoutUpdate()
        }

        if (prevProps.getNextImage !== this.props.getNextImage){
            if (this.props.getNextImage){
                this.props.getSiaAnnos(this.props.getNextImage)
            }
        }
        if (prevProps.getPrevImage !== this.props.getPrevImage){
            if (this.props.getPrevImage){
                this.props.getSiaAnnos(this.props.getPrevImage, 'prev')
            }
        }
        if (prevProps.taskFinished !== this.props.taskFinished){
            this.triggerAnnoUpdate()
        }
        if(this.props.annos.image){
            if(this.props.annos.image.id !== this.state.image.id){
                this.props.getSiaImage(this.props.annos.image.url).then(response=>
                    {
                        this.setState({image: {
                            ...this.state.image, 
                            id: this.props.annos.image.id, 
                            data:window.URL.createObjectURL(response)
                        }})
                    }
                )       

            }
        }
    }

    handleCanvasImageLoaded(){
        this.props.siaSetImageLoaded(true)
    }

    handleAnnoUpdate(annos){
        this.props.siaUpdateAnnos(annos)
        if (this.props.taskFinished){
            console.log('SIA taskFinished')
            this.props.siaSendFinishToBackend()
        }

    }

    triggerAnnoUpdate(){
        this.setState({
            annoUpdateTrigger: this.state.annoUpdateTrigger + 1
        })
    }

    setFullscreen(fullscreen = true) {
        if (fullscreen) {
            if (this.state.fullscreenCSS !== 'sia-fullscreen') {
                this.setState({ fullscreenCSS: 'sia-fullscreen' })
            }
        } else {
            if (this.state.fullscreenCSS !== '') {
                this.setState({
                    fullscreenCSS: ''
                })
            }
        }
    }

    render() {
        console.log('Sia renders')
        return (
            <div className={this.state.fullscreenCSS} ref={this.container}>
                <Canvas container={this.container}
                    annos={this.props.annos}
                    image={this.state.image}
                    getNextImage={this.props.getNextImage}
                    getPrevImage={this.props.getPrevImage}
                    uiConfig={this.props.uiConfig}
                    layoutUpdate={this.props.layoutUpdate}
                    selectedTool={this.props.selectedTool}
                    allowedActions={this.props.allowedActions}
                    // appliedFullscreen={this.props.appliedFullscreen}
                    imageLoaded={this.props.imageLoaded}
                    requestAnnoUpdate={this.props.requestAnnoUpdate}
                    taskFinished={this.props.taskFinished}
                    triggerAnnoUpdate={this.state.annoUpdateTrigger}
                    onSVGUpdate={svg => this.props.siaSetSVG(svg)}
                    onImageLoaded={() => this.handleCanvasImageLoaded()}
                    onAnnoUpdate={ (annos) => this.handleAnnoUpdate(annos)}
                />
                <ToolBar container={this.container}></ToolBar>
                <ImgBar container={this.container}></ImgBar>
                <InfoBoxArea container={this.container}></InfoBoxArea>
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
        allowedActions: state.sia.config.actions,
        appliedFullscreen: state.sia.appliedFullscreen,
        imageLoaded: state.sia.imageLoaded,
        requestAnnoUpdate: state.sia.requestAnnoUpdate,
        taskFinished: state.sia.taskFinished,
    })
}

export default connect(
    mapStateToProps,
    {
        // siaAppliedFullscreen, 
        siaLayoutUpdate, getSiaAnnos,
        getSiaConfig, getSiaLabels, siaSetSVG, getSiaImage,
        siaSetImageLoaded, siaUpdateAnnos, siaSendFinishToBackend
    }
    , null,
    {})(SIA)

