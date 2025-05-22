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
    const [paginationState, setPaginationState] = useState(() => ({
        pageIndex: 0,
        pageSize,
    }));
    const [expanded, setExpanded] = React.useState({})
    const [dataTemp, setDataTemp] = useState([])

    useEffect(() => {
        const newPageCount = pageCount ?? table.getPageCount()
        const currentIndex = paginationState.pageIndex

        if (tableData !== dataTemp) {
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
        data: (dataTemp != []) ? dataTemp : tableData, // TODO: dataTemp
        manualPagination: pageCount !== undefined ? true : false,
        columns,
        state: {
            expanded,
            pagination: paginationState
        },
        onPaginationChange: (updater) => {
            setPaginationState((old) => {
                const newState = typeof updater === 'function' ? updater(old) : updater;
                return newState;
            });
            onPaginationChange(table); // notify parent, optional
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
            <PaginationWrapper table={table}
                visible={usePagination}
                wholeData={wholeData}
                pageSize={paginationState.pageSize}
                pageCount={pageCount}
                paginationState={paginationState}
                setPaginationState={setPaginationState}
            />
            {/* </BaseContainer> */}
        </>
    )
}


export default CoreDataTable