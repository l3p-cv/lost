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
            if ('datasource' in this.props.data) {
                return (
                    <DatasourceModal
                        {...this.props.data} />
                )
            } else if ('script' in this.props.data) {
                return (
                    <ScriptModal
                        {...this.props.data} />
                )
            } else if('annoTask' in this.props.data){
                return (
                    <AnnoTaskModal
                    {...this.props.data}
                    />
                )
            }else if('dataExport' in this.props.data){
                return (
                    <DataExportModal
                    {...this.props.data}
                    />
                )
            }else if('loop' in this.props.data){
                return(
                    <LoopModal
                    {...this.props.data}
                    />
                )
            }else if('visualOutput' in this.props.data){
                return(
                    <VisualOutputModal
                    {...this.props.data}
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
                    <Button color="secondary" onClick={this.toggleModal}>Okay</Button>
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
    }
}

export default connect(
    mapStateToProps,
    {toggleModal}
)(BaseModal)