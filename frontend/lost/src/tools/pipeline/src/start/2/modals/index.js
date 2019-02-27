import React, { Component } from 'react'
import DatasourceModal from './types/DatasourceModal'
import ScriptModal from './types/ScriptModal'
import AnnoTaskModal from './types/annoTaskModal/AnnoTaskModal'
import DataExportModal from './types/DataExportModal'
import actions from 'actions/pipeline/pipelineStart'
import { Button, Modal, ModalFooter } from 'reactstrap';
import {connect} from 'react-redux'
const {toggleModal, verifyAnnoTaskNode} = actions


class BaseModal extends Component {
    constructor() {
        super()
        this.modalOnClosed = this.modalOnClosed.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
    }
    
    selectModal() {
        if (this.props.data && this.props.step.modalOpened) {
            this.modalData = this.props.data.elements.filter(el => el.peN === this.props.step.modalClickedId)[0]
            if ('datasource' in this.modalData) {
                return (
                    <DatasourceModal
                        {...this.modalData} />
                )
            } else if ('script' in this.modalData) {
                return (
                    <ScriptModal
                        {...this.modalData} />
                )
            } else if('annoTask' in this.modalData){
                return (
                    <AnnoTaskModal
                    {...this.modalData}
                    availableLabelTrees= {this.props.data.availableLabelTrees}
                    availableGroups = {this.props.data.availableGroups}
                    />
                )
            }else if('dataExport' in this.modalData){
                return (
                    <DataExportModal
                    {...this.modalData}
                    />
                )
            }
        }
    }

    modalOnClosed(){
        if('annoTask' in this.modalData){
            const {annoTask} = this.modalData.exportData
            if(annoTask.name &&
                 annoTask.instructions &&
                 annoTask.assignee &&
                 (annoTask.labelLeaves.length > 0) &&
                 annoTask.workerId &&
                 annoTask.selectedLabelTree
                 ){
                    this.props.verifyAnnoTaskNode(this.modalData.peN, true)
                 }else{
                    this.props.verifyAnnoTaskNode(this.modalData.peN, false)
                 }
        }
    }

    toggleModal(){
        this.props.toggleModal(this.props.step.modalClickedId)
    }

    renderModals() {
        return (
            <Modal  onClosed={this.modalOnClosed} size='lg' isOpen={this.props.step.modalOpened} toggle={this.toggleModal}>
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
        step: state.pipelineStart.stepper.steps[1],
        data: state.pipelineStart.step1Data
    }
}

export default connect(
    mapStateToProps,
    {toggleModal, verifyAnnoTaskNode}
)(BaseModal)