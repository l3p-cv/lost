// TODO: PLEASE RENAME THIS!!!
import { CCol, CRow, CTable, CTableBody, CTableHead } from '@coreui/react'
import BaseContainer from './BaseContainer'
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
import PaginatorBottomWhole from './Pagination/PaginatorBottomWhole'

// const CoreDataTable = ( {tableData, columns} ) => { // TODO: rewrite as const???
function CoreDataTable({
    className = '',
    tableData = [],
    columns = [],
    usePagination = true,
    isLoading = false,
    pageCount = undefined,
    pageSize = 10,
    rowHeight = 55,
    onPaginationChange = () => { },
    onColumnFiltersChange = () => { },
    wholeData = true
}) {
    const [columnFilters, setColumnFilters] = useState([])
    const [doRerender, setDoRerender] = useState(false)
    const [paginationState, setPaginationState] = useState({
        pageIndex: 0,
        pageSize: pageSize,
    })
    const [possiblePageSizes, setPossiblePageSizes] = useState([
        pageSize,
        pageSize * 2,
        pageSize * 3,
        pageSize * 4,
        pageSize * 5,
    ])
    const [expanded, setExpanded] = React.useState({})
    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getSubRows: (row) => row.children,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })



    return (
        <>
            {/* <BaseContainer> */}
            <CTable striped hover>
                <CTableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </CTableHead>
                <CTableBody>
                    {table.getRowModel().rows.map((row) => (
                        <Fragment key={row.id}>
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </Fragment>
                    ))}
                </CTableBody>
            </CTable>
            <PaginationWrapper table={table} visible={usePagination} wholeData={wholeData} />
            {/* </BaseContainer> */}
        </>
    )
}


export default CoreDataTable