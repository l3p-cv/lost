import React, { useEffect, useState } from 'react'
import actions from '../../actions'
import {Input, InputGroup, InputGroupAddon} from 'reactstrap'
import IconButton from '../../components/IconButton'
import { NotificationManager, NotificationContainer } from 'react-notifications'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import SelectFileButton from '../../components/SelectFileButton'

const CreateLabelTree = ({visLevel}) =>{
    const [createLabelName, setCreateLabelName] = useState("")
    const dispatch = useDispatch()
    const [createLabelDescription, setCreateLabelDescription] = useState("")
    const [createLabelAbbreviation, setCreateLabelAbbreviation] = useState("")
    const [createLabelExtId, setCreateLabelExtId] = useState("")
    const createMessage = useSelector(state => state.label.createLabelTreeMessage)
    useEffect(()=>{
        if (createMessage === 'success') {
            NotificationManager.success(`LabelTree created.`)
        } else if (createMessage !== '') {
            NotificationManager.error(createMessage)
        }
        dispatch(actions.cleanLabelMessages())
    }, [createMessage])

    const handleCreateLabelName = (e) => {
        setCreateLabelName(e.target.value)
    }
    const handleCreateLabelDescription = (e) =>{
        setCreateLabelDescription(e.target.value)
    }

    const handleCreateSave = (e)=> {
        if(createLabelName && createLabelDescription){
            const saveData = {
                is_root: true,
                name: createLabelName,
                description: createLabelDescription,
                abbreviation: createLabelAbbreviation,
                external_id: createLabelExtId,
                parent_leaf_id: undefined,
            }
    
            dispatch(actions.createLabelTree(saveData, visLevel))
        }

    }

    return (
            <>
                <InputGroup style={{ marginBottom: '10px', marginTop: '10px' }}>
                    <Input
                        type="text"
                        placeholder="name"
                        value={createLabelName}
                        onChange={handleCreateLabelName}
                    ></Input>
                    <Input
                        type="text"
                        placeholder="description"
                        value={createLabelDescription}
                        onChange={handleCreateLabelDescription}
                    ></Input>
                    <InputGroupAddon addonType="append">
                        <IconButton
                            color="primary"
                            onClick={handleCreateSave}
                            icon={faPlus}
                            text="Add"
                        />
                    </InputGroupAddon>
                    <InputGroupAddon addonType="append">
                        <SelectFileButton
                            accept='.csv'
                            onSelect={(file)=>{
                            }}
                            text="Import"
                        />
                    </InputGroupAddon>
                </InputGroup>
                <NotificationContainer />
            </>
    )
}

export default CreateLabelTree