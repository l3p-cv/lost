import React, {Component} from 'react'
import {InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

class UserGroupDropdown extends Component {
    constructor(props) {
        super(props);

        this.toggle = this
            .toggle
            .bind(this);

        this.state = {
            groupDropdownOpen: false,
            groups: this
                .props
                .groups
                .reduce((acc, curr) => {
                    acc[curr] = false
                    return acc
                }, {})
        };

        this.handleGroupCheckboxChange = this
            .handleGroupCheckboxChange
            .bind(this)

    }
    componentDidMount() {
        if (this.props.initGroups !== undefined && this.props.initGroups.length > 0) {
            this.setState((state) => {
                const groups = state.groups
                this
                    .props
                    .initGroups
                    .map((g) => {
                        groups[g.name] = true
                    })
                return {groups}
            })
        }
    }
    toggle() {
        this.setState({
            groupDropdownOpen: !this.state.groupDropdownOpen
        });
    }
    handleGroupCheckboxChange(event) {
        let target = event.target
        if (!(target instanceof HTMLInputElement)) {
            target = event
                .target
                .querySelector(`input[type="checkbox"]`)
        }
        const groupName = target.name
        const groups = this.state.groups
        const groupValue = groups[groupName]
        groups[groupName] = groupValue === true
            ? false
            : true // toggle
        const choosenGroups = Object
            .keys(groups)
            .filter(key => {
                if (groups[key]) {
                    return true
                }
                return false
            })
        this
            .props
            .callback(this.props.rowInfo, choosenGroups)
    }
    renderChoosenGroups() {
        const groups = this.state.groups
        const choosenGroups = Object
            .keys(groups)
            .filter(key => {
                if (groups[key]) {
                    return true
                }
                return false
            })
        if (choosenGroups.length > 0) {
            return (
                <React.Fragment>
                    {choosenGroups.map((group) => `${group},`)
                        .join(' ')
                        .slice(0, -1)}
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    Groups
                </React.Fragment>
            )
        }
    }

    render() {
        return (
            <InputGroupButtonDropdown
                addonType="prepend"
                isOpen={this.state.groupDropdownOpen}
                toggle={this.toggle}>
                <DropdownToggle caret>
                    {this.renderChoosenGroups()}
                </DropdownToggle>
                <DropdownMenu>
                    {this
                        .props
                        .groups
                        .map((group) => {
                            return (
                                <DropdownItem key={group.name} onClick={this.handleGroupCheckboxChange}>
                                    <input
                                        type="checkbox"
                                        name={group.name}
                                        value={group.name}
                                        defaultChecked={this.state.groups[group.name]
                                        ? true
                                        : false}/>{` ${group.name}`}
                                </DropdownItem>
                            )
                        })}
                </DropdownMenu>
            </InputGroupButtonDropdown>
        )
    }
}

export default UserGroupDropdown