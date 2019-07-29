import React, {Component} from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'
import Annotation from './Annotation/Annotation'
import LabelInput from './LabelInput'

import actions from '../../actions'

import * as transform from './utils/transform'
import * as modes from './types/modes'
import * as annoStatus from './types/annoStatus'

const { 
    getSiaImage, getSiaAnnos, siaKeyDown, 
    siaKeyUp, selectAnnotation, getSiaLabels,
    siaUpdateAnnos, siaSetImageLoaded, siaUpdateReduxAnnos,
    siaSetSVG, getSiaConfig, siaSendFinishToBackend
} = actions

class Canvas extends Component{

    constructor(props){
        super(props)
        this.state = {
            image: {
                id: undefined,
                data: undefined,
            },
            svg: {
                width: '100%',
                height: '100%',
                scale:1.0,
                translateX:0,
                translateY:0
            },
            annos: [],
            mode: modes.VIEW
        }
        this.img = React.createRef()
        this.svg = React.createRef()
        this.annoRefs = []
        this.container = React.createRef()
    }

    componentDidMount(){
        this.props.getSiaAnnos(-1)
        this.props.getSiaLabels()
        this.props.getSiaConfig()
        // console.warn('No sia config will be loaded')
    }

    componentDidUpdate(prevProps){
        console.log('didupdate')
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
        if (prevProps.getNextImage !== this.props.getNextImage){
            if (this.props.getNextImage){
                this.updateBackendAnnos()
                this.props.getSiaAnnos(this.props.getNextImage)
            }
        }
        if (prevProps.getPrevImage !== this.props.getPrevImage){
            if (this.props.getPrevImage){
                this.updateBackendAnnos()
                this.props.getSiaAnnos(this.props.getPrevImage, 'prev')
            }
        }
        
        if (prevProps.taskFinished !== this.props.taskFinished){
            this.updateBackendAnnos()
            this.props.siaSendFinishToBackend()
        }

        if (this.props.imageLoaded){
            // Selected annotation should be on top
            this.putSelectedOnTop(prevProps)
            if (prevProps.imageLoaded !== this.props.imageLoaded){
                this.updateCanvasView(this.props.annos.drawables)
            } 
            if (prevProps.appliedFullscreen !== this.props.appliedFullscreen){
                console.log('Canvas applied Fullscreen', this.props.appliedFullscreen)
                this.updateCanvasView(this.props.annos.drawables)
            } else if(prevProps.layoutUpdate !== this.props.layoutUpdate){
                this.props.selectAnnotation(undefined)
                this.updateCanvasView(this.getAnnoBackendFormat())
            }
            // else if (prevProps.annos !== this.props.annos){
                // 
            // }
            if (prevProps.requestAnnoUpdate !== this.props.requestAnnoUpdate){
                console.log('Canvas siaUpdateReduxAnnos')
                this.props.siaUpdateReduxAnnos(
                    {...this.props.annos,
                        drawables: this.getAnnoBackendFormat()
                    })
            }
            console.log('Canvas this.state.annos',this.state.annos)
            
        }
        // // Workaround to find out when workingOnAnnoTask component has rendered,
        // // in order to calculate correct position for canvas
        // if (prevProps.workingOnAnnoTask !== this.props.workingOnAnnoTask){
        //     this.updateCanvasView()
        // }
    }
    
    onImageLoad(){
        this.props.siaSetImageLoaded(true)
    }

    onMouseOver(){
        //Prevent scrolling on svg
        
        // document.body.style.position = "fixed"
        // document.body.style.overflowY = "scroll"
        
        // document.body.style.overflow = "hidden"
        this.svg.current.focus()
        console.log('Mouse Over Canvas')
    }
    onMouseOut(){
        //Enable scrolling after leaving svg
        // document.body.style.overflow = "auto"
        
        // document.body.style.position = "static"
        // document.body.style.overflowY = "auto"
    }
    onWheel(e:Event){
        // Zoom implementation. Note that svg is first scaled and 
        // second translated!
        const up = e.deltaY < 0
        const mousePos = this.getMousePosition(e)
        const zoomFactor=1.25
        let nextScale
        if (up) {
            nextScale = this.state.svg.scale * zoomFactor
            
        } else {
            nextScale = this.state.svg.scale / zoomFactor
        }
        //Constrain zoom
        if (nextScale < 1.0){
            nextScale = 1.0
        }
        this.setState({svg: {
            ...this.state.svg,
            scale: nextScale,
            translateX: -1*(mousePos.x * nextScale - mousePos.x)/nextScale,
            translateY: -1*(mousePos.y * nextScale - mousePos.y)/nextScale
        }})
    }

    onRightClick(e){
        e.preventDefault()
    }

    onMouseDown(e){
        if (e.button === 0){
            this.props.selectAnnotation(undefined)
        }
        else if (e.button === 1){
            this.collectAnnos()
            this.setMode(modes.CAMERA_MOVE)
            // this.setState({svg:
            //     {...this.state.svg, 
            //         scale: 1.0, 
            //         translateX: 0, 
            //         translateY: 0
            //     }})
        }
        else if (e.button === 2){
            //Create annotation on right click
           this.createNewAnnotation(e)
        }
    }

    onAnnoMouseDown(e){
        if (e.button === 1){
            this.collectAnnos()
            this.setMode(modes.CAMERA_MOVE)
        }
        else if (e.button === 2){
            //Create annotation on right click
           this.createNewAnnotation(e)
        }
    }

    onMouseUp(e){
        switch (e.button){
            case 1:
                this.setMode(modes.VIEW)
                break
            default:
                break
        }
    }

    // onKeyPress(e: Event){
    //     e.preventDefault()
    //     console.log(e.key, e.keyCode, e.keyCode, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
    //     if (e.key === 'Delete'){
    //         this.removeSelectedAnno()
    //     }
    // }

    onKeyDown(e: Event){
        e.preventDefault()
        // if (e.key === 'Delete'){
        //     this.removeSelectedAnno()
        // }
        this.props.siaKeyDown(e.key)
        console.log('KEY down on Canvas', e.key, e.keyCode, e.keyCode, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
        this.traverseAnnos(e.key)
    }

    onKeyUp(e: Event){
        e.preventDefault()
        this.props.siaKeyUp(e.key)
        console.log('KEY up on Canvas', e.key, e.keyCode, e.keyCode, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
    }

    onMouseMove(e: Event){
        if (this.state.mode === modes.CAMERA_MOVE){
            this.moveCamera(e)
        }
    }

    onLabelInputDeleteClick(annoId){
        this.removeSelectedAnno()
    }
    
    /*************
     * LOGIC     *
    **************/

    /**
     * Traverse annotations by key hit
     * 
     * @param key A key code
     */
    traverseAnnos(key){
        console.log('Traverse annos', key, this.state.annos, this.props.selectedAnno)
        if (key === 'Tab'){
            if (this.state.annos.length > 0){
                if (!this.props.selectedAnno.id){
                    this.props.selectAnnotation(this.state.annos[0])
                } else {
                    let currentIdx = this.state.annos.findIndex( e => {
                        return e.id === this.props.selectedAnno.id
                    })
                    if (currentIdx+1 < this.state.annos.length){
                        this.props.selectAnnotation(this.state.annos[currentIdx+1])
                    } else {
                        this.props.selectAnnotation(this.state.annos[0])
                    }
                }

            }
        }
    } 
    // Collect the current data of all annotations and update state
    collectAnnos(){
        // console.log('Canvas collectAnnos this.annoRefs', this.annoRefs)
        let annos = []  
        this.annoRefs.forEach( ref => {
            if (ref) {
                annos.push(ref.current.getResult())
            }
        })
        console.log('collectAnnos Result annos', annos)
        this.setState({annos: [...annos]})
    }

    getAnnoBackendFormat(forBackendPost=false){
        let annos = []  
        //Get newest anno data from components
        this.annoRefs.forEach( ref => {
            if (ref) {
                annos.push(ref.current.getResult())
            }
        })
        const bAnnos = annos.map( el => {
            var annoId 
            if (forBackendPost){
                // If an annotation will be send to backend,
                // ids of new created annoations need to be set to 
                // undefined.
                annoId = (typeof el.id) === "string" ? undefined : el.id
            } else {
                annoId = el.id
            }
            return {
                ...el,
                id: annoId,
                data: transform.toBackend(el.data, this.state.svg, el.type)
            }
        })
        const backendFormat = {
                bBoxes: bAnnos.filter((el) => {return el.type == 'bBox'}),
                lines: bAnnos.filter((el) => {return el.type == 'line'}),
                points: bAnnos.filter((el) => {return el.type == 'point'}),
                polygons: bAnnos.filter((el) => {return el.type == 'polygon'}),
        }
        console.log('Annotation getAnnoBackendFormat', backendFormat)
        return backendFormat
    }
    updateBackendAnnos(){
        const backendFormat = this.getAnnoBackendFormat(true)
        const finalData = {
            imgId: this.props.annos.image.id,
            drawables: backendFormat
        }
        console.log('Update Backend annos', finalData)
        this.props.siaUpdateAnnos(finalData)
    }

    moveCamera(e){
        this.setState({svg: {
            ...this.state.svg,
            translateX: this.state.svg.translateX + e.movementX / this.state.svg.scale,
            translateY: this.state.svg.translateY + e.movementY / this.state.svg.scale
        }})
    }

    setMode(mode){
        if (this.state.mode !== mode){
            this.setState({mode: mode})
        }
    }
    
    getMousePosition(e){
        const absPos = this.getMousePositionAbs(e)
        return {
            x: (absPos.x )/this.state.svg.scale - this.state.svg.translateX,
            y: (absPos.y )/this.state.svg.scale - this.state.svg.translateY
        }
    }

    getMousePositionAbs(e){
        return {
            x: (e.pageX - this.svg.current.getBoundingClientRect().left),
            y: (e.pageY - this.svg.current.getBoundingClientRect().top)
        }
    }

    // removeSelectedAnno(){
    //     const annos = this.state.annos.filter( (el) => {
    //         return el.id !== this.props.selectedAnno.id
    //     })
    //     this.setState({annos: annos})
    // }

    createNewAnnotation(e){
        if (this.props.selectedTool){
            const mousePos = this.getMousePosition(e)
            this.setState({
                annos: [...this.state.annos, {
                    id: _.uniqueId('new'),
                    type: this.props.selectedTool,
                    data: [{
                        x: mousePos.x, 
                        y: mousePos.y
                    }],
                    createMode: true,
                    status: annoStatus.NEW,
                    labelIds: []
                }]
            })
        } else {
            console.warn('No annotation tool selected!')
        }
    }

    putSelectedOnTop(prevProps){
        // The selected annotation need to be rendered as last one in 
        // oder to be above all other annotations.
        if (this.props.selectedAnno.id){
            if (prevProps.selectedAnno.id !== this.props.selectedAnno.id){
                const annos = this.state.annos.filter( (el) => {
                    return el.id !== this.props.selectedAnno.id
                })
                const lastAnno = this.state.annos.find( el => {
                    return el.id === this.props.selectedAnno.id
                })
                annos.push(lastAnno)
                this.setState({annos: [
                    ...annos
                ]})
            }
        }
    }

    updateImageSize(){
        
        var container = this.props.container.current.getBoundingClientRect()
        var canvasLeft
        if (container.left < this.props.uiConfig.toolBarWidth){
            canvasLeft = this.props.uiConfig.toolBarWidth + 10
        } else {
            canvasLeft = container.left
        }
        console.log('Canvas container', container)
        console.log('CanvasLeft', canvasLeft, this.props.uiConfig.toolBarWidth)
        var clientWidth = document.documentElement.clientWidth
        var clientHeight = document.documentElement.clientHeight
        var maxImgWidth = container.right -canvasLeft
        var maxImgHeight = clientHeight - container.top - 10
        if (this.props.appliedFullscreen) maxImgHeight = maxImgHeight + 10 
        var ratio = this.img.current.naturalWidth / this.img.current.naturalHeight
        var imgWidth = "100%"
        var imgHeight = "100%"
        console.log('clientHeight', clientHeight)
        console.log('window.innerHeight', window.innerHeight)
        console.log('naturalWidth', this.img.current.naturalWidth)
        console.log('naturalHeight', this.img.current.naturalHeight)
        console.log('maxImgWidth', maxImgWidth)
        console.log('maxImgHeight', maxImgHeight)
        console.log('ratio', ratio)
        if (maxImgHeight * ratio > maxImgWidth){
            imgWidth = maxImgWidth
            imgHeight = maxImgWidth / ratio
        } else {
            imgWidth = maxImgHeight * ratio
            imgHeight = maxImgHeight
        }
        // console.log('svg', this.svg)
        console.log('img', this.img)
        console.log('imgWidth, imgHeight', imgWidth, imgHeight)
        const svg = {
            ...this.state.svg, width : imgWidth, height: imgHeight,
            left: canvasLeft, top: container.top
        }
        this.setState({svg})
        this.props.siaSetSVG(svg)
        return {imgWidth, imgHeight}
    }

    updateCanvasView(drawables){
        

        var annos = []
        //Annotation data should be present and a pixel accurate value 
        //for svg should be calculated
        if(drawables){
            console.log('UpdateCanvasView drawables', drawables)
            const imgSize = this.updateImageSize()
            annos = [
                ...drawables.bBoxes.map((element) => {
                    return {...element, type:'bBox', createMode:false, 
                    status: element.status ? element.status : annoStatus.DATABASE}
                }),
                ...drawables.lines.map((element) => {
                    return {...element, type:'line', createMode:false, 
                    status: element.status ? element.status : annoStatus.DATABASE}
                }),
                ...drawables.polygons.map((element) => {
                    return {...element, type:'polygon', createMode:false, 
                    status: element.status ? element.status : annoStatus.DATABASE}
                }),
                ...drawables.points.map((element) => {
                    return {...element, type:'point', createMode:false, 
                        status: element.status ? element.status : annoStatus.DATABASE
                    }
                })
            ]
            annos = annos.map((el) => {
                return {...el, 
                    data:transform.toSia(el.data, {width: imgSize.imgWidth, height:imgSize.imgHeight}, el.type)}
                })
            console.log('Canvas annos', annos)
            this.setState({annos: [...annos]})
        }
    }

    renderAnnotations(){
        // Do not render annotations while moving the camera!
        if (this.state.mode !== modes.CAMERA_MOVE){
            // if (this.props.showSingleAnno){
            //     let idx = this.state.annos.findIndex( e => {
            //         return e.id === this.props.showSingleAnno
            //     })
            //     return <Annotation type={this.state.annos[idx].type}
            //             data={this.state.annos[idx]} key={this.state.annos[idx].id}
            //             svg={this.state.svg} ref={this.annoRefs[idx]}/>
            // } else {
            console.log('Canvas render annotations', this.state.annos)
            this.annoRefs = []
            const annos =  this.state.annos.map((el) => {
                this.annoRefs.push(React.createRef())
                return <Annotation type={el.type} 
                        data={el} key={el.id} svg={{...this.state.svg}}
                        ref={this.annoRefs[this.annoRefs.length - 1]}
                        onMouseDown={e => this.onAnnoMouseDown(e)}
                    />
            })
            return <g>{annos}</g>
            // }

        } else {
            return null
        }
        
    }

    render(){
        // if (!this.props.container) return null
        return(
            <div ref={this.container} >
            <div height={this.state.svg.height} 
            style={{position: 'fixed', top: this.state.svg.top, left: this.state.svg.left}}
            >
                {/* <div style={{position: 'fixed', top: this.props.container.top, left: this.props.container.left}}> */}
                <LabelInput svg={this.state.svg} svgRef={this.svg} 
                    onDeleteClick={annoId => this.onLabelInputDeleteClick(annoId)}></LabelInput>
                <svg ref={this.svg} width={this.state.svg.width} 
                    height={this.state.svg.height}
                    onKeyDown={e => this.onKeyDown(e)}
                    onKeyUp={e => this.onKeyUp(e)}
                    tabIndex="0"
                    >
                    <g 
                        transform={`scale(${this.state.svg.scale}) translate(${this.state.svg.translateX}, ${this.state.svg.translateY})`}
                        onMouseOver={() => {this.onMouseOver()}}
                        onMouseOut={() => {this.onMouseOut()}}
                        onMouseUp={(e) => {this.onMouseUp(e)}}
                        onWheel={(e) => {this.onWheel(e)}}
                        onMouseMove={(e) => {this.onMouseMove(e)}}
                    >
                        <image
                            onContextMenu={(e) => this.onRightClick(e)}
                            onMouseDown={(e) => this.onMouseDown(e)}
                            href={this.state.image.data} 
                            width={this.state.svg.width} 
                            height={this.state.svg.height}
                        />
                        {this.renderAnnotations()}
                    </g>
                </svg>
                <img style={{display:'none'}} ref={this.img} onLoad={() => {this.onImageLoad()}} src={this.state.image.data} width="100%" height="100%"></img>
                {/* </div> */}
                </div>
                {/* Placeholder for Layout*/}
                <div style={{minHeight: this.state.svg.height}}></div> 
            </div>)
    }
}




function mapStateToProps(state) {
    return ({
        annos: state.sia.annos,
        selectedAnno: state.sia.selectedAnno,
        selectedTool: state.sia.selectedTool,
        getNextImage: state.sia.getNextImage,
        getPrevImage: state.sia.getPrevImage,
        imageLoaded: state.sia.imageLoaded,
        appliedFullscreen: state.sia.appliedFullscreen,
        requestAnnoUpdate: state.sia.requestAnnoUpdate,
        uiConfig: state.sia.uiConfig,
        layoutUpdate: state.sia.layoutUpdate,
        taskFinished: state.sia.taskFinished
        // workingOnAnnoTask: state.annoTask.workingOnAnnoTask,
    })
}

export default connect(mapStateToProps, 
    {
        getSiaAnnos, getSiaImage, siaKeyDown, 
        siaKeyUp, selectAnnotation, getSiaLabels,
        siaUpdateAnnos, siaSetImageLoaded, siaUpdateReduxAnnos,
        siaSetSVG, getSiaConfig, siaSendFinishToBackend
    }
)(Canvas)