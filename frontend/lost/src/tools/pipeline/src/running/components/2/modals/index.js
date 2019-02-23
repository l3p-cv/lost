import React, { Component } from 'react'
import DatasourceModal from './types/DatasourceModal'
import ScriptModal from './types/ScriptModal'
import AnnoTaskModal from './types/AnnoTaskModal'
import DataExportModal from './types/DataExportModal'
import { Button, Modal, ModalFooter } from 'reactstrap';
import {connect} from 'react-redux'
import actions from 'actions'

const {toggleModal} = actions


class BaseModal extends Component {
    constructor() {
        super()
    }
    
    selectModal() {
        if (this.props.stepData.data && this.props.stepData.modalOpened) {
            const modalData = this.props.stepData.data.elements.filter(el => el.peN === this.props.stepData.modalClickedId)[0]
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

    renderModals() {
        return (
            <Modal size='lg' isOpen={this.props.stepData.modalOpened} toggle={this.props.toggleModal}>
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
    return {stepData: state.pipelineRunning.steps[1]}
}

export default connect(
    mapStateToProps,
    {toggleModal}
)(BaseModal)