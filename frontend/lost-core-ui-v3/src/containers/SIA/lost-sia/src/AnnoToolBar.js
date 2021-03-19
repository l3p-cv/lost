import React, {Component} from 'react'

import * as transform from './utils/transform'

class AnnoToolBar extends Component{

    constructor(props){
        super(props)
        this.state = {
            top: 400,
            left: 100,
            width: 50,
            label: undefined,
            visibility: 'hidden',
            possibleLabels: []
        }
        this.inputGroupRef = React.createRef()
    }

    componentWillMount(){
        this.setPosition()
    }
    
    componentDidUpdate(prevProps){
        if (this.props.visible){
            this.setPosition()
        } 

        
    }

    /*************
     * LOGIC     *
     *************/
    setPosition(){
        if (this.props.selectedAnno){
            // const center = transform.getCenter(this.props.selectedAnno.data, this.props.selectedAnno.type)
            // const annoBox = transform.getBox(this.props.selectedAnno.data, this.props.selectedAnno.type)
            let topPoint = transform.getTopPoint(this.props.selectedAnno.data)
            topPoint = transform.getMostLeftPoint(topPoint)[0]
            const inputRect = this.inputGroupRef.current.getBoundingClientRect()
            let top = this.props.svg.top + (topPoint.y + this.props.svg.translateY) *this.props.svg.scale - 44
            let left = this.props.svg.left + (topPoint.x + this.props.svg.translateX) *this.props.svg.scale - inputRect.width /2.0 - 1
            // if (left < this.props.svg.left) left = this.props.svg.left
            // if (left+inputRect.width > this.props.svg.left+this.props.svg.width){
            //     left = this.props.svg.left+this.props.svg.width - inputRect.width
            // }
            if (top < 0) top = this.props.svg.top + (topPoint.y + this.props.svg.translateY + 10) *this.props.svg.scale 
            if (this.state.top !== top || this.state.left !== left){  
                this.setState({
                    top,
                    left,
                    // width: annoBox[1].x - annoBox[0].x
                })
            }
        }
    }

    onClose(){
        if (this.props.onClose){
            this.props.onClose()
        }
    }

    handleClick(e){
        if (this.props.onClick){
            this.props.onClick(e)
        }
    }
    
    renderDaviIcon(){
        return <svg version="1.1" xmlns="http://www.w3.org/2000/svg" 
                // x="0px" y="0px"
                // width="1190.549px" height="841.891px" 
                viewBox="0 0 1190.549 841.891" 
                width="60px"
                onClick={e => this.handleClick(e)}
            >
            <g id="Info">
                <path id="Maps" fill={this.props.color} d="M620.561,817.217c-1.568-3.62-3.771-7.101-4.611-10.885
                    c-24.452-109.811-74.341-207.569-139.215-298.675c-27.507-38.628-55.814-77.404-77.438-119.371
                    C324.363,242.85,402.696,58.71,574.209,26.508c145.509-27.32,282.953,75.871,296.543,222.773
                    c4.659,50.356-7.471,97.96-32.152,141.022c-27.812,48.526-58.75,95.364-90.073,141.758
                    c-50.917,75.411-91.062,155.558-113.421,244.091c-2.438,9.652-3.936,19.543-6.271,29.227c-0.992,4.104-3.023,7.961-4.584,11.93
                    C623.021,817.277,621.789,817.247,620.561,817.217z"/>
                <path id="Text" fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" d="M724.709,250.898
                    c-0.055-3.974,0.047-7.949,0.033-11.923c-0.007-1.228-1.54-2.767-2.76-2.777c-2.428-0.021-4.862-0.015-7.29-0.015
                    c-22.466,0.001-44.934,0.005-67.404,0.009c-2.475,0.001-3.658,1.154-3.658,3.588c-0.001,47.365-0.001,94.73-0.001,142.096
                    c0,13.526,0,27.05,0.001,40.577c0,2.305,1.274,3.584,3.562,3.59c6.623,0.004,9.256-0.07,19.873,0.004
                    c10.618,0.072,14.146,8.543,14.146,14.189c-0.002,5.645-4.233,13.055-14.299,13.367c-13.135,0.061-26.277-0.02-39.414-0.014
                    c-14.575,0.004-29.146,0.004-43.722,0.02c-4.191-0.084-13.717-2.789-13.717-13.492s6.233-13.643,13.132-14.117
                    c4.979,0.037,13.802,0.057,20.701,0.049c1.695,0,3.11-1.537,3.11-3.361c0.003-13.912-0.004-27.823-0.004-41.736
                    c0-30.252,0-60.503,0.002-90.754c0.002-17.03,0.005-33.649,0.002-50.678c0-1.991-1.38-3.336-3.396-3.336
                    c-24.79,0-49.577,0-74.362,0c-2.133,0-3.38,1.22-3.383,3.308c-0.006,3.754-0.011,7.509,0.005,11.262
                    c-0.023,6.339-3.067,13.143-12.456,13.143c-9.389,0-14.337-4.647-14.915-13.23c-0.128-4.305,0.004-8.612,0.004-12.918
                    c0-8.392,0-16.781,0-25.173c0-0.321,0.228-5.156,4.091-9.277c3.864-4.122,8.014-3.822,8.445-3.822
                    c25.835,0.003,51.672,0.002,77.507,0.002c46.813,0.001,140.443,0.001,140.443,0.001s6.153-0.088,10.926-0.052
                    c0.3-0.008,5.713,0.363,9.178,3.994c3.46,3.631,3.046,8.407,3.046,8.635c-0.007,12.862,0.079,25.725-0.003,38.587
                    c-0.074,8.051-6.938,12.819-13.703,12.847C731.482,263.519,724.956,259.059,724.709,250.898z"/>
            </g>
        </svg>
    }

    /*************
     * RENDERING *
    **************/
    render(){
        if (!this.props.visible) return null
        return (
            <div ref={this.inputGroupRef} 
                style={{
                    position:'fixed', 
                    top:this.state.top, 
                    left:this.state.left,
                    cursor: 'pointer',
                }}
            >
            {/* <Button icon circular basic
                onClick={e => this.handleClick(e)}
            > */}
                {/* <Icon name="pencil"
                    onClick={e => this.handleClick(e)}
                /> */}
            {/* </Button> */}
            {this.renderDaviIcon()}
            </div>
        )
    }
    
}

export default AnnoToolBar