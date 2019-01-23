import React, {Component} from 'react'
import {connect} from 'react-redux'
import MIAImage from './MIAImage'
import actions from '../../actions'

import './Cluster.scss';

const {getMiaAnnos,getMiaImage, getWorkingOnAnnoTask} = actions

class Cluster extends Component{
    constructor(props){
        super(props)

    }
    componentDidMount(){
        this.props.getMiaAnnos(this.props.maxAmount)
    }
    componentWillReceiveProps(props){
        if(props.images.length === 0){
            this.props.getMiaAnnos(this.props.maxAmount)
            this.props.getWorkingOnAnnoTask()
        }
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
            return(
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <div>
                        <i className="fa fa-image fa-spin fa-4x"></i>
                    </div>
                </div>
            )
        }
    }
}

function mapStateToProps(state){
    return({images: state.mia.images, maxAmount: state.mia.maxAmount, zoom: state.mia.zoom})
}
export default connect(mapStateToProps, {getMiaAnnos, getMiaImage, getWorkingOnAnnoTask})(Cluster)
