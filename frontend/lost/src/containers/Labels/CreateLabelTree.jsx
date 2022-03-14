import React, { useEffect, useRef, useState } from 'react'
import actions from '../../actions'
import {Input, InputGroup, InputGroupAddon} from 'reactstrap'
import IconButton from '../../components/IconButton'
import { NotificationManager, NotificationContainer } from 'react-notifications'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import SelectFileButton from '../../components/SelectFileButton'

// Source: https://stackoverflow.com/a/1293163/9310154
function csvToArray( strData, strDelimiter = "," ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
            ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
                );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[ 3 ];

        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}
  const parseElement = (element, header)=>{
    const colorIndex = header.indexOf("color")
    const abbreviationIndex = header.indexOf("abbreviation")
    const descriptionIndex = header.indexOf("description")
    const externalIdIndex = header.indexOf("external_id")
    const groupIdIndex = header.indexOf("group_id")
    const isDeletedIndex = header.indexOf("is_deleted")
    const isRootIndex = header.indexOf("is_root")
    const nameIndex = header.indexOf("name")
    const timestampIndex = header.indexOf("timestamp")
    return {
        abbreviation: element[abbreviationIndex] === "" ? null: element[abbreviationIndex],
        color: element[colorIndex] === "" ? null: element[colorIndex],
        description: element[descriptionIndex],
        external_id: element[externalIdIndex] === "" ? null : parseInt(element[externalIdIndex]),
        group_id: element[groupIdIndex] === "" ? null : parseInt(element[groupIdIndex]),
        // idx: parseInt(element.idx),
        children: [],
        is_deleted: element[isDeletedIndex] == "True" || element[isDeletedIndex] == "true" ,
        is_root: element[isRootIndex] == "True" || element[isRootIndex] == "true",
        name: element[nameIndex],
        // parent_leaf_id: element.parent_leaf_id === "" ? null : parseInt(element.parent_leaf_id),
        timestamp: element[timestampIndex] === "" ? null : element[timestampIndex]
    }
  }

  // is no longer needed. Converting from flat structure to tree structure will be done in backend. 
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
    const labelsToAdd = useRef([])
    const header = useRef()
    const enableNotify = useRef(true)
    const [createLabelExtId, setCreateLabelExtId] = useState("")
    const createMessage = useSelector(state => state.label.createLabelTreeMessage)
    const lastTree = useSelector(state=> state.label.trees.slice(-1)[0])
    useEffect(()=>{
        if(enableNotify.current){
            if (createMessage === 'success') {
                NotificationManager.success(`LabelTree created.`)
            } else if (createMessage !== '') {
                NotificationManager.error(createMessage)
            }
            dispatch(actions.cleanLabelMessages())
        }

    }, [createMessage])

    const handleCreateLabelName = (e) => {
        setCreateLabelName(e.target.value)
    }
    const handleCreateLabelDescription = (e) =>{
        setCreateLabelDescription(e.target.value)
    }

    const handleCreateSave = (e)=> {
        enableNotify.current = true
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

    useEffect(()=>{
        if(lastTree){
            let offset
            enableNotify.current = false
            while (labelsToAdd.current.length > 0){

                const next = labelsToAdd.current.shift()
                const parentLeafIdIndex = header.current.indexOf("parent_leaf_id")
                if(!offset){
                    offset =  parseInt(next[parentLeafIdIndex])
                }
                const parsed = parseElement(next, header.current)

                parsed.parent_leaf_id = lastTree.idx +  parseInt(next[parentLeafIdIndex]) - offset
                if(!Number.isInteger(parsed.parent_leaf_id)){
                    labelsToAdd.current = []
                }
                dispatch(actions.createLabelTree(parsed, visLevel))
            }
        }
    }, [lastTree])

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
                            accept='.csv'
                            onSelect={(file)=>{
                                const reader = new FileReader();
                                reader.onload = function (event) {
                                    const text = event.target.result
                                    const arr = csvToArray(text)
                                    // delete header
                                    header.current = arr.shift()
                                    // add Id to the start of the array because pandas.df export
                                    header.current.unshift("id")
                                    const first = arr.shift()
                                    const parsed = parseElement(first, header.current)
                                    // The Id from the tree is needed. The remaining Labels were added afterwards in useEffect hook. 
                                    dispatch(actions.createLabelTree(parsed, visLevel))
                                    labelsToAdd.current =  arr
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