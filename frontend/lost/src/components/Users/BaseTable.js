import _ from 'lodash'
import React, { useState } from 'react'
import {Table} from 'semantic-ui-react'

const tableData = [
    { name: 'John', age: 15, gender: 'Male' },
    { name: 'Amber', age: 40, gender: 'Female' },
    { name: 'Leslie', age: 25, gender: 'Other' },
    { name: 'Ben', age: 70, gender: 'Male' },
  ]

export default function BaseTable (){
	const [column, setColumn] = useState("");
    const [data, setData] = useState(tableData);
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
            <Table.HeaderCell
              sorted={column === 'name' ? direction : null}
              onClick={()=>handleSort('name')}
            >
              Name
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'age' ? direction : null}
              onClick={()=>handleSort('age')}
            >
              Age
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'gender' ? direction : null}
              onClick={()=>handleSort('gender')}
            >
              Gender
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {_.map(data, ({ age, gender, name }) => (
            <Table.Row key={name}>
              <Table.Cell>{name}</Table.Cell>
              <Table.Cell>{age}</Table.Cell>
              <Table.Cell>{gender}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
}