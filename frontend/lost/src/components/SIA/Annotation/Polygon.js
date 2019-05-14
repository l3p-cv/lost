import React, {Component} from 'react'

import ENodeE from './ENodeE'
import Edge from './Edge'

import * as transform from '../utils/transform'

import './Annotation.scss'
import * as modes from './modes'
import * as mouse from '../utils/mouse'


class Polygon extends Component{

    constructor(props){
        super(props)
        this.state = {
            anno: undefined,
            mode: modes.VIEW
        }
    }

    componentDidMount(){
        if (this.props.data.createMode){
            console.log('in Create Pos')
            this.setState({
                mode: modes.CREATE,
                anno: [
                    {x: this.props.data.data.x, y: this.props.data.data.y},
                    {x: this.props.data.data.x+1, y: this.props.data.data.y}
                ]
            })
        } else {
            this.setState({anno: [...this.props.data.data]})
        }
    }

    componentDidUpdate(prevProps){
        console.log('Update polygon')
        if (prevProps.mode !== this.props.mode){
            this.setMode(this.props.mode)
        }
    }

    //Callback for on NodeClick event
    onNodeClick(e, idx){
        if (this.props.onNodeClick){
            this.props.onNodeClick(e, idx)
        }
        
    }

    onNodeMouseUp(e, idx){
        console.log('NodeMouseUP ', idx, e.movementX, e.movementY )        
    }

    onNodeFinalAnnoUpdate(e, idx, anno){
        console.log('onNodeFinalAnnoUpdate', idx, anno)
        if (e.button == 2){
            switch (this.state.mode){
                case 'create':
                    console.log('onNodeFinalAnnoUpdate create')
                    let newAnno = [...anno]
                    newAnno.push({
                        x: newAnno[idx].x,
                        y: newAnno[idx].y
                    })
                    this.setState({
                        anno: newAnno
                    })
                default:
                    break
            }    
        }   
        
    }

    onMouseUp(e){
        switch (e.button){
            case 0: // on Leftclick
                this.setState({mode:modes.VIEW})
            default:
                break
        }
    }
    onNodeDoubleClick(e, idx){
        switch (this.state.mode){
            case modes.CREATE:
                this.setMode(modes.VIEW)
                // this.setState({
                //     mode: modes.VIEW
                // })
            default:
                break
        }
    }
    
    onEdgeMouseDown(e, idx){
        console.log('Edge mouse down', idx)
        switch (this.state.mode){
            case modes.ADD:
                this.addNode(e, idx)
                break
            default:
                break
        }
    }

    toPolygonStr(data){
        return data.map( (e => {
            return `${e.x},${e.y}`
        })).join(' ')
        
    }

    setMode(mode){
        if (this.state.mode !== mode){
            this.setState({mode: mode})
        }
    }

    move(movementX, movementY){
        // console.log('Polygon mode ', this.state.mode)
        // if (this.state.mode !== modes.MOVE){
        //     console.log('Polygon changed state to move!')
        //     this.setState({mode: modes.MOVE})
        // }
        this.setState({
            anno : transform.move(this.state.anno, movementX, movementY)
        })
    }

    addNode(e, idx){
        console.log('Add Node to Polygon', idx)
        const mPos = mouse.getMousePosition(e, this.props.svg)
        let newAnno = this.state.anno.slice(0,idx)
        newAnno.push(mPos)
        const oldRest = this.state.anno.slice(idx)
        this.setState({anno: newAnno.concat(oldRest)})
    }

    getResult(){
        return this.state.anno
    }

    renderNodes(){
        if (!this.props.isSelected) return null
        if (this.state.mode === modes.MOVE){
            return null
        }
        if (this.state.mode === modes.CREATE){
            console.log('Render create nodes')
            return [<ENodeE anno={this.state.anno} idx={0}
                key={0} 
                style={this.props.style}
                className={this.props.className} 
                isSelected={this.props.isSelected}
                mode={this.state.mode}
                draw={{
                    connectedEdge: false, node: true, closingEdge: false
                }}
                onModeChange={(idx, newMode) => this.onENEModeChange(idx, newMode)}
                svg={this.props.svg}
                />, <ENodeE anno={this.state.anno} idx={this.state.anno.length-1} 
                key={this.state.anno.length-1} 
                style={this.props.style}
                className={this.props.className} 
                onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                onNodeMouseUp={(e,idx) => this.onNodeMouseUp(e, idx)}
                onNodeFinalAnnoUpdate={(e,idx, newAnno) => this.onNodeFinalAnnoUpdate(e, idx, newAnno)}
                onNodeDoubleClick={(e, idx) => this.onNodeDoubleClick(e, idx)}
                isSelected={this.props.isSelected}
                mode={this.state.mode}
                draw={{
                    connectedEdge: true, node: true, closingEdge: true
                }}
                svg={this.props.svg}
                />
            ]
        }
        // if (this.state.show !== 'all'){
        //     return <ENodeE anno={this.state.anno} idx={this.state.show} 
        //         style={this.props.style}
        //         className={this.props.className} 
        //         onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
        //         onNodeMouseUp={(e,idx) => this.onNodeMouseUp(e, idx)}
        //         onNodeFinalAnnoUpdate={(e,idx, myAnno) => this.onNodeFinalAnnoUpdate(e, idx, myAnno)}
        //         onNodeDoubleClick={(e, idx) => this.onNodeDoubleClick(e, idx)}
        //         onModeChange={(idx, newMode) => this.onENEModeChange(idx, newMode)}
        //         isSelected={this.props.isSelected}
        //         mode={this.state.mode}
        //         draw={{
        //             connectedEdge: true, node: true, closingEdge: true
        //         }}
        //         svg={this.props.svg}
        //         />
        // }

        return this.state.anno.map((e, idx) => {
            return <ENodeE anno={this.state.anno} idx={idx} 
                key={idx} style={this.props.style}
                className={this.props.className} 
                onNodeClick={(e, idx) => this.onNodeClick(e, idx)}
                onNodeMouseUp={(e,idx) => this.onNodeMouseUp(e, idx)}
                onNodeFinalAnnoUpdate={(e,idx, myAnno) => this.onNodeFinalAnnoUpdate(e, idx, myAnno)}
                onNodeDoubleClick={(e, idx) => this.onNodeDoubleClick(e, idx)}
                isSelected={this.props.isSelected}
                mode={this.state.mode}
                draw={{
                    connectedEdge: true, node: true, closingEdge: true
                }}
                svg={this.props.svg}
                />
        })
    }

    renderEdges(){
        if (!this.props.isSelected) return null
        if (this.state.mode === modes.MOVE){
            return null
        }
        let edges = this.state.anno.map((e, idx) => {
            return <Edge anno={this.state.anno} 
                idx={idx} key={idx} style={this.props.style}
                className={this.props.className}
                isSelected={this.props.isSelected}
                onMouseDown={(e, idx) => {this.onEdgeMouseDown(e, idx)}}                
                />
        })
        edges.push(<Edge anno={this.state.anno} 
            closingEdge={true} key={edges.length}
            idx={0}
            style={this.props.style}
            className={this.props.className}
            isSelected={this.props.isSelected}
            onMouseDown={(e, idx) => {this.onEdgeMouseDown(e, idx)}}  
            />)
        return edges
    }
    render(){
        if (this.state.anno){
            if (this.state.mode === modes.CREATE){
                return (
                    <g
                        onKeyPress={e => this.onKeyPress(e)}
                        // onMouseUp={e => this.onMouseUp(e)}
                    >
                        <polyline points={this.toPolygonStr(this.state.anno)}
                        fill='none' stroke="purple" 
                        style={this.props.style}
                        className={this.props.className}
                        />
                        {this.renderNodes()}
                    </g>
                )
            } 
            return(
                <g 
                    onKeyPress={e => this.onKeyPress(e)}
                    onMouseUp={e => this.onMouseUp(e)}
                >
                    <polygon points={this.toPolygonStr(this.state.anno)}
                        fill="purple" fillOpacity="0.5" stroke="purple" 
                        style={this.props.style}
                        className={this.props.className}/>
                    {this.renderEdges()}
                    {this.renderNodes()}
                </g>
                )
        } else {
            return <g></g>
        }
    }
}

export default Polygon;