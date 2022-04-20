import React, { useEffect, useState } from 'react'
import {
    Form,
    FormGroup,
    Label,
    Input,
    FormFeedback,
    FormText,
    Button,
    InputGroup,
} from 'reactstrap'
import BaseModal from '../../components/BaseModal'
import IconButton from '../../components/IconButton'
import { faSave, faBan, faFile, faNetworkWired } from '@fortawesome/free-solid-svg-icons'
import LostFileBrowser from '../../components/FileBrowser/LostFileBrowser'
import { faAws, faMicrosoft } from '@fortawesome/free-brands-svg-icons'
import * as Notification from '../../components/Notification'
import { CRow } from '@coreui/react'
// import { saveFs } from '../../access/fb'
import * as fbAPI from '../../actions/fb/fb_api'

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

    // async function callGetFullFs(fs) {
    //     const fullFs = await getFullFs(fs)
    //     setFs(fullFs)
    // }

    useEffect(() => {
        if (fullFs) setFs(fullFs)
    }, [fullFs])

    useEffect(() => {
        console.log('saveFsStatus', saveFsStatus)
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
                return el.id == selectedId
            })
            console.log('selectedFS: ', sel)
            // callGetFullFs(sel)
            getFullFs(sel)
        }
    }, [fsList, selectedId])

    useEffect(() => {
        console.log('fs changed', fs)
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
        console.log('Saved Root Path', browsePath)
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
                    connection:
                        '{"connection_string": "DefaultEndpointsProtocol=https;AccountName=myAccountName;AccountKey=myAccountKey;EndpointSuffix=core.windows.net"}',
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
            default:
                setFs({ ...fs, connection: '{}' })
        }
    }
    const renderDsTypeButtons = () => {
        return (
            <>
                <CRow alignHorizontal="center">
                    <b>Load Preset</b>
                </CRow>
                <CRow alignHorizontal="center" style={{ marginTop: 8, marginBottom: 20 }}>
                    <IconButton
                        text="File"
                        isOutline={false}
                        icon={faFile}
                        style={{ marginRight: 8 }}
                        onClick={() => loadPreset('file')}
                    />
                    <IconButton
                        text="S3 Bucket"
                        isOutline={false}
                        icon={faAws}
                        style={{ marginRight: 8 }}
                        onClick={() => loadPreset('s3')}
                    />
                    <IconButton
                        text="Azure Blob Storage"
                        isOutline={false}
                        icon={faMicrosoft}
                        style={{ marginRight: 8 }}
                        onClick={() => loadPreset('abfs')}
                    />
                    <IconButton
                        text="SSH/ SFTP"
                        isOutline={false}
                        icon={faNetworkWired}
                        style={{ marginRight: 8 }}
                        onClick={() => loadPreset('ssh')}
                    />
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
                            icon={faBan}
                            color="warning"
                            text="Cancel"
                            onClick={cancelBrowse}
                        />
                        <IconButton
                            icon={faSave}
                            color="success"
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
        // console.log()
        <div>
            <BaseModal
                isOpen={modalOpen ? true : false}
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
                {renderDsTypeButtons()}
                <Form>
                    <FormGroup>
                        <Label for="name">Datasource name</Label>
                        <Input
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
                        <FormFeedback>You will not be able to see this</FormFeedback>
                        <FormText>Name of the datasource</FormText>
                    </FormGroup>
                    <FormGroup>
                        <Label for="rootPath">Root path</Label>
                        <InputGroup>
                            <Input
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
                            <Button
                                color="primary"
                                onClick={() => {
                                    setBrowseOpen(true)
                                    console.log('fs', fs)
                                }}
                            >
                                Test
                            </Button>
                        </InputGroup>
                        <FormFeedback>You will not be able to see this</FormFeedback>
                        <FormText>Example help text that remains unchanged.</FormText>
                    </FormGroup>
                    <FormGroup>
                        <Label for="dsType">Datasource type</Label>
                        <Input
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
                        </Input>
                        <FormFeedback>You will not be able to see this</FormFeedback>
                        <FormText>Example help text that remains unchanged.</FormText>
                    </FormGroup>
                    <FormGroup>
                        <Label for="connection">Connection String</Label>
                        <Input
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
                    </FormGroup>
                </Form>
            </BaseModal>
            {renderBrowseModal()}
        </div>
    )
}

export default EditDSModal
