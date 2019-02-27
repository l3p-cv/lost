import React, { Component } from 'react'
import DatasourceModal from './types/DatasourceModal'
import ScriptModal from './types/ScriptModal'
import AnnoTaskModal from './types/annoTaskModal/AnnoTaskModal'
import DataExportModal from './types/DataExportModal'
import actions from 'actions/pipeline/pipelineStart'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux'
const { toggleModal, verifyNode } = actions


class BaseModal extends Component {
    constructor() {
        super()
        this.modalOnClosed = this.modalOnClosed.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
    }

    selectModal() {
        if (this.props.data && this.props.step.modalOpened) {
            switch (this.type) {
                case 'datasource': return (
                    <DatasourceModal
                        {...this.modalData} />
                )
                case 'script': return (
                    <ScriptModal
                        {...this.modalData} />
                )
                case 'annoTask': return (
                    <AnnoTaskModal
                        {...this.modalData}
                        availableLabelTrees={this.props.data.availableLabelTrees}
                        availableGroups={this.props.data.availableGroups}
                    />
                )
                case 'dataExport': return (
                    <DataExportModal
                        {...this.modalData}
                    />
                )
                default: throw new Error("unknown node type")
            }
        }
    }

    renderTitle() {
        if (this.props.data && this.props.step.modalOpened) {
            this.modalData = this.props.data.elements.filter(el => el.peN === this.props.step.modalClickedId)[0]
            if ('datasource' in this.modalData) {
                this.type = 'datasource'
                return ('Datasource')
            } else if ('script' in this.modalData) {
                this.type = 'script'
                return ('Script')
            } else if ('annoTask' in this.modalData) {
                this.type = 'annoTask'
                return ('Annotation Task')
            } else if ('dataExport' in this.modalData) {
                this.type = 'dataExport'
                return ('Data Export')
            } else {
                throw new Error("unknown node type")
            }
        }
    }

    modalOnClosed() {
        let verified = false
        switch (this.type) {
            case 'datasource':
                const {datasource} = this.modalData.exportData
                if(datasource.rawFilePath){
                    verified = true
                }else{
                    verified = false
                }
                break
            case 'script':
                break
            case 'annoTask':
                const {annoTask} = this.modalData.exportData
                if (annoTask.name &&
                    annoTask.instructions &&
                    annoTask.assignee &&
                    (annoTask.labelLeaves.length > 0) &&
                    annoTask.workerId &&
                    annoTask.selectedLabelTree
                ) {
                    verified = true
                } else {
                    verified = false
                }
                break
            case 'dataExport':
                break
            default: throw new Error("unknown node type")
        }   
        this.props.verifyNode(this.modalData.peN, verified)


    }

    toggleModal() {
        this.props.toggleModal(this.props.step.modalClickedId)
    }

    renderModals() {
        return (
            <Modal onClosed={this.modalOnClosed} size='lg' isOpen={this.props.step.modalOpened} toggle={this.toggleModal}>
                <ModalHeader >
                    {this.renderTitle()}
                </ModalHeader>
                <ModalBody>
                    {this.selectModal()}
                </ModalBody>
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
    { toggleModal, verifyNode }
)(BaseModal)