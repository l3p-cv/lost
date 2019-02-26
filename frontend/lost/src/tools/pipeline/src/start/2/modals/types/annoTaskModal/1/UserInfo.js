import React, { Component } from 'react'
import { Card, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import actions from 'actions/pipeline/pipelineStart'
import {connect} from 'react-redux'

const {annoTaskNameOnInput, annoTaskInstructionsOnInput} = actions

class UserInfo extends Component {

    nameOnInput(e){
        //this.props.
    }
    render() {
        return (
            <Card>
                <CardBody>
                    <Form>
                        <FormGroup>
                            <Label for="name">Name</Label>
                            <Input onInput={this.nameOnInput} type="text" name="name" id="name" placeholder="" />
                        </FormGroup>
                        <FormGroup>
                            <Label for="instruction">Instructions</Label>
                            <Input type="text" name="instruction" id="instruction" placeholder="" />
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>

        )
    }
}

export default connect(null, {annoTaskInstructionsOnInput, annoTaskNameOnInput})(UserInfo)