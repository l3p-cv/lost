import React, {Component} from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'
import Annotation from './Annotation/Annotation'

import actions from '../../actions'

import * as transform from './utils/transform'


const { getSiaImage,getSiaAnnos} = actions

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
            },
            canvas: {
                scale:1.0,
                translateX:0,
                translateY:0
            },
            annos: []
        }
        this.img = React.createRef()
        this.svg = React.createRef()
    }
    onImageLoad(){
        this.initCanvasView()
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
        this.setState({svg: {width : imgWidth, height: imgHeight}})

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

    componentDidMount(){
        this.props.getSiaAnnos(11)
        console.log('uniqueID',_.uniqueId('anno'))
    }

    getMousePosition(e){
        return {
            x: e.pageX - this.svg.current.getBoundingClientRect().left,
            y: e.pageY - this.svg.current.getBoundingClientRect().top
        }
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
    
    onMouseOver(){
        //Prevent scrolling on canvas
        document.body.style.overflow = "hidden"
    }
    onMouseOut(){
        //Enable scrolling after leaving canvas
        document.body.style.overflow = "auto"
    }
    onWheel(e){
        const up = e.deltaY < 0
        const mousePos = this.getMousePosition(e)
        const zoomFactor=1.25
        if (up) {
            this.setState({canvas: {
                ...this.state.canvas,
                scale: this.state.canvas.scale * zoomFactor,
                translateX: -1*(mousePos.x * this.state.canvas.scale*zoomFactor - mousePos.x*this.state.canvas.scale),
                translateY: -1*(mousePos.y * this.state.canvas.scale*zoomFactor - mousePos.y*this.state.canvas.scale )
            }})
        } else {
            this.setState({canvas: {
                ...this.state.canvas,
                scale: this.state.canvas.scale / zoomFactor
            }})
        }
    }

    onRightClick(e){
        e.preventDefault()
    }

    onMouseDown(e){
        if (e.button === 1){
            this.setState({canvas:{scale: 1.0, translateX: 0, translateY: 0}})
        }
        else if (e.button === 2){
            // this.setState({createAnnoPos: this.getMousePosition(e)})
            const mousePos = this.getMousePosition(e)
            this.setState({
                annos: [...this.state.annos, {
                    id: _.uniqueId('new'),
                    type: 'bBox',
                    data: {x: mousePos.x, y: mousePos.y},
                    createMode: true
                }]
            })
        }
    }

    onMouseUp(e){
        if (e.button === 2){
            console.log('Mouse up on right click')
        }
    }
    
    putSelectedOnTop(prevProps){
        // The selected annotation need to be rendered as last one in 
        // oder to be above all other annotations.
        if (this.props.selectedAnno){
            console.log('state ', this.state.annos)
            if (prevProps.selectedAnno !== this.props.selectedAnno){
                const annos = this.state.annos.filter( (el) => {
                    return el.id !== this.props.selectedAnno
                })
                const lastAnno = this.state.annos.find( el => {
                    return el.id === this.props.selectedAnno
                })
                annos.push(lastAnno)
                this.setState({annos: [
                    ...annos
                ]})
            }
        }
    }

    renderAnnotations(){
        const annos =  this.state.annos.map((el) => {
            return <Annotation type={el.type} 
                    data={el} key={el.id}
                />
        })
        console.log('renderAnnotations',annos)
        return <g>{annos}</g>
        
    }

    render(){
        return(
            <div >
                <svg ref={this.svg} width={this.state.svg.width} 
                    height={this.state.svg.height}>
                    <g 
                        transform={`scale(${this.state.canvas.scale}) translate(${this.state.canvas.translateX}, ${this.state.canvas.translateY})`}
                        onWheel={(e) => {this.onWheel(e)}}
                        onMouseOver={() => {this.onMouseOver()}}
                        onMouseOut={() => {this.onMouseOut()}}
                        onMouseUp={(e) => {this.onMouseUp(e)}}
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
        selectedAnno: state.sia.selectedAnno
    })
}

export default connect(mapStateToProps, {getSiaAnnos, getSiaImage})(Canvas)