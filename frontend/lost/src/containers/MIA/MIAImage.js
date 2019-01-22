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
                is_active: true,
                data: ''
            }
        }
    } 
    componentDidMount(){
        const image = this.props.getMiaImage(this.props.image.path)
        image.then(response=>
        this.setState({image: {data:window.URL.createObjectURL(response)}})
        )
    }

    handleClick(){

        this.setState({image:{is_active: !this.state.image.is_active}})
        this.props.callback(this.state.image)
    }

    render(){
        return(<div><img src={this.state.image.data} /></div>)
    }

}

export default connect(null, {getMiaImage})(MIAImage)