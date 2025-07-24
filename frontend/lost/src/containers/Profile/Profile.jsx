import { faDotCircle } from '@fortawesome/free-regular-svg-icons'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOwnUser, useUpdateOwnUser } from '../../actions/user/user_api'
import BaseContainer from '../../components/BaseContainer'
import { CenteredSpinner } from '../../components/CenteredSpinner'
import IconButton from '../../components/IconButton'
import * as Notification from '../../components/Notification'
import { CCol, CForm, CFormInput, CFormLabel, CFormText, CInputGroup } from '@coreui/react'

const Profile = () => {
    const { t } = useTranslation()

    const { data: user, isLoading } = useOwnUser()
    const { mutate: updateOwnUser } = useUpdateOwnUser()

    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const submit = (e) => {
        e.preventDefault()
        if (confirmPassword !== password) {
            Notification.showError('Passwords are not equal')
            return
        }
        if (password && password.length < 5) {
            Notification.showError('Minimum 5 characters')
            return
        }
        updateOwnUser({
            email,
            first_name: firstName,
            last_name: lastName,
            password,
        })
    }

    useEffect(() => {
        if (user) {
            setEmail(user.email)
            setFirstName(user.first_name)
            setLastName(user.last_name)
        }
    }, [user])

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }

    const handleFirstNameChange = (e) => {
        setFirstName(e.target.value)
    }

    const handleLastNameChange = (e) => {
        setLastName(e.target.value)
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value)
    }

    if (isLoading) {
        return <CenteredSpinner />
    }

    return (
        user && (
            <BaseContainer>
                <CCol xs="12" md="12" lg="12">
                    <CForm onSubmit={submit}>
                        <CInputGroup>
                            <CCol md="3">
                                <CFormLabel htmlFor="myprofile-userName">
                                    {t('myProfile.user')}
                                </CFormLabel>
                            </CCol>
                            <CCol xs="12" md="5">
                                <CFormInput
                                    disabled
                                    defaultValue={user.user_name}
                                    type="text"
                                    name="myprofile-userName"
                                    placeholder=""
                                />
                                <CFormText className="help-block">
                                    {t('myProfile.usernameIsNotEditable')}
                                </CFormText>
                            </CCol>
                            <CCol xs="12" md="4">
                                <CFormInput
                                    disabled
                                    defaultValue={user.idx}
                                    type="text"
                                    name="myprofile-idx"
                                    placeholder=""
                                />
                                <CFormText className="help-block">
                                    {t('myProfile.userIdIsNotEditable')}
                                </CFormText>
                            </CCol>
                        </CInputGroup>
                        <CInputGroup>
                            <CCol md="3">
                                <CFormLabel htmlFor="myprofile-email">Email</CFormLabel>
                            </CCol>
                            <CCol xs="12" md="9">
                                <CFormInput
                                    disabled={user.is_external}
                                    defaultValue={email}
                                    onChange={handleEmailChange}
                                    type="email"
                                    id="myprofile-email"
                                    name="myprofile-email"
                                    placeholder="Enter email..."
                                    autoComplete="email"
                                />
                                <CFormText className="help-block">
                                    {t('myProfile.pleaseEnterYourEmail')}
                                </CFormText>
                            </CCol>
                        </CInputGroup>
                        <CInputGroup>
                            <CCol md="3">
                                <CFormLabel htmlFor="myprofile-name">Name</CFormLabel>
                            </CCol>
                            <CCol xs="12" md="5">
                                <CFormInput
                                    disabled={user.is_external}
                                    defaultValue={firstName}
                                    onChange={handleFirstNameChange}
                                    type="text"
                                    id="myprofile-firstName"
                                    name="myprofile-firstName"
                                    placeholder={t('myProfile.firstName')}
                                    autoComplete="firstName"
                                />
                                <CFormText className="help-block">
                                    {t('myProfile.pleaseEnterYourFirstName')}
                                </CFormText>
                            </CCol>
                            <CCol xs="12" md="4">
                                <CFormInput
                                    disabled={user.is_external}
                                    defaultValue={lastName}
                                    onChange={handleLastNameChange}
                                    type="text"
                                    id="myprofile-lastName"
                                    name="myprofile-lastName"
                                    placeholder={t('myProfile.lastName')}
                                    autoComplete="lastName"
                                />
                                <CFormText className="help-block">
                                    {t('myProfile.pleaseEnterYourLastName')}
                                </CFormText>
                            </CCol>
                        </CInputGroup>
                        <CInputGroup>
                            <CCol md="3">
                                <CFormLabel htmlFor="myprofile-password">
                                    {t('myProfile.password')}
                                </CFormLabel>
                            </CCol>
                            <CCol xs="12" md="9">
                                <CFormInput
                                    disabled={user.is_external}
                                    defaultValue={password}
                                    onChange={handlePasswordChange}
                                    type="password"
                                    id="myprofile-password"
                                    name="myprofile-password"
                                    placeholder={t('myProfile.password')}
                                    autoComplete="current-password"
                                />
                                <CFormText className="help-block">
                                    {t('myProfile.pleaseEnterNewPassword')}
                                </CFormText>
                            </CCol>
                        </CInputGroup>
                        <CInputGroup>
                            <CCol md="3">
                                <CFormLabel htmlFor="myprofile-confirm-password">
                                    {t('myProfile.confirmPassword')}
                                </CFormLabel>
                            </CCol>
                            <CCol xs="12" md="9">
                                <CFormInput
                                    defaultValue={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    type="password"
                                    id="myprofile-confirm-password"
                                    name="myprofile-confirm-password"
                                    placeholder={t('myProfile.password')}
                                    autoComplete="current-password"
                                />
                                <CFormText className="help-block">
                                    {t('myProfile.pleaseConfirmNewPassword')}
                                </CFormText>
                            </CCol>
                        </CInputGroup>
                        <IconButton
                            type="submit"
                            color="primary"
                            icon={faDotCircle}
                            text={t('myProfile.submit')}
                        />
                    </CForm>
                </CCol>
            </BaseContainer>
        )
    )
}
export default Profile
