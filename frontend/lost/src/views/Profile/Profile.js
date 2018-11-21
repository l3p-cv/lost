import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Form,
    FormGroup,
    FormText,
    Input,
    Label
} from 'reactstrap';
import {NotificationManager, NotificationContainer} from 'react-notifications'
import 'react-notifications/lib/notifications.css';
const {getOwnUser, updateOwnUser, cleanUpdateOwnUserMessage} = actions

class MyProfile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            idx: '',
            user_name: '',
            email: '',
            first_name: '',
            last_name: '',
            password: '',
        }
        this.handleEmailChange = this
            .handleEmailChange
            .bind(this)
        this.handleFirstNameChange = this
            .handleFirstNameChange
            .bind(this)
        this.handleLastNameChange = this
            .handleLastNameChange
            .bind(this)
        this.handlePasswordChange = this
            .handlePasswordChange
            .bind(this)
        this.handleSubmit = this
            .handleSubmit
            .bind(this)
        this.callback = this
            .callback
            .bind(this)
    }
    componentDidMount(){
        this.props.getOwnUser(this.callback)
    }
    componentDidUpdate(){
        if (this.props.updateOwnMessage === 'success') {
            NotificationManager.success(`User successfully updated.`)
        } else if (this.props.updateOwnMessage !== '') {
            NotificationManager.error(this.props.updateOwnMessage)
        }
        this
            .props
            .cleanUpdateOwnUserMessage()
    }
    callback() {
        const {idx, user_name, email, first_name, last_name} = this.props.ownUser
        this.setState({idx, user_name, email, first_name, last_name})
    }

    handleSubmit() {
        this.props.updateOwnUser(this.state)
    }
    handleEmailChange(event) {
        this.setState({email: event.target.value});
    }
    handleFirstNameChange(event) {
        this.setState({first_name: event.target.value});
    }
    handleLastNameChange(event) {
        this.setState({last_name: event.target.value});
    }
    handlePasswordChange(event) {
        this.setState({password: event.target.value});
    }

    render() {
        return (
            <Col xs="12" md="12" lg="12">
                <Card>
                    <CardHeader>
                        <strong>My Profile</strong>
                    </CardHeader>
                    <CardBody>
                        <Form className="form-horizontal">
                            <FormGroup row>
                                <Col md="3">
                                    <Label htmlFor="myprofile-user_name">User</Label>
                                </Col>
                                <Col xs="12" md="5">
                                    <Input
                                        disabled
                                        value={this.state.user_name}
                                        type="text"
                                        name="myprofile-user_name"
                                        placeholder=""/>
                                    <FormText className="help-block">Username is not editable</FormText>
                                </Col>
                                <Col xs="12" md="4">
                                    <Input
                                        disabled
                                        value={this.state.idx}
                                        type="text"
                                        name="myprofile-idx"
                                        placeholder=""/>
                                    <FormText className="help-block">User id is not editable</FormText>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col md="3">
                                    <Label htmlFor="myprofile-email">Email</Label>
                                </Col>
                                <Col xs="12" md="9">
                                    <Input
                                        value={this.state.email}
                                        onChange={this.handleEmailChange}
                                        type="email"
                                        id="myprofile-email"
                                        name="myprofile-email"
                                        placeholder="Enter email..."
                                        autoComplete="email"/>
                                    <FormText className="help-block">Please enter your email</FormText>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col md="3">
                                    <Label htmlFor="myprofile-name">Name</Label>
                                </Col>
                                <Col xs="12" md="5">
                                    <Input
                                        value={this.state.first_name}
                                        onChange={this.handleFirstNameChange}
                                        type="first_name"
                                        id="myprofile-first_name"
                                        name="myprofile-first_name"
                                        placeholder="Enter first name..."
                                        autoComplete="first_name"/>
                                    <FormText className="help-block">Please enter your first name</FormText>
                                </Col>
                                <Col xs="12" md="4">
                                    <Input
                                        value={this.state.last_name}
                                        onChange={this.handleLastNameChange}
                                        type="last_name"
                                        id="myprofile-last_name"
                                        name="myprofile-last_name"
                                        placeholder="Enter last name..."
                                        autoComplete="last_name"/>
                                    <FormText className="help-block">Please enter your last name</FormText>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col md="3">
                                    <Label htmlFor="myprofile-password">Password</Label>
                                </Col>
                                <Col xs="12" md="9">
                                    <Input
                                        value={this.state.password}
                                        onChange={this.handlePasswordChange}
                                        type="password"
                                        id="myprofile-password"
                                        name="myprofile-password"
                                        placeholder="Enter new password..."
                                        autoComplete="current-password"/>
                                    <FormText className="help-block">Please enter your password</FormText>
                                </Col>
                            </FormGroup>
                        </Form>
                    </CardBody>
                    <CardFooter>
                        <Button type="submit" onClick={this.handleSubmit} size="sm" color="primary">
                            <i className="fa fa-dot-circle-o"></i>
                            Submit</Button>
                    </CardFooter>
                </Card>
                <NotificationContainer/>
            </Col>
        )
    }
}

function mapStateToProps(state) {
    return {ownUser: state.user.ownUser, updateOwnMessage: state.user.updateOwnMessage}
}

export default connect(mapStateToProps, {getOwnUser, updateOwnUser, cleanUpdateOwnUserMessage})(MyProfile)