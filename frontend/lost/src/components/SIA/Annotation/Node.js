import React, {Component} from 'react'
import './Annotation.scss'
import * as modes from './modes'
import * as cursorstyles from './cursorstyles'


class Node extends Component{

        /*************
         * LIFECYCLE *
        **************/
    constructor(props){
        super(props)
        this.state = {
            haloCss: 'node-halo-off',
            selAreaCss: 'sel-area-off',
            anno: undefined,
            nodeSelected: false,
            style: {}
        }
    }

    componentDidMount(){
        console.log('Node did mount ', this.props.idx, this.props.mode)
        this.setState({
            anno: this.props.anno,
            style: this.props.style
        })
        // switch (this.props.mode){
        //     case modes.CREATE:
        //         if (this.props.idx !== 0){
        //             this.turnSelAreaOn()
        //         }
        //     default:
        //         break
        // }
    }

    componentDidUpdate(prevProps){
        console.log('Node did update', this.props.idx, this.props.mode)
        switch (this.props.mode){
            case modes.CREATE:
                if (this.props.idx !== 0){
                    this.turnSelAreaOn()
                }
                break
            case modes.EDIT:
                this.turnSelAreaOn()
                break
            default:
                break
        }
        //on mode change
        if (prevProps.mode !== this.props.mode){
            this.setStyle(this.props.mode)
        }
    }

    /*************
     * EVENTS    *
    **************/

    onClick(e){
        this.turnHaloOn()
        if (this.props.onClick){
            this.props.onClick(e, this.props.idx)
        }
    }

    onMouseMove(e){
        if (this.props.onMouseMove){
            this.props.onMouseMove(e, this.props.idx)
        }
        // switch (this.props.mode){
        //     case modes.CREATE:
        //         let newAnno = [...this.state.anno]
        //         const mousePos = mouse.getMousePosition(e, this.props.svg)
        //         newAnno[this.props.idx].x = mousePos.x
        //         newAnno[this.props.idx].y = mousePos.y
        //         this.setState({
        //             anno: newAnno
        //         })
        //         if (this.props.onAnnoUpdate){
        //             this.props.onAnnoUpdate(e, this.props.idx, newAnno)
        //         }
        //     default:
        //         break
        // }
    }

    onContextMenu(e: Event){
        e.preventDefault()
    }

    onMouseUp(e: Event){
        switch (this.props.mode){
            case modes.EDIT:
                switch (e.button){
                    case 0:
                        this.turnSelAreaOff()
                        break
                    default:
                        break
                }
            default:
                break
        }
        if (this.props.onMouseUp){
            this.props.onMouseUp(e, this.props.idx)
        }
    }

    onMouseDown(e: Event){
        if (this.props.onMouseDown){
            this.props.onMouseDown(e, this.props.idx)
        }
        switch (this.props.mode){
            case modes.CREATE:
                switch (e.button){
                    case 0:
                        this.turnSelAreaOff()
                        break
                    case 2:
                        this.turnSelAreaOff()
                        break
                    default:
                        break
                }
            // case modes.EDIT:
            //     switch (e.button){
            //         case 0:
            //             this.turnSelAreaOn()
            //             break
            //         default:
            //             break
            //     }

            default:
                break
        }
    }
    
    onMouseOver(e: Event){
        console.log('Mouse over node')
        if (this.props.isSelected){
            this.turnHaloOn()
        }
    }

    onMouseLeave(e){
        if (this.props.isSelected){
            this.turnHaloOff()
        }
    }

    onDoubleClick(e){
        if (this.props.onDoubleClick){
            this.props.onDoubleClick(e, this.props.idx)
        }
    }


    /*************
     * LOGIC     *
    **************/
    setStyle(mode){
        console.log('Set Node style', this.props.idx)
        switch(mode){
            case modes.CREATE:
                this.setState({style: 
                    {...this.state.style, cursor: cursorstyles.CREATE_NODE}
                })
                break
            case modes.EDIT:
                this.setState({style: 
                    {...this.state.style, cursor: cursorstyles.EDIT_NODE}
                })
                break
            case modes.VIEW:
                this.setState({style: 
                    {...this.state.style, cursor:cursorstyles.NORMAL_NODE}
                })
                break
            default:
                break
        }
    }

    turnSelAreaOn(){
        if (this.state.selAreaCss !== 'sel-area-on'){
            this.setState({
                selAreaCss: 'sel-area-on'
            })
        }
    }

    turnSelAreaOff(){
        if (this.state.selAreaCss !== 'sel-area-off'){
            this.setState({
                selAreaCss: 'sel-area-off'
            })
        }
    }

    turnHaloOn(){
        console.log('Turn halo-on ', this.props.idx)
        this.setState({
            haloCss: 'node-halo-on'
        })
    }

    turnHaloOff(){
        console.log('Turn halo-off ', this.props.idx)
        this.setState({
            haloCss: 'node-halo-off'
        })
    }

    /*************
     * RENDERING *
    **************/
   renderHalo(){
       if (this.state.haloCss === 'node-halo-off') return null
       const data = this.props.anno[this.props.idx]

       return <circle cx={data.x} cy={data.y} r={20}
                className={this.state.haloCss}
                 onMouseLeave={e => this.onMouseLeave(e)}
   />
   }
    renderNodes(){
        const data = this.props.anno[this.props.idx]

        return (
            <g
                onClick={(e) => this.onClick(e)}
                onMouseMove={e => this.onMouseMove(e)}
                onContextMenu={e => this.onContextMenu(e)}
                onMouseUp={e => this.onMouseUp(e)}
                onMouseDown={e => this.onMouseDown(e)}
                onDoubleClick={e => this.onDoubleClick(e)}
            >
                <circle cx={data.x} cy={data.y} r={'100%'}
                    className={this.state.selAreaCss}
                />
                {this.renderHalo()}
                <circle cx={data.x} 
                    cy={data.y} 
                    r={5} fill="red"
                    style={this.state.style}
                    className={this.props.className}
                    onMouseOver={e => this.onMouseOver(e)}
                />
            </g>
        )
    }
    render(){
            return(
                <g>
                    {this.renderNodes()}
                </g>
                )
    }
}

export default Node;