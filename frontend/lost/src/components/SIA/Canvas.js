import React, {Component} from 'react'
import {connect} from 'react-redux'



import actions from '../../actions'
import './Canvas.scss';

const { getSiaImage,getSiaAnnos } = actions

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
            svgTransfrom:''
        }
        this.img = React.createRef()
        this.svg = React.createRef()
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
    }

    componentDidMount(){
        this.props.getSiaAnnos(11)
    }

    componentDidUpdate(){
        console.log('didupdate')
		if(this.props.annos.image){
            if(this.props.annos.image.id !== this.state.image.id){
			this.props.getSiaImage(this.props.annos.image.url).then(response=>
			{
                this.setState({image: {...this.state.image, id: this.props.annos.image.id, data:window.URL.createObjectURL(response)}})
            }
            )       

        }
        }
        // console.log('img', this.img)
        // console.log('img width', this.img.current.width.baseVal.value)
        // console.log('img height', this.img.current.height.baseVal.value)
        // console.log('img getBBox', this.img.current.getBBox())
        // console.log('img x, y', this.img.current.x.baseVal.value, this.img.current.y.baseVal.value)
        // console.log('img.boundingClientRect', this.img.current.getBoundingClientRect())
        // console.log('screen width, height', document.documentElement.clientWidth, document.documentElement.clientHeight) 


	}

    renderDrawables(){
        if(this.props.annos.drawables){
            console.log(this.props.annos.drawables)
        //     this.props.annos.drawables.bboxes.map((drawable) => {
        //     console.log(drawable)
        //   })
       }
       return(
            <g>
            <rect x="500" y="0" width="100" height="100" />
            <circle onClick={(e)=>{console.log("JUUUHUUUUU",e.pageX, e.pageY)}}cx={520} cy={50} r={10} fill="red" />
            <polygon points="100,100 150,25 150,75 200,0"
            fill="none" stroke="red" />
            <line x1="0" y1="0" x2="200" y2="200" stroke='red'/>
            </g>
       )
    }
    render(){
        return(
                <div>
                  <svg ref={this.svg} width={this.state.svg.width} height={this.state.svg.height}>
                    <g transform={this.state.svgTransform}>
                    <image 
                        
                        onClick={(e) => {
                            this.setState({svgTransform: "translate(-200) scale(2)"})
                            console.log(this.state)
                        }}
                        onDoubleClick={(e) => {
                            this.setState({svgTransform: ""})
                            console.log(this.state)
                        }}
                        href={this.state.image.data} 
                        width={this.state.svg.width} 
                        height={this.state.svg.height}
                         />
                    {this.renderDrawables()}
                    </g>
                </svg>
                <img style={{display:'none'}} ref={this.img} onLoad={() => {this.initCanvasView()}} src={this.state.image.data} width="100%" height="100%"></img>
            </div>)
    }
}




function mapStateToProps(state) {
    return ({annos: state.sia.annos})
}

export default connect(mapStateToProps, {getSiaAnnos, getSiaImage})(Canvas)