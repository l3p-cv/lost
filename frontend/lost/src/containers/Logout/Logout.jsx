import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, CardGroup, Container, Row } from 'reactstrap'
import { useLogout } from '../../actions/auth'

const Logout = () => {
    const navigate = useNavigate()
    const isTimeout = window.location.hash.replace('#', '') === 'timeout'

    const { mutate: logout, isLoading, isError } = useLogout()

    useEffect(() => {
        logout()
    }, [logout])

    return (
        <div className="app flex-row align-items-center">
            <Container>
                <Row
                    style={{ margin: '10% 0% 5% 0%' }}
                    className="justify-content-center"
                >
                    <img src="/assets/lost_logo.png" alt="" style={{ width: '500px' }} />
                </Row>
                <Row className="justify-content-center">
                    <CardGroup>
                        <Card className="p-4">
                            <CardBody>
                                {isError ? (
                                    <div> An error occurred while logging out. </div>
                                ) : isLoading ? (
                                    <div>Logging out...</div>
                                ) : (
                                    <div>
                                        {isTimeout
                                            ? 'Your session has expired due to inactivity'
                                            : 'You have been successfully logged out.'}
                                        &nbsp;
                                    </div>
                                )}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Button
                                        disabled={isLoading}
                                        style={{ marginTop: '5%' }}
                                        color="primary"
                                        onClick={() => navigate('/login')}
                                    >
                                        Back to login page!
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </CardGroup>
                </Row>
            </Container>
        </div>
    )
}

export default Logout
