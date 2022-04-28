import React, { useEffect, useState } from 'react'
import BaseModal from '../../components/BaseModal'
import Datatable from '../../components/Datatable'
import { Input } from 'reactstrap'
import IconButton from '../../components/IconButton'
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons'
import actions from '../../actions'
import validator from 'validator'
import { useDispatch, useSelector } from 'react-redux'
import * as Notification from '../../components/Notification'
import * as REQUEST_STATUS from '../../types/requestStatus'
// import { roles } from '../../lost_settings'

const CenteredCell = ({ children, key }) => {
    return (
        <div
            key={key}
            style={{
                textAlign: 'center',
                position: 'relative',
                top: '50%',
                transform: 'translateY(-50%)',
            }}
        >
            {children}
        </div>
    )
}

const ErrorLabel = ({ text }) => (
    <p style={{ marginTop: 30, marginBottom: 0, padding: 0, color: 'red' }}>{text}</p>
)

const ExternalUserLabel = ({ text }) => (
    <p style={{ marginTop: 30, marginBottom: 0, padding: 0, color: 'blue' }}>{text}</p>
)

const EditUserModal = (props) => {
    const roles = useSelector((state) => state.lost.roles)
    const dispatch = useDispatch()
    const userRaw = props.user[0]
    // userModified.roles = userModified.roles.map(el=>el.name)
    const [user, setUser] = useState(userRaw)
    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [passwordConfirmError, setPasswordConfirmError] = useState(false)
    const [usernameError, setUsernameError] = useState(false)
    const [focusedField, setFocusedFieled] = useState()
    const groups = useSelector((state) => state.group.groups)
    const updateUserStatus = useSelector((state) => state.user.updateUserStatus)
    useEffect(() => {
        Notification.networkRequest(updateUserStatus)
        if (updateUserStatus.status === REQUEST_STATUS.SUCCESS) {
            props.closeModal()
        }
    }, [updateUserStatus])

    const userNameField = () => {
        return (
            <>
                <CenteredCell>
                    <Input
                        autoFocus={focusedField == 0}
                        placeholder="Username"
                        disabled={!props.isNewUser}
                        defaultValue={user.user_name}
                        onChange={(e) => {
                            setFocusedFieled(0)
                            setUser({
                                ...user,
                                user_name: e.currentTarget.value,
                            })
                        }}
                    />
                </CenteredCell>
                {usernameError ? <ErrorLabel text={usernameError} /> : null}
            </>
        )
    }

    const emailField = () => (
        <>
            <CenteredCell>
                <Input
                    autoFocus={focusedField == 1}
                    placeholder="example@example.com"
                    defaultValue={user.email}
                    disabled={user.is_external}
                    onChange={(e) => {
                        setFocusedFieled(1)
                        setUser({ ...user, email: e.currentTarget.value })
                    }}
                />
            </CenteredCell>
            {user.is_external ? <ExternalUserLabel text="External user" /> : null}
            {emailError ? <ErrorLabel text="Email is not valid" /> : null}
        </>
    )

    const passwordField = () => (
        <>
            <CenteredCell>
                <Input
                    autoFocus={focusedField == 2}
                    placeholder="*******"
                    type="password"
                    defaultValue={user.password}
                    disabled={user.is_external}
                    onChange={(e) => {
                        setFocusedFieled(2)
                        setUser({ ...user, password: e.currentTarget.value })
                    }}
                />
            </CenteredCell>
            {user.is_external ? <ExternalUserLabel text="External user" /> : null}
            {passwordError ? <ErrorLabel text={passwordError} /> : null}
        </>
    )

    const confirmPasswordField = () => (
        <>
            <CenteredCell>
                <Input
                    autoFocus={focusedField == 3}
                    placeholder="*******"
                    type="password"
                    defaultValue={user.confirmPassword}
                    disabled={user.is_external}
                    onChange={(e) => {
                        setFocusedFieled(3)
                        setUser({
                            ...user,
                            confirmPassword: e.currentTarget.value,
                        })
                    }}
                />
            </CenteredCell>
            {passwordConfirmError ? <ErrorLabel text="Passwords do not match" /> : null}
        </>
    )

    const rolesField = () => {
        return roles.map((guiSetupRole) => {
            const isActive =
                user.roles.filter((role) => role.name === guiSetupRole).length > 0
            return (
                <Datatable.RenderBadge
                    key={`user-${user.idx}-role-${guiSetupRole}`}
                    text={guiSetupRole}
                    color={isActive ? 'success' : 'secondary'}
                    onClick={() => {
                        setUser({
                            ...user,
                            roles: isActive
                                ? user.roles.filter((role) => role.name !== guiSetupRole)
                                : [...user.roles, { name: guiSetupRole }],
                        })
                    }}
                />
            )
        })
    }

    const groupField = () => {
        return groups.map((el) => {
            const isActive =
                user.groups.filter((group) => group.idx === el.idx).length > 0
            return (
                <Datatable.RenderBadge
                    key={`user-${user.idx}-group-${el.idx}`}
                    text={el.name}
                    color={isActive ? 'success' : 'secondary'}
                    onClick={() => {
                        setUser({
                            ...user,
                            groups: isActive
                                ? user.groups.filter((group) => group.idx !== el.idx)
                                : [...user.groups, el],
                        })
                    }}
                />
            )
        })
    }

    const save = () => {
        let isError = false
        if (!validator.isEmail(user.email)) {
            setEmailError(true)
            isError = true
        } else {
            setEmailError(false)
        }

        if (props.isNewUser && user.user_name.length < 2) {
            setUsernameError('Min 2 character')
            isError = true
        } else {
            setUsernameError(false)
        }

        if (user.password || props.isNewUser) {
            if (user.password.length < 5) {
                isError = true
                setPasswordError('Min 5 character')
            } else {
                setPasswordError(false)
            }
            if (user.password !== user.confirmPassword) {
                setPasswordConfirmError(true)
                isError = true
            } else {
                setPasswordConfirmError(false)
            }
        } else {
            setPasswordError(false)
        }

        if (!isError) {
            // save user
            user.roles = user.roles.map((role) => role.name)
            user.groups = user.groups.map((group) => group.name)
            if (props.isNewUser) {
                dispatch(actions.createUser(user))
            } else {
                dispatch(actions.updateUser(user))
            }
        }
    }

    const cancel = () => {
        props.closeModal()
    }

    return (
        <BaseModal
            isOpen={props.isOpen}
            title="Edit User"
            toggle={props.closeModal}
            onClosed={props.onClosed}
            footer={
                <>
                    <IconButton
                        isOutline={false}
                        icon={faSave}
                        color="success"
                        text="Save"
                        onClick={save}
                    />
                    <IconButton
                        isOutline={false}
                        color="secondary"
                        icon={faTimes}
                        text="Close"
                        onClick={cancel}
                    ></IconButton>
                </>
            }
        >
            <Datatable
                noText={true}
                pageSize={1}
                showPagination={false}
                data={[user]}
                columns={[
                    {
                        Header: 'Username',
                        accessor: 'userName',
                        Cell: userNameField,
                    },
                    {
                        Header: 'Email',
                        accessor: 'email',
                        Cell: emailField,
                    },
                    {
                        Header: 'Password',
                        accessor: 'password',
                        Cell: passwordField,
                    },
                    {
                        Header: 'Confirm Password',
                        accessor: 'confirmPassword',
                        Cell: confirmPasswordField,
                    },
                    {
                        Header: 'Roles',
                        accessor: 'roles',
                        Cell: rolesField,
                    },
                    {
                        Header: 'Groups',
                        accessor: 'groups',
                        Cell: groupField,
                    },
                ]}
            />
        </BaseModal>
    )
}

export default EditUserModal
