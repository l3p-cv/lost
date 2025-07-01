import { CCol, CFormInput, CInputGroup, CRow } from '@coreui/react'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useRef, useState } from 'react'
import { useCreateLabel, useImportLabelTree } from '../../actions/label/label-api'
import IconButton from '../../components/IconButton'
import SelectFileButton from '../../components/SelectFileButton'

const CreateLabelTree = ({ visLevel }) => {
    const [createLabelName, setCreateLabelName] = useState('')
    const [createLabelDescription, setCreateLabelDescription] = useState('')
    const enableNotify = useRef(true)
    const { mutate: createLabelTree } = useCreateLabel()
    const { mutate: createLabelTreeFromFile } = useImportLabelTree()

    const handleCreateLabelName = (e) => {
        setCreateLabelName(e.target.value)
    }
    const handleCreateLabelDescription = (e) => {
        setCreateLabelDescription(e.target.value)
    }

    const handleCreateSave = () => {
        enableNotify.current = true
        if (createLabelName && createLabelDescription) {
            const saveData = {
                is_root: true,
                name: createLabelName,
                description: createLabelDescription,
                abbreviation: '',
                external_id: '',
                parent_leaf_id: undefined,
            }
            createLabelTree({ data: saveData, visLevel })
        }
    }

    return (
        <>
            <CRow>
                <CCol>
                    <CInputGroup style={{ marginBottom: '10px', marginTop: '10px' }}>
                        <CFormInput
                            type="text"
                            placeholder="Tree name"
                            value={createLabelName}
                            onChange={handleCreateLabelName}
                            className='treeName'
                        />
                        <CFormInput
                            type="text"
                            placeholder="Description"
                            value={createLabelDescription}
                            onChange={handleCreateLabelDescription}
                            className='treeDesc'
                        />
                        <IconButton
                            isOutline={true}
                            color="success"
                            onClick={handleCreateSave}
                            disabled={
                                createLabelName === '' || createLabelDescription === ''
                            }
                            icon={faPlus}
                            text="Add Label Tree"
                            className='treeAdd'
                        />
                    </CInputGroup>
                </CCol>
            </CRow>
            <CRow>
                <CCol className="justify-content-start d-flex">
                    <SelectFileButton
                        accept=".csv"
                        onSelect={(file) => {
                            createLabelTreeFromFile({ file, visLevel })
                        }}
                        text="Import Label Tree"
                        className="mb-3"
                        color='success'
                    />
                </CCol>
            </CRow>
        </>
    )
}

export default CreateLabelTree
