// TODO: PLEASE RENAME THIS!!!
import { CCol, CRow, CTable, CTableBody, CTableHead } from '@coreui/react'
import BaseContainer from './BaseContainer'
import PaginatorBottom from './PaginatorBottom'
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import React, { Fragment, useEffect } from 'react'

// const CoreDataTable = ( {tableData, columns} ) => { // TODO: rewrite as const???
function CoreDataTable({ tableData, columns, usePagination=true }) {
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
            <PaginatorBottom table={table} visible={usePagination} />
            {/* </BaseContainer> */}
        </>
    )
}


export default CoreDataTable