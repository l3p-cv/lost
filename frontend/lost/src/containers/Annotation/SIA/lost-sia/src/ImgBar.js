import React, {Component} from 'react'
import { Menu } from 'semantic-ui-react'

class ImgBar extends Component{

    constructor(props) {
        super(props)
        this.state = {
            position: {
                top: 0,
                left: 0,
            },
        }
    }

    componentDidMount(){
        
    }
    componentDidUpdate(prevProps){

        if (this.props.svg !== prevProps.svg){
            this.setState({
                position: {...this.state.position,
                left: this.props.svg.left,
                top: this.props.svg.top,
                }
            })
        }
    }

    /*********
     * Events
     *********/
    handleLabelUpdate(label){
        if (this.props.onLabelUpdate){
            this.props.onLabelUpdate(label)
        }
    }
    
    handleClose(){
        if (this.props.onClose){
            this.props.onClose()
        }
    }

    handleMouseEnter(e){
        if (this.props.onMouseEnter){
            this.props.onMouseEnter(e)
        }
    }

    // renderImgLabelInput(){
    //     if (this.props.allowedActions.label){
    //         return <Menu.Item style={{padding: "5px"}}>
    //             <LabelInput
    //                 // multilabels={true}
    //                 multilabels={this.props.multilabels}
    //                 relatedId={this.props.annos.image.id}
    //                 visible={this.props.visible}
    //                 onLabelUpdate={label => this.handleLabelUpdate(label)}
    //                 possibleLabels={this.props.possibleLabels}
    //                 initLabelIds={this.props.imgLabelIds}
    //                 relatedId={this.props.annos.image.id}
    //                 disabled={!this.props.allowedActions.label}
    //                 />
    //         </Menu.Item>
    //     } else {
    //         return null
    //     }
    // }

    renderImgLabels(){
        let label = ''
        if (this.props.imgLabelIds && this.props.imgLabelIds.length > 0){
            let labelObject 
            this.props.imgLabelIds.forEach((lbl, idx) => {
                labelObject = this.props.possibleLabels.find(el => {
                    return el.id === lbl
                })
                if (idx > 0) label += ', '
                label += labelObject.label
            })
            return <Menu.Item >
                    {label}
                </Menu.Item>
        } else {
            return null
        }
    }

    renderImgDescription(){
        if(this.props.imageMeta.description){
           return <Menu.Item>
               {this.props.imageMeta.description}
            </Menu.Item>
        } else {
            return null
        }
    }
    render(){
        if (!this.props.visible) return null
        if (!this.props.imageMeta) return null
        // if (!this.props.annos.image.url) return null
        return(
        <div style={{
            position:'fixed', 
            top: this.state.position.top, 
            left:this.state.position.left,
            width: this.props.svg.width,
            minWidth: '300px'
            }}
            onMouseEnter={e => {this.handleMouseEnter(e)}}    
        >
            <Menu inverted style={{opacity:0.9, justifyContent:'center', alignItems:'center'}}>
                    {/* {this.renderImgLabelInput()} */}
                    {this.renderImgDescription()}
                    <Menu.Item>
                    {/* {this.props.annos.image.url.split('/').pop() +" (ID: "+this.props.annos.image.id+")"} */}
                    {"ID: "+this.props.imageMeta.id}
                    </Menu.Item>
                    <Menu.Item  
                    >
                    {this.props.imageMeta.number +" / "+ this.props.imageMeta.amount}
                    </Menu.Item>
                    {this.renderImgLabels()}
            </Menu>
        </div>
        )
    }
}

export default ImgBar