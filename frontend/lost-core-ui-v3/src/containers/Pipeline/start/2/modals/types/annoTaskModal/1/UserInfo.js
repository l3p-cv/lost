import React, { Component } from 'react'
import { Card, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import actions from '../../../../../../../../../actions/pipeline/pipelineStartModals/annoTask'

import {connect} from 'react-redux'

const {nameOnInput, instructionsOnInput} = actions

class UserInfo extends Component {
    constructor(){
        super()
        this.nameOnInput = this.nameOnInput.bind(this)
        this.instructionsOnInput = this.instructionsOnInput.bind(this)
    }
    nameOnInput(e){
        this.props.nameOnInput(this.props.peN, e.target.value)
    }
    instructionsOnInput(e){
        this.props.instructionsOnInput(this.props.peN, e.target.value)
    }
    render() {
        return (
            <Card className='annotask-modal-card'>
                <CardBody>
                    <Form>
                        <FormGroup>
                            <Label for="name">Name</Label>
                            <Input defaultValue={this.props.exportData.annoTask.name} onChange={this.nameOnInput} type="text"  name="name" id="name"  />
                        </FormGroup>
                        <FormGroup>
                            <Label for="instruction">Instructions</Label>
                            <Input defaultValue={this.props.exportData.annoTask.instructions} onChange={this.instructionsOnInput} type="text" name="instruction" id="instruction"  />
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>

        )
    }
}


export default connect(null, {nameOnInput, instructionsOnInput})(UserInfo)