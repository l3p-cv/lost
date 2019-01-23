import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'


const {getMiaImage} = actions


class MIAImage extends Component{
    constructor(props){
        super(props)
        this.state = {
            image: {
                id: this.props.image.id,
                data: '',
            },
            is_active: true,
            clicks: 0,
            timer: undefined
        }
        this.imageClick = this
        .imageClick
        .bind(this)
        this.imageDoubleClick = this
        .imageDoubleClick
        .bind(this)
    } 
    componentDidMount(){
        const image = this.props.getMiaImage(this.props.image.path)
        image.then(response=>
        this.setState({image: {...this.state.image, data:window.URL.createObjectURL(response)}})
        )
    }

    
  imageClick = () => {
    let newClicks = this.state.clicks + 1
    let timer = undefined
    this.setState({clicks: newClicks})
    if (newClicks == 1){
        this.setState({timer:setTimeout(() => {
            // reset.
            this.setState({clicks: 0})
            console.log("Click")
            if (this.state.is_active) {
                this.setState({is_active: false})
               
            } else {
                this.setState({is_active: true})
            }
        }, 250)})

    }
    else{
        clearTimeout(this.state.timer)
        this.setState({clicks: 0})
        console.log("dblClick")
    }
    
  }   
  imageDoubleClick = () => {
    console.log("sdfdsfdsf")
  }  
    // imageClick(){
    //     console.log(this.state.image.id)
    //     this.setState({image:{is_active: !this.state.image.is_active}})
    //     //this.props.callback(this.state.image)
    // }

    render(){
        return(<img onClick={this.imageClick}  src={this.state.image.data} className='mia-image' height={this.props.height}/>)
    }

}

export default connect(null, {getMiaImage})(MIAImage)