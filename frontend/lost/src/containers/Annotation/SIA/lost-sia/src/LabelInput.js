import React, {Component} from 'react'
import { Dropdown, Ref, Popup, Header} from 'semantic-ui-react'

class LabelInput extends Component{

    constructor(props){
        super(props)
        this.state = {
            label: [],
            possibleLabels: [],
            performInit: true,
            enterHits: 0,
            confirmLabel: 0
        }
        this.inputRef = React.createRef()
    }

    componentWillMount(){
        this.updatePossibleLabels()
    }

    componentDidMount(){
        if(this.props.initLabelIds){
            this.setState({performInit:true})
        }
    }

    componentDidUpdate(prevProps, prevState){
        if (this.props.visible){
            if (this.props.focusOnRender){
                if (this.inputRef.current){
                    this.inputRef.current.click()
                }
            }

        }
        if (prevState.confirmLabel !== this.state.confirmLabel){
            this.annoLabelUpdate(this.state.label)
            this.closeLabelInput()
        }
        if (prevProps.possibleLabels !== this.props.possibleLabels){
            this.updatePossibleLabels()
        }
        if (this.props.initLabelIds){
            if (this.state.performInit){
                this.setState({performInit: false})
                if(this.props.initLabelIds.length > 0){
                    this.setState({label: this.props.initLabelIds})
                    // const lbl = this.state.possibleLabels.find(e => {
                    //     return e.value === this.props.initLabelIds[0]
                    // })
                    // if (lbl){
                    //     this.setState({label:lbl.value})
                    // }
                } else {
                        this.setState({label:[]})
                }
            }
            if (prevProps.initLabelIds !== this.props.initLabelIds){
                this.setState({performInit:true})
            }
        }
        if(prevProps.relatedId !== this.props.relatedId){
            this.setState({performInit:true})
        }
    }
    /*************
     * EVENTS    *
    **************/
    onKeyDown(e: Event){
        e.stopPropagation()
        this.performKeyAction(e.key)

    }

    onChange(e, item ){
        let lbl 
        if (this.props.multilabels){
            lbl = item.value !== -1 ? item.value : []
        } else {
            lbl = item.value !== -1 ? [item.value] : []
        }
        this.setState({ label: lbl})
        this.annoLabelUpdate(lbl)
        // this.inputRef.current.click()
    }

    onItemClick(e, item){
        this.confirmLabel()
    }


    /*************
     * LOGIC     *
     *************/
    updatePossibleLabels(){
        let possibleLabels = []
        let defaultLabel
        if (this.props.defaultLabel){
            if (Number.isInteger(this.props.defaultLabel)){
                defaultLabel = undefined
            } else {
                defaultLabel = this.props.defaultLabel
            }
        } else {
            defaultLabel = 'no label'
        }
        
        if (this.props.possibleLabels.length > 0){
            possibleLabels = this.props.possibleLabels.map(e => {
                return {
                    key: e.id, value: e.id, text: e.label,
                    content: (<div onClick={(event) => this.onItemClick(event, e.id)}>
                        {e.label}</div>)
                }
            })
        }
        if (defaultLabel){
            possibleLabels.unshift({
                key: -1, value: -1, text: defaultLabel,
                content: (<div onClick={(event) => this.onItemClick(event, -1)}>
                {defaultLabel}</div>)
            })
        }
        this.setState({possibleLabels})

    }

    performKeyAction(key){
        switch(key){
            case 'Enter':
                if (!this.props.multilabels){
                    if (this.props.visible) this.confirmLabel()
                }
                break
            case 'Escape':
                this.closeLabelInput()
                break
            default:
                break
        }
    }

    annoLabelUpdate(label){
        console.log('LabelInput -> annoLabelUpdate ', label)
        if (this.props.onLabelUpdate){
            this.props.onLabelUpdate(label.filter(val=>{
                return val !== -1
            }))
        }
    }


    confirmLabel(){
        //If not allowed to label -> return
        this.setState({confirmLabel: this.state.confirmLabel+1})
    }

    closeLabelInput(){
        console.log('LabelInput -> closeLabelInput')
        if (this.props.onLabelConfirmed){
            this.props.onLabelConfirmed(this.state.label.filter(val=>{
                return val !== -1
            }))
        }
        if (this.props.onClose){
            this.props.onClose()
        }
    }

    // triggerPopup(visible=true){
    //     this.setState({
    //         popupOpen: visible
    //     })
    // }

    /*************
     * RENDERING *
    **************/
    renderLabelInput(){
        let lbl
        if (this.props.multilabels){
            lbl = this.state.label
        } else {
            if (this.state.label.length > 0){
                lbl = this.state.label[0]
            } else {
                lbl = -1
            }
        }

        return (
            <Ref innerRef={this.inputRef}>
                    <Dropdown
                        multiple={this.props.multilabels}
                        search
                        selection
                        closeOnChange
                        icon="search"
                        options={this.state.possibleLabels}
                        placeholder='Enter label'
                        tabIndex={0}
                        onKeyDown= {e => this.onKeyDown(e)}
                        value={lbl}
                        onChange={(e, item) => this.onChange(e, item)}
                        style={{opacity:0.8}}
                        disabled={this.props.disabled}
                        open={this.props.open}
                    />
                </Ref>
        )
    }
    renderLabelInfo(){
        if (!this.state.label) return null
        let lbl = undefined
        if (this.state.label.length > 0){
            lbl = this.props.possibleLabels.find(e => {
                return this.state.label[this.state.label.length-1] === e.id
            })
        }
        if (!lbl) return "No label"
        return <div>
            <Header>{
                lbl.label
            }</Header>
            <div dangerouslySetInnerHTML={{__html: lbl.description}} />
        </div>
    }

    renderPopupContent(){
        return <div>
            {this.renderLabelInfo()}
            {/* {this.renderAnnoDetails()} */}
        </div>
    }


    render(){
        if (!this.props.visible) return null
        if (this.props.renderPopup){
            return (
                <Popup trigger={this.renderLabelInput()}
                content={this.renderPopupContent()}
                open
                position="right center"
                style={{opacity:0.9}}
                />
            )
        } else {
            return this.renderLabelInput()
        }

    }

}

export default LabelInput
