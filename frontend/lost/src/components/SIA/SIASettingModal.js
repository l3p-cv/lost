import React, {Component} from 'react'

import {connect} from 'react-redux'
import { Button, Header, Image, Modal, Icon } from 'semantic-ui-react'
import actions from '../../actions'
const { siaShowImgBar, siaSetUIConfig } = actions

class SIASettingModal extends Component{

    constructor(props) {
        super(props)
        this.state = {
            open: false
        }
    }

    componentDidMount(){
        this.setState({open: this.props.open})
    }

    componentDidUpdate(prevProps){
        if (prevProps.open !== this.props.open){
            this.setState({open: this.props.open})  
        }
    }

    close(){
        this.setState({open: false})
        if (this.props.onClose){
            this.props.onClose()
        }
    }

    render(){
        if (!this.props.annos.image) return null
        return(
            <Modal size="small"  dimmer="blurring" open={this.state.open} onClose={() => this.close()} centered={false}>
                <Modal.Header>
                    <Icon name="setting"></Icon> Settings
                </Modal.Header>
                <Modal.Content scrolling={false}>
                    <Modal.Description>
                    <Header>Default Profile Image</Header>
                    <p>We've found the following gravatar image associated with your e-mail address.</p>
                    <p>Is it okay to use this photo?</p>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                    positive
                    icon='checkmark'
                    labelPosition='right'
                    content="OK"
                    onClick={() => this.close()}
                    />
                </Modal.Actions>
            </Modal>
        //     <Modal
        //     open={true}
        //     header='Reminder!'
        //     content='Call Benjamin regarding the reports.'
        //     actions={['Snooze', { key: 'done', content: 'Done', positive: true }]}
        //   />
        )
    }
}

function mapStateToProps(state) {
    return ({
        annos: state.sia.annos,
        selectedAnno: state.sia.selectedAnno,
        layoutUpdate: state.sia.layoutUpdate,
        uiConfig: state.sia.uiConfig,
        imgBar: state.sia.imgBar,
        svg: state.sia.svg
    })
}
export default connect(mapStateToProps, 
    {siaShowImgBar, siaSetUIConfig}
)(SIASettingModal)