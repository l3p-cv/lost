import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import './SIA.scss';
import 'semantic-ui-css/semantic.min.css'

import Canvas from './Canvas'
import ToolBar from './ToolBar'
import InfoBoxArea from './InfoBoxes/InfoBoxArea'

const { 
    siaAppliedFullscreen, siaLayoutUpdate, getSiaAnnos,
    getSiaLabels, getSiaConfig, siaSetSVG, getSiaImage, 
    siaSetImageLoaded, siaUpdateAnnos, siaSendFinishToBackend,
    selectAnnotation, siaShowImgBar
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
            layoutOffset: {
                left: 0,
                top: 0,
                bottom: 10,
                right: 0
            }
        }
        
        this.container = React.createRef()
        this.canvas = React.createRef()
    }

    componentDidMount() {
        document.body.style.overflow = "hidden"
        this.setState({didMount:true})
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
                const newAnnos = this.canvas.current.getAnnos()
                console.log('getNextImage newAnnos', newAnnos)
                this.props.siaUpdateAnnos(newAnnos)
                this.props.getSiaAnnos(this.props.getNextImage)
                this.setState({image: {
                    id: undefined, 
                    data:undefined
                }})
            }
        }
        if (prevProps.getPrevImage !== this.props.getPrevImage){
            if (this.props.getPrevImage){
                const newAnnos = this.canvas.current.getAnnos()
                this.props.siaUpdateAnnos(newAnnos)
                this.props.getSiaAnnos(this.props.getPrevImage, 'prev')
                this.setState({image: {
                    id: undefined, 
                    data:undefined
                }})
            }
        }
        if (prevProps.taskFinished !== this.props.taskFinished){
            const newAnnos = this.canvas.current.getAnnos()
            this.props.siaUpdateAnnos(newAnnos)
            this.props.siaSendFinishToBackend()
        }
        if(this.props.annos.image){
            if (prevProps.annos.image){
                if(this.props.annos.image.id !== prevProps.annos.image.id){
                    this.requestImageFromBackend()
                }
            } else {
                this.requestImageFromBackend()
            }
        }
    }

    handleImgBarClose(){
        this.props.siaShowImgBar(false)
    }

    requestImageFromBackend(){
        this.props.getSiaImage(this.props.annos.image.url).then(response=>
            {
                this.setState({image: {
                    // ...this.state.image, 
                    id: this.props.annos.image.id, 
                    data:window.URL.createObjectURL(response)
                }})
            }
        )       
    }

    setFullscreen(fullscreen = true) {
        if (fullscreen) {
            if (this.state.fullscreenCSS !== 'sia-fullscreen') {
                this.setState({ 
                    fullscreenCSS: 'sia-fullscreen',
                    layoutOffset: {
                        ...this.state.layoutOffset,
                        left: 50,
                    } 
                })
            }
        } else {
            if (this.state.fullscreenCSS !== '') {
                this.setState({
                    fullscreenCSS: '',
                    layoutOffset: {
                        ...this.state.layoutOffset,
                        left: 0,
                    } 
                })
            }
        }
    }

    render() {
        console.log('Sia renders', this.state.image)
        return (
            <div className={this.state.fullscreenCSS} ref={this.container}>
                <Canvas
                    ref={this.canvas} 
                    imgBarVisible={this.props.imgBar.show}
                    container={this.container}
                    annos={this.props.annos}
                    image={this.state.image}
                    uiConfig={this.props.uiConfig}
                    layoutUpdate={this.props.layoutUpdate}
                    selectedTool={this.props.selectedTool}
                    allowedActions={this.props.allowedActions}
                    possibleLabels={this.props.possibleLabels}
                    onSVGUpdate={svg => this.props.siaSetSVG(svg)}
                    // onImageLoaded={() => this.handleCanvasImageLoaded()}
                    onAnnoSelect={anno => this.props.selectAnnotation(anno)}
                    onImgBarClose={() => this.handleImgBarClose()}
                    layoutOffset={this.state.layoutOffset}
                />
                <ToolBar container={this.container}></ToolBar>
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
        possibleLabels: state.sia.possibleLabels,
        imgBar: state.sia.imgBar
    })
}

export default connect(
    mapStateToProps,
    {
        siaLayoutUpdate, getSiaAnnos,
        getSiaConfig, getSiaLabels, siaSetSVG, getSiaImage,
        siaUpdateAnnos, siaSendFinishToBackend,
        selectAnnotation,
        siaShowImgBar
    }
    , null,
    {})(SIA)

