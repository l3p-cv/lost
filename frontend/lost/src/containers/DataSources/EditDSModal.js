import React, { useEffect, useState } from 'react'
import { Form, FormGroup, Label, Input, FormFeedback, FormText } from 'reactstrap'
import BaseModal from '../../components/BaseModal'
import Datatable from '../../components/Datatable'
import IconButton from '../../components/IconButton'
import { faSave, faBan } from '@fortawesome/free-solid-svg-icons'
import actions from '../../actions'
import validator from 'validator'
import { useDispatch, useSelector } from 'react-redux'
import * as Notification from '../../components/Notification'
import * as REQUEST_STATUS from '../../types/requestStatus'
// import { roles } from '../../lost_settings'
const ErrorLabel = ({ text }) => (
    <p style={{ marginTop: 30, marginBottom: 0, padding: 0, color: 'red' }}>
        {text}
    </p>
)

const EditDSModal  = ({isNewDs, fsList, selectedId, modalOpen, closeModal, onClosed}) => {
    // const roles = useSelector(state=>state.lost.roles)
    // const dispatch = useDispatch()
    // const userRaw = props.user[0]
    // userModified.roles = userModified.roles.map(el=>el.name)
    const [possibleFsTypes, setPossibleFsTypes] = useState([
        'file',
        'abfs'
    ])
    const [fs, setFs] = useState({
        id : undefined,
        name : undefined,
        connection : undefined
    })
    // const [user, setUser] = useState(userRaw)
    // const [emailError, setEmailError] = useState(false)
    // const [passwordError, setPasswordError] = useState(false)
    // const [passwordConfirmError, setPasswordConfirmError] = useState(false)
    // const [usernameError, setUsernameError] = useState(false)
    // const [focusedField, setFocusedFieled] = useState()
    // const groups = useSelector((state) => state.group.groups)
    const updateUserStatus = useSelector((state) => state.user.updateUserStatus)
    useEffect(() => {
        Notification.networkRequest(updateUserStatus)
        if (updateUserStatus.status === REQUEST_STATUS.SUCCESS) {
            closeModal()
        }
    }, [updateUserStatus])

    useEffect(() => {
        if (fsList && selectedId){
            const sel = fsList.find(el => {
                return el.id == selectedId
            })
            console.log('selectedFS: ', sel)
            setFs(sel)
        }
    }, [fsList, selectedId])

    // useEffect(()=> {
    //     console.log('EditDSModal modalOpen', modalOpen)
    // }, [modalOpen])

    // const userNameField = () => {
    //     return (
    //         <>
    //             <Datatable.centeredCell>
    //                 <Input
    //                     autoFocus={focusedField == 0}
    //                     placeholder="Username"
    //                     disabled={!props.isNewDS}
    //                     defaultValue={user.user_name}
    //                     onChange={(e) => {
    //                         setFocusedFieled(0)
    //                         setUser({
    //                             ...user,
    //                             user_name: e.currentTarget.value
    //                         })
    //                     }
    //                     }
    //                 />
    //             </Datatable.centeredCell>
    //             {usernameError ? <ErrorLabel text={usernameError} /> : null}
    //         </>
    //     )
    // }

    // const emailField = () => (
    //     <>
    //         <Datatable.centeredCell>
    //             <Input
    //                 autoFocus={focusedField == 1}
    //                 placeholder="example@example.com"
    //                 defaultValue={user.email}
    //                 onChange={(e) => {
    //                     setFocusedFieled(1)
    //                     setUser({ ...user, email: e.currentTarget.value })
    //                 }}
    //             />
    //         </Datatable.centeredCell>
    //         {emailError ? <ErrorLabel text="Email is not valid" /> : null}
    //     </>
    // )

    // const passwordField = () => (
    //     <>
    //         <Datatable.centeredCell>
    //             <Input
    //                 autoFocus={focusedField == 2}
    //                 placeholder="*******"
    //                 type="password"
    //                 defaultValue={user.password}
    //                 onChange={(e) => {
    //                     setFocusedFieled(2)
    //                     setUser({ ...user, password: e.currentTarget.value })
    //                 }}
    //             />
    //         </Datatable.centeredCell>
    //         {passwordError ? <ErrorLabel text={passwordError} /> : null}
    //     </>
    // )

    // const confirmPasswordField = () => (
    //     <>
    //         <Datatable.centeredCell>
    //             <Input
    //                 autoFocus={focusedField == 3}
    //                 placeholder="*******"
    //                 type="password"
    //                 defaultValue={user.confirmPassword}
    //                 onChange={(e) =>{
    //                     setFocusedFieled(3)
    //                     setUser({
    //                         ...user,
    //                         confirmPassword: e.currentTarget.value
    //                     })
    //                 }
    //                 }
    //             />
    //         </Datatable.centeredCell>
    //         {passwordConfirmError ? (
    //             <ErrorLabel text="Passwords do not match" />
    //         ) : null}
    //     </>
    // )

    // const rolesField = () => {
    //     return roles.map((guiSetupRole) => {
    //         const isActive =
    //             user.roles.filter((role) => role.name === guiSetupRole).length >
    //             0
    //         return Datatable.renderBadge(
    //             `user-${user.idx}-role-${guiSetupRole}`,
    //             guiSetupRole,
    //             isActive ? 'success' : 'secondary',
    //             () => {
    //                 setUser({
    //                     ...user,
    //                     roles: isActive
    //                         ? user.roles.filter(
    //                             (role) => role.name !== guiSetupRole
    //                         )
    //                         : [...user.roles, { name: guiSetupRole }]
    //                 })
    //             }
    //         )
    //     })
    // }

    // const groupField = () => {
    //     return groups.map((el) => {
    //         const isActive =
    //             user.groups.filter((group) => group.idx === el.idx).length > 0
    //         return Datatable.renderBadge(
    //             `user-${user.idx}-group-${el.idx}`,
    //             el.name,
    //             isActive ? 'success' : 'secondary',
    //             () => {
    //                 setUser({
    //                     ...user,
    //                     groups: isActive
    //                         ? user.groups.filter(
    //                             (group) => group.idx !== el.idx
    //                         )
    //                         : [...user.groups, el]
    //                 })
    //             }
    //         )
    //     })
    // }

    const save = () => {
        let isError = false
        // if (!validator.isEmail(user.email)) {
        //     setEmailError(true)
        //     isError = true
        // } else {
        //     setEmailError(false)
        // }

        // if (isNewDs && user.user_name.length < 2) {
        //     setUsernameError('Min 2 character')
        //     isError = true
        // } else {
        //     setUsernameError(false)
        // }

        // if (user.password || isNewDs) {
        //     if (user.password.length < 5) {
        //         isError = true
        //         setPasswordError('Min 5 character')
        //     } else {
        //         setPasswordError(false)
        //     }
        //     if (user.password !== user.confirmPassword) {
        //         setPasswordConfirmError(true)
        //         isError = true
        //     } else {
        //         setPasswordConfirmError(false)
        //     }
        // } else {
        //     setPasswordError(false)
        // }

        // if (!isError) {
        //     // save user
        //     user.roles = user.roles.map((role) => role.name)
        //     user.groups = user.groups.map((group) => group.name)
        //     if (isNewDs) {
        //         dispatch(actions.createUser(user))
        //     } else {
        //         dispatch(actions.updateUser(user))
        //     }
        // }
    }

    const cancel = () => {
        closeModal()
    }

    return (
        // console.log()
        <BaseModal
            isOpen={modalOpen?true:false}
            title="Edit Datasource"
            toggle={closeModal}
            onClosed={onClosed}
            footer={
                <>
                    <IconButton
                        icon={faBan}
                        color="warning"
                        text="Cancel"
                        onClick={cancel}
                    />
                    <IconButton
                        icon={faSave}
                        color="success"
                        text="Save"
                        onClick={save}
                    />
                </>
            }
        >
            <Form>
                <FormGroup>
                    <Label for="name">Datasource name</Label>
                    <Input id="name" valid={false} invalid={false} 
                        defaultValue={''} 
                        placeholder={'DS name'} 
                        onChange={(e) => console.log('test changed', e.target.value)} 
                        defaultValue={fs.name}
                    />
                    <FormFeedback>You will not be able to see this</FormFeedback>
                    <FormText>Example help text that remains unchanged.</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="dsType">Datasource type</Label>
                    <Input type="select" 
                        name="dsType" 
                        id="dsType" 
                        onChange={e => console.log('select ', e.target.value)}
                        defaultValue={fs.fsType}
                    >
                        {possibleFsTypes.map(el => {
                            return <option key={el}>{el}</option>
                        })}
                    </Input>
                    <FormFeedback>You will not be able to see this</FormFeedback>
                    <FormText>Example help text that remains unchanged.</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="connection">Connection String</Label>
                    <Input type="textarea" name="connection" id="connection"
                        onChange={e => console.log('textarea', e.target.value)}
                        defaultValue={fs.connection}
                        // value={fs.connection}
                        placeholder={fs.connection}
                    />
                </FormGroup>
            </Form>
        </BaseModal>
    )
}


export default EditDSModal