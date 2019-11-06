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
      case 'deleteUser':
        return (TableComponents.deleteButton(props.callback, row))
      case 'groups':
        return <TableComponents.GroupLabels row={row}/>
      case 'edit_user_name':
      case 'edit_email':
      case 'edit_password':
      case 'edit_confirm_password':

        return TableComponents.textInput(key, cell, props.callback)
      case 'edit_isDesigner':
      if (cell) {
        return TableComponents.checkIcon(props.callback)
      } else {
        return TableComponents.timesIcon(props.callback)
      }
      case 'edit_groups':
        return <TableComponents.GroupLabelsEditable row={row} callback={props.callback}/>
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
        {data.map((row,i)  => {
          return (
            <Table.Row
              key={row.user_name+  i}
            >
              {Object.keys(row).map((key,i) => {
                return (<Table.Cell style={{textAlign:'center'}} key={i}>{myCustomCell(row,key)}</Table.Cell>)
              })}
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}