import React, { Component } from 'react'
import DatasourceModal from './types/DatasourceModal'
import ScriptModal from './types/ScriptModal'
import AnnoTaskModal from './types/annoTaskModal/AnnoTaskModal'
import DataExportModal from './types/DataExportModal'
import actions from 'actions/pipeline/pipelineStart'
import { Button, Modal, ModalFooter } from 'reactstrap';
import {connect} from 'react-redux'
import { stat } from 'fs';


const {toggleModal} = actions


class BaseModal extends Component {
    constructor() {
        super()
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
                    availableLabelTrees= {this.props.data.availableLabelTrees}
                    availableGroups = {this.props.data.availableGroups}
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

    renderModals() {
        return (
            <Modal size='lg' isOpen={this.props.step.modalOpened} toggle={this.props.toggleModal}>
                {this.selectModal()}
                <ModalFooter>
                    <Button color="secondary" onClick={this.props.toggleModal}>Cancel</Button>
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
    {toggleModal}
)(BaseModal)