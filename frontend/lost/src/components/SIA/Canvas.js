import React, {Component} from 'react'
import {connect} from 'react-redux'



import actions from '../../actions'

const { getSiaImage,getSiaAnnos } = actions

class Canvas extends Component{

    constructor(props){
        super(props)
        this.state = {
            image: {
                id: undefined,
                data: undefined,
            }
        }
    }
    componentDidMount(){
        this.props.getSiaAnnos(46)
    }

    componentDidUpdate(){
        console.log('didupdate')
		if(this.props.annos.image){
            if(this.props.annos.image.id !== this.state.image.id){
			this.props.getSiaImage(this.props.annos.image.url).then(response=>
			{
			    this.setState({image: {...this.state.image, id: this.props.annos.image.id, data:window.URL.createObjectURL(response)}})}
			)
        }
        }
	}

    renderDrawables(){
        if(this.props.annos.drawables){
            this.props.annos.drawables.polygons.map((drawable) => {
            console.log(drawable)
          }
       )}
       return(
            <g>
            <rect x="500" y="0" width="100" height="100" />
            <circle onClick={(e)=>{console.log("JUUUHUUUUU",e.pageX)}}cx={520} cy={50} r={10} fill="red" />
            <polygon points="100,100 150,25 150,75 200,0"
            fill="none" stroke="red" />
            </g>
       )
    }
    render(){
        return(
                <div>
                  <svg width="100%" height='20cm'>
                    <image href={this.state.image.data} width='70%'/>
                    {this.renderDrawables()}
                </svg>
            </div>)
    }
}




function mapStateToProps(state) {
    return ({annos: state.sia.annos})
}

export default connect(mapStateToProps, {getSiaAnnos, getSiaImage})(Canvas)