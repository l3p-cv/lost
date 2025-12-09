// TODO: PLEASE RENAME THIS!!!
import { CTable, CTableBody, CTableHead, CSpinner, CRow, CCol } from '@coreui/react'
// import BaseContainer from './BaseContainer'
import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React, { Fragment, useEffect } from 'react'
import PaginationWrapper from './Pagination/PaginationWrapper'

// const CoreDataTable = ( {tableData, columns} ) => { // TODO: rewrite as const???
function CoreDataTable({
  className = '',
  tableData = [],
  columns = [],
  usePagination = true,
  isLoading = false,
  pageCount = undefined,
  pageSize = 10,
  rowHeight = '55px',
  onPaginationChange = () => {},
  onColumnFiltersChange = () => {},
  pageIndex = 0,
  wholeData = true,
  paginationLarge = true,
  expanded = {},
  setExpanded = undefined,
  getRowClassName = () => '',
}) {
  const [columnFilters, setColumnFilters] = useState([])
  const [doRerender, setDoRerender] = useState(false)
  const [paginationState, setPaginationState] = useState(() => ({
    pageIndex: pageIndex,
    pageSize,
  }))
  // const [expanded, setExpanded] = React.useState({})
  const [dataTemp, setDataTemp] = useState([])

  useEffect(() => {
    const newPageCount = pageCount ?? table.getPageCount()
    const currentIndex = paginationState.pageIndex

    if (!Object.is(tableData, dataTemp)) {
      setDataTemp(tableData)
      // Only correct the page if it's actually out of range
      if (newPageCount > 0 && currentIndex >= newPageCount) {
        setPaginationState((prev) => ({
          ...prev,
          pageIndex: Math.max(0, newPageCount - 1),
        }))
      }
    }
  }, [tableData])

  useEffect(() => {
    onPaginationChange(table)
  }, [paginationState])

  const table = useReactTable({
    // data: (dataTemp.length === 0) ? dataTemp : tableData, // TODO: dataTemp
    data: dataTemp,
    manualPagination: pageCount !== undefined ? true : false,
    columns,
    state: {
      expanded,
      pagination: paginationState,
    },
    onPaginationChange: (updater) => {
      setPaginationState((old) => {
        const newState = typeof updater === 'function' ? updater(old) : updater
        return newState
      })
      onPaginationChange(table) // notify parent, optional
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  // TODO: use isLoading!!!
  return (
    <>
      {/* <BaseContainer> */}
      <CTable striped hover>
        <CTableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    textAlign: 'center',
                    borderRight: '1px solid var(--cui-light)',
                    textDecoration: 'underline solid var(--cui-secondary)',
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </CTableHead>
        {isLoading && (
          <CRow>
            <div className="text-center">
              <CSpinner />
            </div>
          </CRow>
        )}
        <CTableBody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr
                key={row.id}
                className={getRowClassName(row.original)}
                style={{
                  height: rowHeight,
                  maxHeight: rowHeight,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      borderRight: '1px solid var(--cui-light)',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </CTableBody>
      </CTable>
      {/* HACK: Add feature to show spinner based on request state to get a clean solution!
            {tableData.length === 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 10,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(255,255,255,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CSpinner />
                </div>
            )} */}
      <PaginationWrapper
        table={table}
        visible={usePagination}
        wholeData={wholeData}
        pageSize={paginationState.pageSize}
        pageCount={pageCount}
        paginationState={paginationState}
        setPaginationState={setPaginationState}
        large={paginationLarge}
      />
      {/* </BaseContainer> */}
    </>
  )
}

export default CoreDataTable
