import React, {Component} from 'react'
import {connect} from 'react-redux'
import MIAImage from './MIAImage'
import actions from '../../actions'

import './Cluster.scss';

const {getMiaAnnos,getMiaImage} = actions

class Cluster extends Component{
    constructor(props){
        super(props)

    }
    componentWillMount(){
        this.props.getMiaAnnos(this.props.maxAmount)
    }
    render(){
        if(this.props.images.length > 0){
           return(
           <div className='mia-images'>
               {this.props.images.map((image) => {
                    return (
                        <MIAImage image={image} key={image.id} height={this.props.zoom}></MIAImage>
                    )
                })}
           </div>)
        }else{
            return(<div>No more Images ...</div>)
        }
    }
}

function mapStateToProps(state){
    return({images: state.mia.images, maxAmount: state.mia.maxAmount, zoom: state.mia.zoom})
}
export default connect(mapStateToProps, {getMiaAnnos, getMiaImage})(Cluster)

