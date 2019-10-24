import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import {Table} from 'semantic-ui-react'



export default function BaseTable (props){
    const tableKeysHeader = props.tableData.header
    const [column, setColumn] = useState("");
    const allowedKeys = props.tableData.header.map(el=>el.key);
    const filteredData = props.tableData.data.map(data=>{
      let myobj = {}
      allowedKeys.forEach(key=>{
        myobj = {...myobj, ...{[key]: data[key]}}
      })
      return myobj
    })
    const [data, setData] = useState(filteredData);
    const [direction, setDirection] = useState("");

    const handleSort = clickedColumn =>{
        if (column !== clickedColumn) {
            setColumn(clickedColumn)
            setData(_.sortBy(data, [clickedColumn]))
            setDirection('ascending')
            return
          }
        setData(data.reverse())
        setDirection(direction === 'ascending' ? 'descending' : 'ascending')
    }

    useEffect(() => {
      setData(filteredData)
    }, [props.tableData.data]); // 

    const myCustomCell = (key,cell) => {
      switch (key){
        case 'designer': 
        case 'email': 
          return(<h1>{cell}</h1>)
        default:
          return cell
      }
    }
    return(
        <Table sortable celled fixed>
        <Table.Header>
          <Table.Row>
              {tableKeysHeader.map(header=>{
                  return (
                    <Table.HeaderCell
                    sorted={column === header.key ? direction : null}
                    onClick={()=>handleSort(header.key)}
                  >
                    {header.title}
                  </Table.HeaderCell>
                  )
              })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
            {data.map(row=>{
                return(
                <Table.Row>
                    {Object.keys(row).map(key=>{
                        return(<Table.Cell>{myCustomCell(key,row[key])}</Table.Cell>)
                    })}
                </Table.Row>
                )
            })}
        </Table.Body>
      </Table>
    )
}