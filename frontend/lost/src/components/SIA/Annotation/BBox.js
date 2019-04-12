import React, {Component} from 'react'



class BBox extends Component{

    constructor(props){
        super(props)
        this.state = {
            anno: undefined,
            createMode: false
        }
    }
    componentDidMount(){
        this.setState({anno: {...this.props.data}})
        if (this.props.data.createNew){
            console.log('in Create Pos')
            this.setState({
                createMode:true,
                anno: {
                    x: this.props.createPos.x,
                    y: this.props.createPos.y,
                    w: 4,
                    h: 4
                }
            })
        }
    }

    
    move(movementX, movementY){
        this.setState({
            anno : {
                ...this.state.anno, 
                x: this.state.anno.x + movementX,
                y: this.state.anno.y + movementY
            }
        })
    }

    onContextMenu(e: Event){
        e.preventDefault()
    }

    onMouseMove(e: Event){
        if (this.state.createMode){
            console.log('Bbox is moving')

            this.setState({
                anno: {
                    ...this.state.anno,
                    w: this.state.anno.w + e.movementX,
                    h: this.state.anno.h + e.movementY
                }
            })
        }
    }
    render(){
        if (this.state.anno){
            return(
                <rect x={this.state.anno.x} y={this.state.anno.y} 
                    width={this.state.anno.w} height={this.state.anno.h} 
                    fill="purple" fillOpacity="0.5"
                    onMouseMove={e => {this.onMouseMove(e)}}
                    onContextMenu={(e) => this.onContextMenu(e)}
                    
                />
                )
        }
        return <g></g>
    }
}

export default BBox;