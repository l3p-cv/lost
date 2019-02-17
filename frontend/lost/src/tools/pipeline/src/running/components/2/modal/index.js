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
    // ComponentWillReviceProps is deprecated --> return value update the State
    static getDerivedStateFromProps(props) {
        if(props.data){
            const modalData = props.data.elements.filter(el=>el.id === props.selectedModal)[0]
            console.log('-----------modalData-------------------------');
            console.log(modalData);
            console.log('------------------------------------');
            return{
                modalData
            }
        }
        return null
    }
    renderModals(){
        return(
            <DatasourceModal {...this.state.modalData}/> 
        )
    }

    selectModal(){
        return(
            <Modal size='lg' isOpen={this.props.modalOpen} toggle={this.props.toggleModal}>
                {this.renderModals()}
                <ModalFooter>
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