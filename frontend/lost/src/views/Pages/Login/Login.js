import React, { Component } from 'react'
import { reduxForm, Field } from 'redux-form'
import { compose } from 'redux'
import { connect } from 'react-redux'
import actions from '../../../actions'
import { Button, Card, CardBody, CardGroup, Col, Container, Form, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap'

const {login, changeView} = actions
class Login extends Component {
  onSubmit = formProps => {
    this.props.login(formProps, ()=> {
      this.props.history.push('/dashboard')
    })
  }
 
  render() {
    const { handleSubmit } = this.props
    return (
      <div className='app flex-row align-items-center'>
        <Container>
          <Row className='justify-content-center'>
            <Col md='4'>
              <CardGroup>
                <Card className='p-4'>
                  <CardBody>
                    <Form onSubmit={handleSubmit(this.onSubmit)}>
                      <h1>Login</h1>
                      <p className='text-muted'>Sign In to your account</p>
                      <InputGroup className='mb-3'>
                        <InputGroupAddon addonType='prepend'>
                          <InputGroupText>
                            <i className='icon-user'></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Field
                          name='user_name'
                          type='text'
                          placeholder='Username'
                          autoComplete='user_name'
                          component='input'
                        />
                      </InputGroup>
                      <InputGroup className='mb-4'>
                        <InputGroupAddon addonType='prepend'>
                          <InputGroupText>
                            <i className='icon-lock'></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Field
                          name='password'
                          type='password'
                          placeholder='Password'
                          autoComplete='current-password'
                          component='input'
                        />
                      </InputGroup>
                      <Row>
                        <Col xs='6'>
                        <div>{this.props.errorMessage}</div>
                          <Button color='primary' className='px-4'>Login</Button>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { errorMessage: state.auth.errorMessage }
}

export default compose(
  connect(mapStateToProps, {login, changeView}),
  reduxForm({ form: 'login' })
)(Login)
