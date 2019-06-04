import React, {Component} from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'
import Annotation from './Annotation/Annotation'
import LabelInput from './LabelInput'

import actions from '../../actions'

import * as transform from './utils/transform'
import * as modes from './types/modes'


const { getSiaImage,getSiaAnnos,siaKeyDown, siaKeyUp, selectAnnotation} = actions

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
    }

    componentDidMount(){
        this.props.getSiaAnnos(11)
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
        // Selected annotation should be on top
        this.putSelectedOnTop(prevProps)
    }
    
    onImageLoad(){
        this.initCanvasView()
    }

    onMouseOver(){
        //Prevent scrolling on svg
        document.body.style.overflow = "hidden"
        this.svg.current.focus()
        console.log('Mouse Over Canvas')
    }
    onMouseOut(){
        //Enable scrolling after leaving svg
        document.body.style.overflow = "auto"
    }
    onWheel(e){
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
        if (e.key === 'Delete'){
            this.removeSelectedAnno()
        }
        this.props.siaKeyDown(e.key)
        console.log('KEY down on Canvas', e.key, e.keyCode, e.keyCode, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
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
    // Collect the current data of all annotations and update state
    collectAnnos(){
        console.log('this.annoRefs', this.annoRefs)
        let annos = []  
        this.annoRefs.forEach( ref => {
            if (ref) {
                annos.push(ref.current.getResult())
            }
        })
        console.log('Result annos', annos)
        this.setState({annos: [...annos]})
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

    removeSelectedAnno(){
        const annos = this.state.annos.filter( (el) => {
            return el.id !== this.props.selectedAnno.annoId
        })
        this.setState({annos: annos})
    }

    createNewAnnotation(e){
        const mousePos = this.getMousePosition(e)
        this.setState({
            annos: [...this.state.annos, {
                id: _.uniqueId('new'),
                type: this.props.selectedTool,
                data: [{
                    x: mousePos.x, 
                    y: mousePos.y
                }],
                createMode: true
            }]
        })
    }

    putSelectedOnTop(prevProps){
        // The selected annotation need to be rendered as last one in 
        // oder to be above all other annotations.
        if (this.props.selectedAnno.annoId){
            if (prevProps.selectedAnno.annoId !== this.props.selectedAnno.annoId){
                const annos = this.state.annos.filter( (el) => {
                    return el.id !== this.props.selectedAnno.annoId
                })
                const lastAnno = this.state.annos.find( el => {
                    return el.id === this.props.selectedAnno.annoId
                })
                annos.push(lastAnno)
                this.setState({annos: [
                    ...annos
                ]})
            }
        }
    }

    initCanvasView(){
        var svgBox = this.svg.current.getBoundingClientRect()
        var clientWidth = document.documentElement.clientWidth
        var clientHeight = document.documentElement.clientHeight
        var maxImgWidth = svgBox.right -svgBox.left
        var maxImgHeight = clientHeight - svgBox.top
        var ratio = this.img.current.naturalWidth / this.img.current.naturalHeight
        var imgWidth = "100%"
        var imgHeight = "100%"
        console.log('naturalWidth', this.img.current.naturalWidth)
        console.log('naturalHeight', this.img.current.naturalHeight)
        if (maxImgHeight * ratio > maxImgWidth){
            imgWidth = maxImgWidth
            imgHeight = maxImgWidth / ratio
        } else {
            imgWidth = maxImgHeight * ratio
            imgHeight = maxImgHeight
        }
        console.log('svg', this.svg)
        console.log('img', this.img)
        console.log('imgWidth, imgHeight', imgWidth, imgHeight)
        this.setState({svg: {
            ...this.state.svg, width : imgWidth, height: imgHeight,
            left: svgBox.left, top: svgBox.top
        }})

        var annos = []
        //Annotation data should be present and a pixel accurate value 
        //for svg should be calculated
        if(this.props.annos.drawables){
            console.log(this.props.annos.drawables)
            
            annos = [
                ...this.props.annos.drawables.bBoxes.map((element) => {
                    return {...element, type:'bBox', createMode:false}
                }),
                ...this.props.annos.drawables.lines.map((element) => {
                    return {...element, type:'line', createMode:false}
                }),
                ...this.props.annos.drawables.polygons.map((element) => {
                    return {...element, type:'polygon', createMode:false}
                }),
                ...this.props.annos.drawables.points.map((element) => {
                    return {...element, type:'point', createMode:false}
                })
            ]
       }
       annos = annos.map((el) => {
        return {...el, 
            data:transform.toSia(el.data, {width: imgWidth, height:imgHeight}, el.type)}
        })
       this.setState({annos: annos})
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

            this.annoRefs = []
            const annos =  this.state.annos.map((el) => {
                this.annoRefs.push(React.createRef())
                return <Annotation type={el.type} 
                        data={el} key={el.id} svg={{...this.state.svg}}
                        ref={this.annoRefs[this.annoRefs.length - 1]}
                    />
            })
            return <g>{annos}</g>
            // }

        } else {
            return null
        }
        
    }

    render(){
        return(
            <div>
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
                        onWheel={(e) => {this.onWheel(e)}}
                        onMouseOver={() => {this.onMouseOver()}}
                        onMouseOut={() => {this.onMouseOut()}}
                        onMouseUp={(e) => {this.onMouseUp(e)}}
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
            </div>)
    }
}




function mapStateToProps(state) {
    return ({
        annos: state.sia.annos,
        selectedAnno: state.sia.selectedAnno,
        selectedTool: state.sia.selectedTool
    })
}

export default connect(mapStateToProps, 
    {getSiaAnnos, getSiaImage, siaKeyDown, siaKeyUp, selectAnnotation}
)(Canvas)