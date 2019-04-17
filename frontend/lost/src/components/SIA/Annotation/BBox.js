import React, {Component} from 'react'
import Polygon from './Polygon'
import './Annotation.scss';

class BBox extends Polygon{

    onNodeMouseMove(e, idx){
        switch (this.state.mode){
            case 'create':
                let newAnno = [...this.state.anno]
                newAnno[1].x += e.movementX
                newAnno[2].x += e.movementX
                newAnno[2].y += e.movementY
                newAnno[3].y += e.movementY 
                this.setState({
                    anno: newAnno
                })
            default:
                break
        }
    }

    onNodeMouseUp(e, idx){
        if (this.state.mode){
            this.setState({mode: 'show'})
        }
    }
    componentDidMount(){
        console.log('Component mounted', this.props.data.id)
        if (this.props.data.createMode){
            console.log('in Create Pos')
            this.setState({
                mode:'create',
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

}

export default BBox;