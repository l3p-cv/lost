import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Button, Card, CardBody, CardGroup, Col, Container, Row } from 'reactstrap'
import { useHistory } from 'react-router-dom'
import actions from '../actions'

const Logout = () => {
    const dispatch = useDispatch()
    const history = useHistory()
    const isTimeout = history.location.hash.replace('#', '') === 'timeout'
    useEffect(() => {
        dispatch(actions.logout())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <div className="app flex-row align-items-center">
            <Container>
                <Row style={{ margin: '10% 0% 7% 0%' }} className="justify-content-center">
                    <img width="400px"  alt="" />
                </Row>
                <Row className="justify-content-center">
                    <Col md="8">
                        <CardGroup>
                            <Card className="p-4">
                                <CardBody>
                                    <div>
                                        {isTimeout
                                            ? 'Your session has expired due to inactivity'
                                            : 'You have been successfully logged out.'}
                                        &nbsp;
                                        <Button
                                            className="btn-info"
                                            onClick={() => history.push('/login')}
                                        >
                                            Take me back to the login page !
                                        </Button>
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

export default Logout
