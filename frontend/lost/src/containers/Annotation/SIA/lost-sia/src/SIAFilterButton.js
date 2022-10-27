import React, {Component} from 'react'
import { Popup, Icon, Menu, Divider, Checkbox } from 'semantic-ui-react'
import * as filterTools from './filterTools'
import * as tbe from './types/toolbarEvents'
class SIAFilterButton extends Component{

    constructor(props) {
        super(props)
        this.state = {
            clipLimit: 3,
            active: false,
            color: undefined
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.filter.clahe.clipLimit !== this.props.filter.clahe.clipLimit){
            this.setState({clipLimit:this.props.filter.clahe.clipLimit})
        }
        if (this.props.filter !== prevProps.filter){
            if (filterTools.active(this.props.filter)){
                this.setState({color:'red', active:true})
            } else {
                this.setState({color:'white', active:false})
            }
        }
    }

    triggerEvent(e, data){
        if (this.props.onFilterEvent){
            this.props.onFilterEvent(e, data)
        }
    }

    handleClipLimitChange(e){
        const cl = parseInt(e.target.value)
        this.setState({clipLimit:cl})
        // this.claheFilter(cl)
    }

    rotateImg(angle){
        const active = !(this.props.filter.rotate.active && this.props.filter.rotate.angle === angle)
        const myAngle = active ? angle : 0
        this.triggerEvent( tbe.APPLY_FILTER,
        {
            ...this.props.filter,
            rotate: {angle:myAngle, active:active}
        })

        // this.props.siaApplyFilter({
        //     ...this.props.filter,
        //     rotate: {angle:myAngle, active:active}
        // })
    }

    claheFilter(clipLimit){
        const filter = {
            'clahe' : {
                'clipLimit':clipLimit, 
                active:!this.props.filter.clahe.active
            }
        }
        this.triggerEvent(tbe.APPLY_FILTER,
        {
            ...this.props.filter,
            clahe: filter.clahe
        })
        // this.props.siaApplyFilter({
        //     ...this.props.filter,
        //     clahe: filter.clahe
        // })
    }

    releaseCLAHESlider(e){
        const filter = {
            'clahe' : {
                'clipLimit':parseInt(e.target.value), 
                active:true
            }
        }
        this.triggerEvent(tbe.APPLY_FILTER,
        {
            ...this.props.filter,
            clahe: filter.clahe
        })
        // this.props.siaApplyFilter({
        //     ...this.props.filter,
        //     clahe: filter.clahe
        // })
    }

    renderRotateContent(){
        const filter = this.props.filter
        return <div>
            <Divider horizontal>Rotate</Divider>
            <Checkbox 
                checked={filter.rotate.active && filter.rotate.angle === 90} 
                label="Rotate 90" toggle
                onClick={() => this.rotateImg(90)}
                />
            <Checkbox 
                checked={filter.rotate.active && filter.rotate.angle === -90} 
                label="Rotate -90" toggle
                onClick={() => this.rotateImg(-90)}
                />
            <Checkbox 
                checked={filter.rotate.active && filter.rotate.angle === 180 } 
                label="Rotate 180" toggle
                onClick={() => this.rotateImg(180)}
                />
        </div>

    }

    renderRotate(){
        if (!this.props.enabled) return null
        if (this.props.enabled === true){
            return this.renderRotateContent()
        } else {
            if (this.props.enabled.rotate){
                return this.renderRotateContent()
            }
        }
    }

    renderClaheContent(){
        const filter = this.props.filter
        return <div>
            <Divider horizontal>Histogram equalization</Divider>
            <Checkbox 
                checked={filter.clahe.active} 
                label="Histogram equalization" toggle
                onClick={() => this.claheFilter(this.state.clipLimit)}
                />
            <div>Cliplimit: {this.state.clipLimit}</div>
            <input
                type='range'
                min={0}
                max={40}
                value={this.state.clipLimit}
                onChange={e => this.handleClipLimitChange(e)}
                onMouseUp={e => this.releaseCLAHESlider(e)}
                />
        </div>

    }

    renderClahe(){
        if (!this.props.enabled) return null
        if (this.props.enabled === true){
            return this.renderClaheContent()
        } else {
            if (this.props.enabled.clahe){
                return this.renderClaheContent()
            }
        }
    }

    render(){
        if (!this.props.imageMeta) return null
        const popupContent = <div >
            {this.renderRotate()}
            {this.renderClahe()}
        </div>
        return(
            <Popup trigger={ 
                <Menu.Item name='filter' active={this.state.active}>
                    <Icon name='filter' color={this.state.color}/>
                </Menu.Item>
                }
                content={popupContent}
                position={"right center"}
                pinned
                on="click"
                style={{zIndex:7000}}
            />
        )
    }
}

export default SIAFilterButton