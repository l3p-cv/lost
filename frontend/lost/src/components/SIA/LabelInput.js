import React, {Component} from 'react'
import { Dropdown, Ref, Popup, Header} from 'semantic-ui-react'
import * as annoStatus from './types/annoStatus'
import * as constraints from './utils/constraints'

class LabelInput extends Component{

    constructor(props){
        super(props)
        this.state = {
            label: undefined,
            possibleLabels: []
        }
        this.inputRef = React.createRef()
    }

    componentWillMount(){
        this.updatePossibleLabels()
    }
    
    componentDidUpdate(prevProps){
        if (this.props.visible){

            if (this.inputRef.current){
                console.log('LabelInput', this.inputRef.current)
                this.inputRef.current.click()
            }

        } 

        // if (prevProps.keyDown !== this.props.keyDown){
        //     this.performKeyAction(this.props.keyDown)
        // }
        if (prevProps.possibleLabels !== this.props.possibleLabels){
            this.updatePossibleLabels()
        }
        if (this.props.initLabelIds){
            if (prevProps.relatedId !== this.props.relatedId){
                if(this.props.initLabelIds.length > 0){
                    const lbl = this.state.possibleLabels.find(e => {
                        return e.value === this.props.initLabelIds[0]
                    })
                    if (lbl){
                        this.setState({label:lbl})
                    }
                }
            }
        }
    }
    /*************
     * EVENTS    *
    **************/
    onKeyDown(e: Event){
        e.stopPropagation()
        console.log('LabelInput KeyDown on Input field: ', e.key)
        this.performKeyAction(e.key)
        
    }

    onChange(e, item ){
        console.log('LabelInput onChange', e, item)
        this.setState({ label: item })
        // this.updateSelectedAnnoLabel(item)
        // this.confirmLabel()
    }

    // handleClick(){
    //     this.annoLabelUpdate(this.state.label)
    //     this.closeLabelInput()
    // }

    /*************
     * LOGIC     *
     *************/
    updatePossibleLabels(){
        let possibleLabels = []
        if (this.props.possibleLabels.length > 0){
            possibleLabels = this.props.possibleLabels.map(e => {
                return {key: e.id, value: e.id, text: e.label}
            })
        }
        possibleLabels = [{key: -1, text:"no label", value:-1}, ...possibleLabels]
        this.setState({possibleLabels})

    }

    performKeyAction(key){
        switch(key){
            case 'Enter':
                if (this.props.visible) this.confirmLabel()
                break
            case 'Escape':
                // console.log('LabelInput Escape current label', this.state.label.id)
                this.closeLabelInput()
                break
            default:
                break
        }
    }

    annoLabelUpdate(anno){
        if (this.props.onLabelUpdate){
            this.props.onLabelUpdate(anno)
        }
    }

    
    confirmLabel(){
        //If not allowed to label -> return
        this.annoLabelUpdate(this.state.label)
        this.closeLabelInput()
    }

    closeLabelInput(){
        if (this.props.onClose){
            this.props.onClose()
        }
        // this.props.siaShowLabelInput(false)
        // this.props.siaShowSingleAnno(undefined)
    }

    /*************
     * RENDERING *
    **************/
    renderLabelInput(){
        return (
            <Ref innerRef={this.inputRef}>
                    <Dropdown
                        multiple={false}
                        search
                        selection
                        closeOnChange
                        icon="search"
                        options={this.state.possibleLabels}
                        placeholder='Enter label'
                        tabIndex={0}
                        onKeyDown= {e => this.onKeyDown(e)}
                        defaultValue={
                            this.state.label ?
                            this.state.label.value :
                            -1
                        }
                        onChange={(e, item) => this.onChange(e, item)}
                        // onClick={() => this.handleClick()}
                        // searchInput={<Dropdown.SearchInput />}
                    />
                </Ref>
        )
    }
    renderLabelInfo(){
        if (!this.state.label) return null
        const lbl = this.props.possibleLabels.find(e => {
            return this.state.label.value === e.id
        })
        if (!lbl) return "No label"
        return <div>
            <Header>{
                lbl.label
            }</Header>
            {lbl.description}
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
        // console.log('Render LabelInput with state', this.state, this.props.possibleLabels)
        return (
            <Popup trigger={this.renderLabelInput()}
            content={this.renderPopupContent()}
            open
            position="right center"
            style={{opacity:0.9}}
            />
        )
    }
    
}

export default LabelInput