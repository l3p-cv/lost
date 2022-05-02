import React, { Component } from 'react'
import { Form, FormGroup, Label, Input } from 'reactstrap'
import actions from '../../../../../../../../actions/pipeline/pipelineStartModals/annoTask'
import { CRow, CCol } from '@coreui/react'
import HelpButton from '../../../../../../../../components/HelpButton'

import { connect } from 'react-redux'

const { nameOnInput, instructionsOnInput } = actions

class UserInfo extends Component {
    constructor() {
        super()
        this.nameOnInput = this.nameOnInput.bind(this)
        this.instructionsOnInput = this.instructionsOnInput.bind(this)
    }
    nameOnInput(e) {
        this.props.nameOnInput(this.props.peN, e.target.value)
    }
    instructionsOnInput(e) {
        this.props.instructionsOnInput(this.props.peN, e.target.value)
    }
    render() {
        return (
            <>
                <CRow>
                    <CCol sm="3"></CCol>
                    <CCol sm="6">
                        <Form>
                            <FormGroup>
                                <Label for="name">Name</Label>
                                <HelpButton
                                    id={'anno-start-name'}
                                    text={
                                        'Give your AnnotationTask a name. The name can also be seen by your annotators.'
                                    }
                                />
                                <Input
                                    defaultValue={this.props.exportData.annoTask.name}
                                    onChange={this.nameOnInput}
                                    type="text"
                                    name="name"
                                    id="name"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="instruction">Instructions</Label>
                                <HelpButton
                                    id={'anno-start-desc'}
                                    text={
                                        'Give instructions / hints to your annotators so they know what to do.'
                                    }
                                />
                                <Input
                                    defaultValue={
                                        this.props.exportData.annoTask.instructions
                                    }
                                    onChange={this.instructionsOnInput}
                                    type="text"
                                    name="instruction"
                                    id="instruction"
                                />
                            </FormGroup>
                        </Form>
                    </CCol>
                    <CCol sm="3"></CCol>
                </CRow>
            </>
        )
    }
}

export default connect(null, { nameOnInput, instructionsOnInput })(UserInfo)
