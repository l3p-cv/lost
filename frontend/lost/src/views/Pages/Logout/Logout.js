import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import actions from '../../../actions'
import { Button, Card, CardBody, CardGroup, Col, Container, Row } from 'reactstrap'

const {logout} = actions
class Logout extends Component {
  componentDidMount(){
    this.props.logout()
  }
 
  render() {
    return (
      <div className='app flex-row align-items-center'>
        <Container>
          <Row className='justify-content-center'>
            <Col md='8'>
              <CardGroup>
                <Card className='p-4'>
                  <CardBody>
                  <div>
                  You have been successfully logged out. &nbsp;
                  <Button className='btn-info' onClick={()=>this.props.history.push('/login')}>Take me back to the login page !</Button>
                  </div>
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
  connect(mapStateToProps, {logout}),
)(Logout)
