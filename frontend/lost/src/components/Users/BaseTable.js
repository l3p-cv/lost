import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { Table, Icon, Button } from 'semantic-ui-react'
import * as TableComponents from './TableComponents'


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

  const myCustomCell = (key, cell) => {
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
        return (TableComponents.editIcon(props.callback))
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
              {Object.keys(row).map(key => {
                return (<Table.Cell key={key}>{myCustomCell(key, row[key])}</Table.Cell>)
              })}
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}