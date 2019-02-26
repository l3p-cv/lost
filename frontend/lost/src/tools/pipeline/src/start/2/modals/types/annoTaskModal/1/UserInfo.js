import React, { Component } from 'react'
import { Card, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';

class UserInfo extends Component {

    render() {
        return (
            <Card>
                <CardBody>
                    <Form>
                        <FormGroup>
                            <Label for="name">Name</Label>
                            <Input type="text" name="name" id="name" placeholder="" />
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

export default UserInfo