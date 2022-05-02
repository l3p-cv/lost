import React, { useState, useEffect } from 'react'
import {
    Button,
    Card,
    CardBody,
    CardGroup,
    Col,
    Container,
    Form,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Row,
    Input,
} from 'reactstrap'
import { CRow } from '@coreui/react'
import { useHistory } from 'react-router-dom'
import { FaUser, FaLock } from 'react-icons/fa'
import actions from '../../actions'
import lostLogoColor from '../../assets/img/brand/lost_logo.png'
import backgroundImage from '../../assets/img/background.svg'
import errorResolver from '../../utils/errorResolver'
import Loading from '../../components/Loading'

const Login = () => {
    const {
        mutate: login,
        status: loginStatus,
        data: loginData,
        error: loginError,
    } = actions.useLogin()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorText, setErrorText] = useState()
    const history = useHistory()
    const submit = (e) => {
        e.preventDefault()
        login({
            password,
            userName: username,
        })
    }
    useEffect(() => {
        if (loginStatus === 'success') {
            localStorage.setItem('token', loginData.token)
            localStorage.setItem('refreshToken', loginData.refresh_token)
            history.push('/')
        } else if (loginStatus === 'error') {
            setErrorText(errorResolver(loginError))
        }
    }, [loginStatus])

    useEffect(() => {
        document.body.style.backgroundImage = `url(${backgroundImage})`
    })
    return (
        <div className="app flex-row align-items-center">
            <Container>
                <Row
                    style={{ margin: '10% 0% 5% 0%' }}
                    className="justify-content-center"
                >
                    <img width="500px" src={lostLogoColor} alt="" />
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
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <FaUser />
                                                </InputGroupText>
                                            </InputGroupAddon>
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
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <FaLock />
                                                </InputGroupText>
                                            </InputGroupAddon>
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
                                        <div className="text-red-600 text-center mb-4">
                                            {errorText}
                                        </div>
                                        {loginStatus === 'loading' ? (
                                            <CRow className="justify-content-center">
                                                <Loading></Loading>
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
