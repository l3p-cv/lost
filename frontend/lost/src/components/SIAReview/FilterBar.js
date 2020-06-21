import React, {Component} from 'react'
import { Menu, Dropdown } from 'semantic-ui-react'
import _ from 'lodash'

const getOptions = (number, prefix = 'Iteration ') =>
  _.times(number, (index) => ({
    key: index,
    text: `${prefix}${index}`,
    value: index,
  }))
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
                top: this.props.svg.top - 70,
                }
            })
        }
    }

    /*********
     * Events
     *********/
    handleIterationChange(e, item){
        console.log('Iteration Changed', e, item)
        if (this.props.onIterationChange){
            this.props.onIterationChange(item.value)
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
    render(){
        if (!this.props.visible) return null
        if (!this.props.svg) return null 
        return(
        <div style={{
            position:'fixed', 
            top: this.state.position.top, 
            left:this.state.position.left,
            width: this.props.svg.width,
            minWidth: '300px'
            }}
            // onMouseEnter={e => {this.handleMouseEnter(e)}}    
        >
            <Menu style={{opacity:0.9, justifyContent:'center', alignItems:'center'}} size='tiny'>
                    {/* {this.renderImgLabelInput()} */}
                    <Menu.Item size='tiny'
                    >
                    <Dropdown placeholder='Select iteration' icon='Filter' 
                        selection options={getOptions(this.props.options.max_iteration + 1)} 
                        onChange={(e, item) => this.handleIterationChange(e, item)}
                    />
                    
                    </Menu.Item>
                    {/* <Menu.Item  
                    >
                    {this.props.annos.image.number +" / "+ this.props.annos.image.amount}
                    </Menu.Item>
                    {this.renderImgLabels()} */}
            </Menu>
        </div>
        )
    }
}

export default ImgBar