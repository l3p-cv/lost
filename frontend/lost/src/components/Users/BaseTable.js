import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { Table, Icon, Button } from 'semantic-ui-react'
import * as TableComponents from './TableComponents'

// ToDo: key in array.map()

/**
* tableData: {header: [{title: Age, key: age}, ...], data:[{age: 12,...}, ...]}
* @param {{tableData : object, callback: function }} props 
*/
export default function BaseTable(props) {
  const tableKeysHeader = props.tableData.header
  const [column, setColumn] = useState("");
  const allowedKeys = props.tableData.header.map(el => el.key);
  const filteredData = props.tableData.data.map(data => {
    let myobj = {}
    allowedKeys.forEach(key => {
      myobj = { ...myobj, ...{ [key]: data[key] } }
    })
    return myobj
  })
  const [data, setData] = useState(filteredData);
  const [direction, setDirection] = useState("");

  const handleSort = clickedColumn => {
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

  const myCustomCell = (row, key) => {
    const cell = row[key]
    switch (key) {
      case 'isDesigner':
        // :TODO
        if (cell) {
          return TableComponents.checkIcon()
        } else {
          return TableComponents.timesIcon()
        }

      case 'isAnnotator':
        if (cell) {
          return TableComponents.checkIcon()
        } else {
          return TableComponents.timesIcon()
        }
      case 'edit':
        return (TableComponents.editButton(props.callback, row))
      case 'edit_user_name':
        return TableComponents.textInput("edit_user_name", cell, props.callback)
      case 'edit_email':
      return TableComponents.textInput("edit_email", cell, props.callback)
      case 'edit_password':
      return TableComponents.textInput("edit_password", cell, props.callback)
      case 'edit_confirm_password':
      return TableComponents.textInput("edit_confirm_password", cell, props.callback)
      case 'edit_isDesigner':
      if (cell) {
        return TableComponents.checkIcon()
      } else {
        return TableComponents.timesIcon()
      }
      default:
        return cell
    }
  }
  return (
    <Table sortable celled >
      <Table.Header>
        <Table.Row>
          {tableKeysHeader.map(header => {
            return (
              <Table.HeaderCell
                key={header.key}
                sorted={column === header.key ? direction : null}
                onClick={() => handleSort(header.key)}
              >
                {header.title}
              </Table.HeaderCell>
            )
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map(row => {
          return (
            <Table.Row
              key={row.user_name}
            >
              {Object.keys(row).map((key,i) => {
                return (<Table.Cell key={key}>{myCustomCell(row,key)}</Table.Cell>)
              })}
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}