import _ from 'lodash'
import React, { useState } from 'react'
import {Table} from 'semantic-ui-react'



export default function BaseTable (props){
    const tableKeysHeader = props.tableData.header
    console.log(tableKeysHeader)
	const [column, setColumn] = useState("");
    const [data, setData] = useState(props.tableData.data);
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
                    {Object.keys(row).map(cell=>{
                        return(<Table.Cell>{row[cell]}</Table.Cell>)
                    })}
                </Table.Row>
                )
            })}
        </Table.Body>
      </Table>
    )
}