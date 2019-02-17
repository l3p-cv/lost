import React, {Component} from 'react'
import DatasourceModal from './DatasourceModal'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { log } from 'core-js';

class BaseModal extends Component{
    constructor(){
        super()
        this.state = {
            modalData: undefined
        }
    }
    // ComponentWillReviceProps is deprecated
    static getDerivedStateFromProps(props, state) {
        if(props.data){
            const modalData = props.data.elements.filter(el=>el.id === props.selectedModal)
            return{
                modalData
            }
        }
        return null
    }
    renderModals(){
        return(
            <DatasourceModal modalData = {this.state.modalData}/> 
        )
    }

    selectModal(){
        return(
            <Modal isOpen={this.props.modalOpen} toggle={this.props.toggleModal}>
                {this.renderModals()}
                <ModalFooter>
                <Button color="primary" onClick={this.props.toggleModal}>Do Something</Button>{' '}
            <Button color="secondary" onClick={this.props.toggleModal}>Cancel</Button>
              </ModalFooter>
            </Modal>
        )
    }

    render(){
        return(
            <div>
                {this.selectModal()}
            </div>
        )
    }
}

export default BaseModal