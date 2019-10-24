import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import {Table} from 'semantic-ui-react'



export default function BaseTable (props){
  console.log(props)
    const tableKeysHeader = props.tableData.header
  const [column, setColumn] = useState("");
    const allowedKeys = props.tableData.header.map(el=>el.key);
    const filteredData = props.tableData.data.map(data=>{
      return allowedKeys.map(key=>data[key]);
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
                    {row.map(cell=>{
                        return(<Table.Cell>{cell}</Table.Cell>)
                    })}
                </Table.Row>
                )
            })}
        </Table.Body>
      </Table>
    )
}