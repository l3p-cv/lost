import React, {Component} from 'react'
import {Card, CardBody, Form, FormGroup, Label, Input} from 'reactstrap'
import actions from '../../../../../actions/pipeline/pipelineStart'

import {connect} from 'react-redux'

const {nameOnInput, descriptionOnInput, verifyTab} = actions
class StartPipelineForm extends Component{
    constructor(){
        super()
        this.nameOnInput = this.nameOnInput.bind(this)
        this.descriptionOnInput = this.descriptionOnInput.bind(this)
    }


    componentDidUpdate(){
        const verified  = this.props.name && this.props.description
        this.props.verifyTab(2, verified)
    }

    nameOnInput(e){
        this.props.nameOnInput(e.target.value)
    }

    descriptionOnInput(e){
        this.props.descriptionOnInput(e.target.value)
    }
    
    render(){
        return(
            <Card className='pipeline-start-3' >
                <CardBody>
                    <Form>
                        <FormGroup>
                            <Label for="name">Name</Label>
                            <Input value={this.props.name} onChange={this.nameOnInput} type="text"  name="name" id="name"  />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <Input value={this.props.description} onChange={this.descriptionOnInput} type="text" name="description" id="description"  />
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>
        )
    }
}

const mapStateToProps = (state)=>{
    return {
        name :state.pipelineStart.step2Data.name,
        description: state.pipelineStart.step2Data.description
    }
}

export default connect(mapStateToProps, {nameOnInput, descriptionOnInput, verifyTab})(StartPipelineForm)