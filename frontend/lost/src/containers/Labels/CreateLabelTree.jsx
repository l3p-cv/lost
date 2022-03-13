import React, { useEffect, useState } from 'react'
import actions from '../../actions'
import {Input, InputGroup, InputGroupAddon} from 'reactstrap'
import IconButton from '../../components/IconButton'
import { NotificationManager, NotificationContainer } from 'react-notifications'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { connectAdvanced, useDispatch, useSelector } from 'react-redux'
import SelectFileButton from '../../components/SelectFileButton'


const csvToArray = (str, delimiter = ",") => {
    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  
    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
  
    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.map(function (row) {
      const values = row.split(delimiter);
      const el = headers.reduce(function (object, header, index) {
        object[header] = values[index];
        return object;
      }, {});
      return el;
    });
  
    // return the array
    return arr;
  }

  const parseElement = (element)=>{
    return {
        abbreviation: element.abbreviation === "" ? null: element.abbreviation,
        color: element.color === "" ? null: element.color,
        description: element.description,
        external_id: element.external_id === "" ? null : parseInt(element.external_id),
        group_id: element.group_id === "" ? null : parseInt(element.group_id),
        idx: parseInt(element.idx),
        children: [],
        is_deleted: element.is_deleted == "True" || element.is_root == "true" ,
        is_root: element.is_root == "True" || element.is_root == "true",
        name: element.name,
        parent_leaf_id: element.parent_leaf_id === "" ? null : parseInt(element.parent_leaf_id),
        timestamp: element.timestamp === "" ? null : element.timpstamp
    }
  }

  const treeFindAndAdd = (elementToInsert, element) =>{
      if (elementToInsert.parent_leaf_id === element.idx){
          element.children.push(parseElement(elementToInsert))
      }else{
        element.children.every(el=>{
            treeFindAndAdd(elementToInsert, el  )
        })
      }
  }


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
                            disabled={createLabelName == "" || createLabelDescription == ""}
                            icon={faPlus}
                            text="Add"
                        />
                    </InputGroupAddon>
                    <InputGroupAddon addonType="append">
                        <SelectFileButton
                            disabled={createLabelName == "" || createLabelDescription == ""}
                            accept='.csv'
                            onSelect={(file)=>{
                                const reader = new FileReader();
                                reader.onload = function (event) {
                                    const text = event.target.result
                                    const arr = csvToArray(text)
                                    const first = arr.shift()
                                    console.log("first")
                                    console.log(first)

                                    if(first.is_root == "True" || first.is_root == "true"){
                                        let obj = parseElement(first)
                                        arr.forEach(el => {
                                            treeFindAndAdd(parseElement(el), obj)
                                        })
                                        console.log("obj")
                                        console.log(obj)
                                        
                                    }else{
                                        throw new Error("Failed Parsing Csv File")
                                    }
                                    console.log("arr")
                                    console.log(arr)
                                  };
                                reader.readAsText(file);
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