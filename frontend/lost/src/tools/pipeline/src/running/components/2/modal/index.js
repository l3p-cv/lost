import React, { Component } from 'react'
import DatasourceModal from './DatasourceModal'
import ScriptModal from './ScriptModal'
import AnnoTaskModal from './AnnoTaskModal'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class BaseModal extends Component {
    constructor() {
        super()
        this.state= {
            modalData: undefined
        }
    }
    // ComponentWillReviceProps is deprecated --> return value update the State
    static getDerivedStateFromProps(props) {

        if (props.data) {
            const modalData = props.data.elements.filter(el => el.id === props.selectedModal)[0]
            if (!modalData) {
                return null
            }
            return {
                modalData
            }
        }
        return null
    }
    renderModals() {
        if (this.state.modalData) {
            if ('datasource' in this.state.modalData) {
                return (
                    <DatasourceModal
                        {...this.state.modalData} />
                )
            } else if ('script' in this.state.modalData) {
                return (
                    <ScriptModal
                        {...this.state.modalData} />
                )
            } else if('annoTask' in this.state.modalData){
                return (
                    <AnnoTaskModal
                    {...this.state.modalData}
                    />
                )
            }
        }
    }

    selectModal() {
        return (
            <Modal size='lg' isOpen={this.props.modalOpen} toggle={this.props.toggleModal}>
                {this.renderModals()}
                <ModalFooter>
                    <Button color="secondary" onClick={this.props.toggleModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }

    render() {
        return (
            <div>
                {this.selectModal()}
            </div>
        )
    }
}

export default BaseModal