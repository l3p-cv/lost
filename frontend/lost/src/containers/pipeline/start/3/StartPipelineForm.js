import React, { Component } from 'react'
import { Card, CardBody, Form, FormGroup, Label, Input } from 'reactstrap'
import IconButton from '../../../../components/IconButton'
import { CRow, CCol } from '@coreui/react'
import actions from '../../../../actions/pipeline/pipelineStart'
import HelpButton from '../../../../components/HelpButton'
import { connect } from 'react-redux'

const { nameOnInput, descriptionOnInput, verifyTab } = actions
class StartPipelineForm extends Component {
    constructor() {
        super()
        this.nameOnInput = this.nameOnInput.bind(this)
        this.descriptionOnInput = this.descriptionOnInput.bind(this)
    }

    componentDidUpdate() {
        const verified = this.props.name && this.props.description
        this.props.verifyTab(2, verified)
    }

    nameOnInput(e) {
        this.props.nameOnInput(e.target.value)
    }

    descriptionOnInput(e) {
        this.props.descriptionOnInput(e.target.value)
    }

    render() {
        return (
            <>
                <CRow>
                    <CCol sm="3"></CCol>
                    <CCol sm="6">
                        <Form>
                            <FormGroup>
                                <Label for="name">Pipeline Name</Label>
                                <HelpButton
                                    id={'pipeline-start-name'}
                                    text={
                                        'Give your pipeline a name so that you can identify it later.'
                                    }
                                />
                                <Input
                                    value={this.props.name}
                                    onChange={this.nameOnInput}
                                    type="text"
                                    name="name"
                                    id="name"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="description">Pipeline Description</Label>
                                <HelpButton
                                    id={'pipeline-start-desc'}
                                    text={
                                        'Give your pipeline a description so that you still know later what you started it for.'
                                    }
                                />
                                <Input
                                    value={this.props.description}
                                    onChange={this.descriptionOnInput}
                                    type="text"
                                    name="description"
                                    id="description"
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

const mapStateToProps = (state) => {
    return {
        name: state.pipelineStart.step2Data.name,
        description: state.pipelineStart.step2Data.description,
    }
}

export default connect(mapStateToProps, { nameOnInput, descriptionOnInput, verifyTab })(
    StartPipelineForm,
)
