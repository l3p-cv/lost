import React, { Component } from 'react'
import DatasourceModal from './types/DatasourceModal'
import ScriptModal from './types/ScriptModal'
import AnnoTaskModal from './types/AnnoTaskModal'
import LoopModal from './types/LoopModal'
import VisualOutputModal from './types/VisualOutputModal'
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
            console.log(modalData)
            console.log(DataExportModal)
            console.log(LoopModal)
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
            }else if('loop' in modalData){
                return(
                    <LoopModal
                    {...modalData}
                    />
                )
            }else if('visualOutput' in modalData){
                return(
                    <VisualOutputModal
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