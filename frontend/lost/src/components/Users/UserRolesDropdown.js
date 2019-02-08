import React, {Component} from 'react'
import {connect} from 'react-redux'
import {InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'
import {roles } from '../../settings'
import actions from '../../actions'

const {checkCreateUserRoles} = actions
class UserRolesDropdown extends Component {
    constructor(props) {
        super(props);

        this.toggle = this
            .toggle
            .bind(this);

        this.state = {
            rolesDropdownOpen: false,
            roles: roles
                .reduce((acc, curr) => {
                    acc[curr] = false
                    return acc
                }, {})
        };
        this.handleRolesCheckboxChange = this.handleRolesCheckboxChange.bind(this)

    }
    componentDidMount(){
        if (this.props.initRoles !== undefined && this.props.initRoles.length > 0){
            this.setState((state) => {
            const roles = state.roles
            this.props.initRoles.map((r) => {
                roles[r.name] = true
            })
            return { roles }
        })
        }
    }
    toggle() {
        this.setState({
            rolesDropdownOpen: !this.state.rolesDropdownOpen
        });
    }
    handleRolesCheckboxChange(event) {
        let target = event.target
        if (!(target instanceof HTMLInputElement)) {
            target = event
                .target
                .querySelector(`input[type="checkbox"]`)
        }
        const roleName = target.name
        const roles = this.state.roles
        const roleValue = roles[roleName]
        roles[roleName] = roleValue === true
            ? false
            : true // toggle
        const choosenRoles = Object
        .keys(roles)
        .filter(key => {
            if (roles[key]) {
                return true
            }
            return false
        })
        this.props.callback(this.props.rowInfo, choosenRoles)
    }
    renderChoosenRoles() {
        const roles = this.state.roles
        const choosenRoles = Object
            .keys(roles)
            .filter(key => {
                if (roles[key]) {
                    return true
                }
                return false
            })
        if (choosenRoles.length > 0) {
            return (
                <React.Fragment>
                    {choosenRoles.map((role) => `${role},`)
                        .join(' ')
                        .slice(0, -1)}
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    Roles
                </React.Fragment>
            )
        }
    }
    
    render() {
        return (
            <InputGroupButtonDropdown addonType="append" isOpen={this.state.rolesDropdownOpen} toggle={this.toggle}>
                <DropdownToggle caret>
                    {this.renderChoosenRoles()}
                </DropdownToggle>
                <DropdownMenu>
                    {roles
                        .map((role) => {
                            return (
                                <DropdownItem key={role} onClick={this.handleRolesCheckboxChange}>
                                    <input
                                        type="checkbox"
                                        name={role}
                                        value={role}
                                        defaultChecked={this.state.roles[role]
                                        ? true
                                        : false}/>{` ${role}`}
                                </DropdownItem>
                            )
                        })}
                </DropdownMenu>
            </InputGroupButtonDropdown>
        )
    }
}

export default connect(null, {checkCreateUserRoles})(UserRolesDropdown)