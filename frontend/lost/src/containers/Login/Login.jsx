import { CRow } from '@coreui/react'
import { useState } from 'react'
import { FaLock, FaUser } from 'react-icons/fa'
import {
    Button,
    Card,
    CardBody,
    CardGroup,
    Col,
    Container,
    Form,
    Input,
    InputGroup,
    InputGroupText,
    Row,
} from 'reactstrap'
import { useLogin } from '../../actions/auth'
import Loading from '../../components/Loading'

const Login = () => {
    const { mutate: login, status: loginStatus } = useLogin()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const submit = (e) => {
        e.preventDefault()
        login({
            password,
            userName: username,
        })
    }

    return (
        <div className="app flex-row align-items-center">
            <Container>
                <Row
                    style={{ margin: '10% 0% 5% 0%' }}
                    className="justify-content-center"
                >
                    <img
                        src="/assets/lost_logo.png"
                        alt="lost-logo"
                        style={{ width: '500px' }}
                    />
                </Row>
                <Row className="justify-content-center">
                    <Col md="4">
                        <CardGroup>
                            <Card className="p-4">
                                <CardBody>
                                    <Form onSubmit={submit}>
                                        <h1>Login</h1>
                                        <p className="text-muted">
                                            Sign in to your account
                                        </p>
                                        <InputGroup className="mb-3">
                                            <InputGroupText>
                                                <FaUser />
                                            </InputGroupText>
                                            <Input
                                                onChange={(e) =>
                                                    setUsername(e.currentTarget.value)
                                                }
                                                name="userName"
                                                type="text"
                                                placeholder="Username"
                                                autoComplete="userName"
                                            />
                                        </InputGroup>
                                        <InputGroup className="mb-4">
                                            <InputGroupText>
                                                <FaLock />
                                            </InputGroupText>
                                            <Input
                                                onChange={(e) =>
                                                    setPassword(e.currentTarget.value)
                                                }
                                                name="password"
                                                type="password"
                                                placeholder="Password"
                                                autoComplete="current-password"
                                            />
                                        </InputGroup>
                                        {loginStatus === 'loading' ? (
                                            <CRow className="justify-content-center">
                                                <Loading size="3x"></Loading>
                                            </CRow>
                                        ) : (
                                            ''
                                        )}
                                        <Row>
                                            <Col xs="6">
                                                <Button color="primary" className="px-4">
                                                    Login
                                                </Button>
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

export default Login
