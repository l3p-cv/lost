import React, { useEffect, useState } from 'react'
import { Form, FormGroup, Label, Input, FormFeedback, FormText } from 'reactstrap'
import BaseModal from '../../components/BaseModal'
import IconButton from '../../components/IconButton'
import { faSave, faBan, faFile } from '@fortawesome/free-solid-svg-icons'
import {
    faAws,
    faDropbox,
    faGoogleDrive,
    faMicrosoft,
} from '@fortawesome/free-brands-svg-icons'
import * as Notification from '../../components/Notification'
import { CRow } from '@coreui/react'
import { saveFs } from '../../access/fb'

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
        name: undefined,
        connection: '{}',
        fsType: 'file',
        rootPath: undefined,
        timestamp: undefined,
        visLevel: visLevel,
    }
    const [fs, setFs] = useState(DUMMY_FS)

    useEffect(() => {
        if (fsList && selectedId) {
            const sel = fsList.find((el) => {
                return el.id == selectedId
            })
            console.log('selectedFS: ', sel)
            setFs(sel)
        }
    }, [fsList, selectedId])

    useEffect(() => {
        console.log('fs changed', fs)
    }, [fs])

    const save = () => {
        saveFs(fs)
        Notification.showSuccess('Saved datasource')
        closeModal()
    }

    const cancel = () => {
        closeModal()
    }

    const loadPreset = (type) => {
        setFs({ ...fs, fsType: type })
        switch (type) {
            case 'file':
                setFs({ ...fs, fsType: type, connection: '{}' })
                break
            case 'abfs':
                setFs({
                    ...fs,
                    fsType: type,
                    connection:
                        '{"connection_string": "DefaultEndpointsProtocol=https;AccountName=myAccountName;AccountKey=myAccountKey;EndpointSuffix=core.windows.net"}',
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
                        text="Dropbox"
                        isOutline={false}
                        icon={faDropbox}
                        style={{ marginRight: 8 }}
                        onClick={() => loadPreset('dropbox')}
                    />
                    <IconButton
                        text="Google Drive"
                        isOutline={false}
                        icon={faGoogleDrive}
                        style={{ marginRight: 8 }}
                        onClick={() => loadPreset('gdrive')}
                    />
                </CRow>
                {/* <hr></hr> */}
            </>
        )
    }
    return (
        // console.log()
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
                        valid={false}
                        invalid={false}
                        defaultValue={''}
                        placeholder={'DS name'}
                        onChange={(e) => {
                            setFs({ ...fs, name: e.target.value })
                        }}
                        value={fs.name}
                    />
                    <FormFeedback>You will not be able to see this</FormFeedback>
                    <FormText>Example help text that remains unchanged.</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="rootPath">Root path</Label>
                    <Input
                        id="rootPath"
                        valid={false}
                        invalid={false}
                        defaultValue={''}
                        placeholder={'Root path'}
                        onChange={(e) => {
                            setFs({ ...fs, rootPath: e.target.value })
                        }}
                        value={fs.rootPath}
                    />
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
                        defaultValue={fs.fsType}
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
                        defaultValue={fs.connection}
                        value={fs.connection}
                        placeholder={fs.connection}
                    />
                </FormGroup>
            </Form>
        </BaseModal>
    )
}

export default EditDSModal
