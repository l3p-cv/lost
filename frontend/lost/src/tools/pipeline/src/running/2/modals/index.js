import React, { Component } from 'react'
import DatasourceModal from './types/DatasourceModal'
import ScriptModal from './types/ScriptModal'
import AnnoTaskModal from './types/AnnoTaskModal'
import DataExportModal from './types/DataExportModal'
import { Button, Modal, ModalFooter } from 'reactstrap';
import {connect} from 'react-redux'
import actions from 'actions/pipeline/pipelineRunning'

const {toggleModal} = actions


class BaseModal extends Component {
    constructor() {
        super()
        this.toggleModal = this.toggleModal.bind(this)
    }
    
    selectModal() {
        if (this.props.data && this.props.step.modalOpened) {
            const modalData = this.props.data.elements.filter(el => el.peN === this.props.step.modalClickedId)[0]
            if ('datasource' in modalData) {
                return (
                    <DatasourceModal
                        {...modalData} />
                )
            } else if ('script' in modalData) {
                return (
                    <ScriptModal
                        {...modalData} />
                )
            } else if('annoTask' in modalData){
                return (
                    <AnnoTaskModal
                    {...modalData}
                    />
                )
            }else if('dataExport' in modalData){
                return (
                    <DataExportModal
                    {...modalData}
                    />
                )
            }
        }
    }
    toggleModal(){
        this.props.toggleModal(this.props.step.modalClickedId)
    }
    renderModals() {
        return (
            <Modal size='lg' isOpen={this.props.step.modalOpened} toggle={this.toggleModal}>
                {this.selectModal()}
                <ModalFooter>
                    <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }

    render() {
        return (
            <div>
                {this.renderModals()}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        step: state.pipelineRunning.steps[1],
        data: state.pipelineRunning.step1Data
    }
}

export default connect(
    mapStateToProps,
    {toggleModal}
)(BaseModal)