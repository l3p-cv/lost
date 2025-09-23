import { CButton, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CFormText, CInputGroup, CRow } from '@coreui/react'
import { faAws, faMicrosoft } from '@fortawesome/free-brands-svg-icons'
import {
    faFile,
    faNetworkWired,
    faSave,
    faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import * as fbAPI from '../../actions/fb/fb_api'
import { useOwnUser } from '../../actions/user/user_api'
import BaseModal from '../../components/BaseModal'
import LostFileBrowser from '../../components/FileBrowser/LostFileBrowser'
import IconButton from '../../components/IconButton'
import * as Notification from '../../components/Notification'

const EditDSModal = ({
    isNewDs,
    fsList,
    selectedId,
    modalOpen,
    closeModal,
    onClosed,
    possibleFsTypes,
    visLevel,
}) => {
    const DUMMY_FS = {
        id: undefined,
        name: '',
        connection: '{}',
        fsType: 'file',
        rootPath: '',
        timestamp: '',
        visLevel: visLevel,
    }
    const [fs, setFs] = useState(DUMMY_FS)

    const [browseOpen, setBrowseOpen] = useState(false)
    const [browsePath, setBrowsePath] = useState(fs.rootPath)
    const { mutate: getFullFs, data: fullFs } = fbAPI.useGetFullFs()
    const { mutate: saveFs, status: saveFsStatus, error: saveFsError } = fbAPI.useSaveFs()
    const { data: ownUser, isLoading } = useOwnUser()

    // async function callGetFullFs(fs) {
    //     const fullFs = await getFullFs(fs)
    //     setFs(fullFs)
    // }

    useEffect(() => {
        if (fullFs) setFs({ ...fullFs, connection: JSON.stringify(fullFs.connection) })
    }, [fullFs])

    useEffect(() => {
        if (saveFsStatus === 'success') {
            closeModal()
            Notification.showSuccess('Saved datasource')
        } else if (saveFsStatus === 'error') {
            Notification.showError(`Error while saving datasource!\n${saveFsError}`)
        }
    }, [saveFsStatus])

    useEffect(() => {
        if (fsList && selectedId) {
            const sel = fsList.find((el) => {
                return el.id === selectedId
            })
            getFullFs(sel)
        }
    }, [fsList, selectedId])

    useEffect(() => {
        setBrowsePath(fs.rootPath)
    }, [fs])

    const save = () => {
        saveFs(fs)
    }

    const cancel = () => {
        closeModal()
    }

    const saveBrowse = () => {
        setFs({
            ...fs,
            rootPath: browsePath,
        })
        setBrowseOpen(false)
    }

    const cancelBrowse = () => {
        setBrowseOpen(false)
    }

    const loadPreset = (type) => {
        setFs({ ...fs, fsType: type })
        switch (type) {
            case 'file':
                setFs({ ...fs, fsType: type, connection: '{}' })
                break
            case 'abfs':
            case 'az':
                setFs({
                    ...fs,
                    fsType: type,
                    connection: `{
                            "connection_string": "DefaultEndpointsProtocol=https;AccountName=myAccountName;AccountKey=myAccountKey;EndpointSuffix=core.windows.net", 
                            "use_listings_cache": False
                        }`,
                })
                break
            case 's3a':
            case 's3':
                setFs({
                    ...fs,
                    fsType: type,
                    connection: `{
    'anon': False,
    'client_kwargs': {
        'endpoint_url': 'https://myBucketName.s3.eu-central-1.amazonaws.com.',
        'aws_access_key_id': 'myAwsAccessKeyId',
        'aws_secret_access_key': 'myAwsSecretAccessKey'
    }
}`,
                })
                break
            case 'ssh':
            case 'sftp':
                setFs({
                    ...fs,
                    fsType: type,
                    connection: `{
    'host': 'IP-Address',
    'username': 'my_user_name',
    'port': 22,
    'password': 'My-Secret-PW'
}`,
                })
                break
            case 'ftp':
                setFs({
                    ...fs,
                    fsType: type,
                    connection: `{
    'host': 'IP-Address',
    'username': 'my_user_name',
    'port': 21,
    'password': 'My-Secret-PW'
}`,
                })
                break
            default:
                setFs({ ...fs, connection: '{}' })
        }
    }
    const renderDsTypeButtons = () => {
        return (
            <>
                <CRow alignHorizontal="center" className="mb-2">
                    <b>Load Preset</b>
                </CRow>
                <CRow
                    alignHorizontal="center"
                    className="justify-content-center mb-3"
                    style={{ marginTop: 8, marginBottom: 20 }}
                >
                    {ownUser.roles.find((el) => el.name === 'Administrator') ? (
                        <CCol md={2}>
                            <IconButton
                                text="File"
                                isOutline={false}
                                icon={faFile}
                                style={{ marginRight: 8 }}
                                onClick={() => loadPreset('file')}
                            />
                        </CCol>
                    ) : (
                        ''
                    )}
                    <CCol md={2}>
                        <IconButton
                            text="S3 Bucket"
                            isOutline={false}
                            icon={faAws}
                            style={{ marginRight: 8 }}
                            onClick={() => loadPreset('s3')}
                        />
                    </CCol>
                    <CCol md={3}>
                        <IconButton
                            text="Azure Blob Storage"
                            isOutline={false}
                            icon={faMicrosoft}
                            style={{ marginRight: 8 }}
                            onClick={() => loadPreset('abfs')}
                        />
                    </CCol>
                    <CCol md={2}>
                        <IconButton
                            text="SSH/ SFTP"
                            isOutline={false}
                            icon={faNetworkWired}
                            style={{ marginRight: 8 }}
                            onClick={() => loadPreset('ssh')}
                        />
                    </CCol>
                    <CCol md={2}>
                        <IconButton
                            text="FTP"
                            isOutline={false}
                            icon={faNetworkWired}
                            style={{ marginRight: 8 }}
                            onClick={() => loadPreset('ftp')}
                        />
                    </CCol>
                </CRow>
                {/* <hr></hr> */}
            </>
        )
    }

    const renderBrowseModal = () => {
        if (!browseOpen) return null
        return (
            <BaseModal
                isOpen={browseOpen}
                title="Test Connection"
                toggle={() => setBrowseOpen(!browseOpen)}
                // onClosed={onClosed}
                footer={
                    <>
                        <IconButton
                            isOutline={false}
                            icon={faSave}
                            color="primary"
                            text="Save Root Path"
                            onClick={saveBrowse}
                        />
                    </>
                }
            >
                <LostFileBrowser
                    fs={fs}
                    onPathSelected={(path) => setBrowsePath(path)}
                    mode="lsTest"
                />
            </BaseModal>
        )
    }

    return (
        ownUser && (
            <div>
                <BaseModal
                    isOpen={modalOpen ? true : false}
                    title="Edit Datasource"
                    toggle={closeModal}
                    onClosed={onClosed}
                    footer={
                        <>
                            <IconButton
                                isOutline={false}
                                disabled={fs.name === '' || fs.rootPath === ''}
                                icon={faSave}
                                color="primary"
                                text="Save"
                                onClick={save}
                            />
                        </>
                    }
                >
                    {renderDsTypeButtons()}
                    <CForm>
                        <CFormLabel htmlFor="name">Datasource name</CFormLabel>
                        <CInputGroup>
                            <CFormInput
                                id="name"
                                // valid={false}
                                // invalid={false}
                                // defaultValue={''}
                                placeholder={'DS name'}
                                onChange={(e) => {
                                    setFs({ ...fs, name: e.target.value })
                                }}
                                value={fs.name}
                            />
                            <CFormText>Name of the datasource</CFormText>
                            {/* <CFormFeedback tooltip={true}>You will not be able to see this</CFormFeedback> */}
                            
                        </CInputGroup>
                        <CFormLabel htmlFor="rootPath">Root Path</CFormLabel>
                        <CInputGroup>
                                <CFormInput
                                    id="rootPath"
                                    valid={false}
                                    invalid={false}
                                    // defaultValue={''}
                                    placeholder={'Root path'}
                                    onChange={(e) => {
                                        setFs({ ...fs, rootPath: e.target.value })
                                    }}
                                    value={fs.rootPath}
                                />
                                <CButton
                                    style={{ height: '100%' }}
                                    color="primary"
                                    onClick={() => {
                                        setBrowseOpen(true)
                                    }}
                                >
                                    Test
                                </CButton>
                            {/* <CFormText>Example help text that remains unchanged.</CFormText> */}
                            {/* <FormFeedback>You will not be able to see this</FormFeedback> */}
                        </CInputGroup>
                        <CFormLabel htmlFor="name">Datasource Type</CFormLabel>
                        <CInputGroup>
                            <CFormSelect
                                type="select"
                                name="dsType"
                                id="dsType"
                                onChange={(e) => {
                                    setFs({ ...fs, fsType: e.target.value })
                                }}
                                // defaultValue={fs.fsType}
                                value={fs.fsType}
                            >
                                {(() => {
                                    if (!possibleFsTypes) return null
                                    return possibleFsTypes.map((el) => {
                                        return <option key={el}>{el}</option>
                                    })
                                })()}
                            </CFormSelect>
                            {/* <FormFeedback>You will not be able to see this</FormFeedback> */}
                        </CInputGroup>
                        {/* <CFormText>Example help text that remains unchanged.</CFormText> */}
                        <CFormLabel htmlFor="name">Connection String</CFormLabel>
                        <CInputGroup>
                            <CFormInput
                                type="textarea"
                                name="connection"
                                id="connection"
                                onChange={(e) => {
                                    setFs({ ...fs, connection: e.target.value })
                                }}
                                // defaultValue={fs.connection}
                                value={fs.connection}
                                placeholder={fs.connection}
                            />
                        </CInputGroup>
                    </CForm>
                </BaseModal>
                {renderBrowseModal()}
            </div>
        )
    )
}

export default EditDSModal
