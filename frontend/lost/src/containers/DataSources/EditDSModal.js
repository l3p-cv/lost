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
import { saveFs } from '../../access/fb'
// import { roles } from '../../lost_settings'
const ErrorLabel = ({ text }) => (
    <p style={{ marginTop: 30, marginBottom: 0, padding: 0, color: 'red' }}>{text}</p>
)

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
                        defaultValue={fs.name}
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
                        defaultValue={fs.rootPath}
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
                        // value={fs.connection}
                        placeholder={fs.connection}
                    />
                </FormGroup>
            </Form>
        </BaseModal>
    )
}

export default EditDSModal
