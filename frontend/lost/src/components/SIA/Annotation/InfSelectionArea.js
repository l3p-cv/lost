import React, {Component} from 'react'

class InfSelectionArea extends Component{

    constructor(props){
        super(props)
        this.state = {
            selAreaCss: 'sel-area-off',
        }        
    }

    componentDidMount(){
        if (this.props.enable){
            this.enableSelArea()
        } else {
            this.disableSelArea()
        }
    }

    componentDidUpdate(){
        if (this.props.enable){
            this.enableSelArea()
        } else {
            this.disableSelArea()
        }
    }

    onMouseMove(e){
        if (this.props.onMouseMove){
            this.props.onMouseMove(e)
        }
    }

    onMouseUp(e){
        if (this.props.onMouseUp){
            this.props.onMouseUp(e)
        }
    }

    enableSelArea(){
        if (this.state.selAreaCss !== 'sel-area-on'){
            this.setState({selAreaCss: 'sel-area-on'})
        }
    }

    disableSelArea(){
        if (this.state.selAreaCss !== 'sel-area-off'){
            this.setState({selAreaCss: 'sel-area-off'})
        }
    }


    /*************
     * RENDERING *
    **************/
    render(){
        return(
            <circle 
                cx={this.props.svg.width/2} 
                cy={this.props.svg.height/2} 
                r={'100%'}
                className={this.state.selAreaCss}
                onMouseMove={e => {this.onMouseMove(e)}}
                onMouseUp={e => {this.onMouseUp(e)}}
            />
        )
        
    }
}

export default InfSelectionArea