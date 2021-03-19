import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { useHistory } from 'react-router-dom'
import { FaUser, FaLock } from 'react-icons/fa'
import actions from '../actions'
import * as REQUEST_STATUS from '../types/requestStatus'

const Login = () => {
    const dispatch = useDispatch()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const history = useHistory()
    const submit = (e) => {
        e.preventDefault()
        dispatch(actions.login({ password, userName: username }))
    }
    const loginStatus = useSelector((state) => state.auth.loginStatus)

    useEffect(() => {
        console.log('loginStatus')
        console.log(loginStatus)
        if (loginStatus.status === REQUEST_STATUS.SUCCESS) {
            history.push('/')
        }
    }, [loginStatus])
    return (
        <div className="app flex-row align-items-center">
            <Container>
                <Row style={{ margin: '10% 0% 7% 0%' }} className="justify-content-center">
                    <img width="400px"  alt="" />
                </Row>
                <Row className="justify-content-center">
                    <Col md="4">
                        <CardGroup>
                            <Card className="p-4">
                                <CardBody>
                                    <Form onSubmit={submit}>
                                        <h1>Login</h1>
                                        <p className="text-muted">Sign In to your account</p>
                                        <InputGroup className="mb-3">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <FaUser />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                onChange={(e) => setUsername(e.currentTarget.value)}
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
                                                onChange={(e) => setPassword(e.currentTarget.value)}
                                                name="password"
                                                type="password"
                                                placeholder="Password"
                                                autoComplete="current-password"
                                            />
                                        </InputGroup>
                                        <Row>
                                            <Col xs="6">
                                                <div>
                                                    {loginStatus.status === REQUEST_STATUS.FAILED
                                                        ? 'Wrong Credentials'
                                                        : ''}
                                                </div>
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
