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
        this.props.getSiaAnnos(-1)
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

    render(){
        return(<div>
                  <img src={this.state.image.data} width='100%'/>
                  <svg>
                    <circle cx={50} cy={50} r={10} fill="red" />
                </svg>
                
            </div>)
    }
}




function mapStateToProps(state) {
    return ({annos: state.sia.annos})
}

export default connect(mapStateToProps, {getSiaAnnos, getSiaImage})(Canvas)