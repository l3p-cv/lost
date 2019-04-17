import React, {Component} from 'react'
import Polygon from './Polygon'
import './Annotation.scss';

class BBox extends Polygon{

    // constructor(props){
    //     super(props)
    //     this.state = {
    //         anno: undefined,
    //         createMode: false
    //     }
    //     this.myAnno = React.createRef()
    // }

    onNodeMouseMove(e, idx){
        if (this.state.createMode){
            let newAnno = [...this.state.anno]
            newAnno[1].x += e.movementX
            newAnno[2].x += e.movementX
            newAnno[2].y += e.movementY
            newAnno[3].y += e.movementY 
            this.setState({
                anno: newAnno
            })
        }
    }

    onNodeMouseUp(e, idx){
        if (this.state.createMode){
            this.setState({createMode: false})
        }
    }
    componentDidMount(){
        console.log('Component mounted', this.props.data.id)
        if (this.props.data.createMode){
            console.log('in Create Pos')
            this.setState({
                createMode:true,
                anno: [
                    {x: this.props.data.data.x, y: this.props.data.data.y},
                    {x: this.props.data.data.x+1, y: this.props.data.data.y},
                    {x: this.props.data.data.x+1, y: this.props.data.data.y+1},
                    {x: this.props.data.data.x, y: this.props.data.data.y+1}
                ]
            })
        } else {
            this.setState({anno: [...this.props.data.data]})
        }
    }

    
    // move(movementX, movementY){
    //     this.myAnno.current.move(movementX, movementY)
    // }

    // onContextMenu(e: Event){
    //     e.preventDefault()
    // }

    // onMouseMove(e: Event){
    //     if (this.state.createMode){
    //         console.log('Bbox is moving')
    //         this.setState({
    //             anno: this.state.anno.map( e => {
    //                 return {
    //                     x: e.x + e.movementX,
    //                     y: e.y + e.movementY
    //                 }
    //             })
    //         })
    //     }
    // }
    // onMouseUp(e){
    //     if (e.button === 2){
    //         this.setState({createMode: false})
    //     }
    // }

    // onNodeClick(e, idx){
    //     if (this.props.onNodeClick){
    //         this.props.onNodeClick(e, idx)
    //     }
    // }
    
    // render(){
    //     if (this.state.anno){
    //         return(

    //             <g
    //                 onMouseMove={e => {this.onMouseMove(e)}}
    //                 onContextMenu={(e) => this.onContextMenu(e)}
    //                 onMouseUp={e => this.onMouseUp(e)}
    //             >
    //                 <Polygon ref={this.myAnno} data={this.props.data} 
    //                     style={this.props.style}
    //                     className={this.props.className}
    //                     onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
    //                 />
    //             </g>
    //             )
    //     }
    //     return <g></g>
    // }
}

export default BBox;