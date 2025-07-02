import React, { Fragment, useEffect, useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {
    CContainer,
    CRow,
    CTable,
    CTableBody,
    CButton,
    CTableHead,
    CCol,
    CBadge,
    CFormInput,
    CPagination,
    CPaginationItem,
    CDropdown,
    CDropdownToggle,
    CDropdownItem,
    CDropdownMenu,
    CSpinner,
    CInputGroup,
    CInputGroupText,
} from '@coreui/react'
import { useTranslation } from 'react-i18next'
import { FaFilter, FaTimes } from 'react-icons/fa'

const DataTable = ({
    className = '',
    data,
    columns = [],
    onPaginationChange = () => {},
    isLoading = false,
    pageCount = undefined,
    pageSize = 10,
    rowHeight = 55,
    noEmptyRows = false,
    enableFilters = false,
    onColumnFiltersChange = () => {},
    onRowClick = undefined,
}) => {
    const { t } = useTranslation()
    const [columnFilters, setColumnFilters] = useState([])
    const [doRerender, setDoRerender] = useState(false)
    const [expanded, setExpanded] = useState(false)
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
    const [dataTemp, setDataTemp] = useState()
    // update the table when the parameter data changes

    useEffect(() => {
        try {
            if (!(JSON.stringify(data) === JSON.stringify(dataTemp))) {
                setDataTemp(data)
                if (table.getPageCount() > 0) {
                    if (
                        table.getState().pagination.pageIndex + 1 >
                        table.getPageCount()
                    ) {
                        setPaginationState({
                            ...paginationState,
                            pageIndex: table.getPageCount() - 1,
                        })
                    }
                }
            }
        } catch (error) {
            setDataTemp(data)
        }
    }, [data])

    const table = useReactTable({
        data: dataTemp,
        enableColumnFilters: enableFilters,
        pageCount,
        manualPagination: pageCount !== undefined ? true : false,
        columns: columns,
        state: {
            pagination: paginationState,
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        onExpandedChange: () => setExpanded(true),
        getSubRows: (row) => row.children,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    useEffect(() => {
        onPaginationChange(table)
    }, [paginationState])

    useEffect(() => {
        onColumnFiltersChange(table)
    }, [columnFilters])

    const goToPageIndex = (index) => {
        setPaginationState({ ...paginationState, pageIndex: index })
    }
    const renderPaginationNumbers = (pageCount) => {
        if (pageCount <= 5) {
            return (
                <>
                    {[...Array(pageCount)].map((_, index) => {
                        if (index === paginationState.pageIndex) {
                            return <CPaginationItem active>{index + 1}</CPaginationItem>
                        }
                        return (
                            <CPaginationItem
                                onClick={() => {
                                    goToPageIndex(index)
                                }}
                            >
                                {index + 1}
                            </CPaginationItem>
                        )
                    })}
                </>
            )
        } else {
            let renderCount = 5
            let renderStart = paginationState.pageIndex - 2
            if (renderStart < 0) {
                renderStart = 0
            }
            if (paginationState.pageIndex > 2) {
                renderCount -= 1

                renderStart += 1
            }
            if (paginationState.pageIndex < pageCount - 3) {
                renderCount -= 1
            } else {
                renderStart -= paginationState.pageIndex - (pageCount - 3)
            }

            return (
                <>
                    {paginationState.pageIndex > 2 && (
                        <CPaginationItem>{'...'}</CPaginationItem>
                    )}

                    {[...Array(renderCount)].map((_, index) => {
                        if (index + renderStart === paginationState.pageIndex) {
                            return (
                                <CPaginationItem active>
                                    {index + renderStart + 1}
                                </CPaginationItem>
                            )
                        }
                        return (
                            <CPaginationItem
                                onClick={() => {
                                    goToPageIndex(index + renderStart)
                                }}
                            >
                                {index + renderStart + 1}
                            </CPaginationItem>
                        )
                    })}
                    {paginationState.pageIndex < pageCount - 3 && (
                        <CPaginationItem>{'...'}</CPaginationItem>
                    )}
                </>
            )
        }
    }

    const renderPaginationGroup = (pageCount) => {
        return (
            <CPagination style={{ cursor: 'default' }}>
                <CPaginationItem
                    disabled={paginationState.pageIndex === 0}
                    onClick={() => {
                        goToPageIndex(0)
                    }}
                >
                    {'<<'}
                </CPaginationItem>
                <CPaginationItem
                    disabled={paginationState.pageIndex === 0}
                    onClick={() => {
                        goToPageIndex(paginationState.pageIndex - 1)
                    }}
                >
                    {'<'}
                </CPaginationItem>
                {renderPaginationNumbers(pageCount)}
                <CPaginationItem
                    disabled={paginationState.pageIndex === pageCount - 1}
                    onClick={() => {
                        goToPageIndex(paginationState.pageIndex + 1)
                    }}
                >
                    {'>'}
                </CPaginationItem>
                <CPaginationItem
                    disabled={paginationState.pageIndex === pageCount - 1}
                    onClick={() => {
                        goToPageIndex(pageCount - 1)
                    }}
                >
                    {'>>'}
                </CPaginationItem>
            </CPagination>
        )
    }

    const renderPagination = (pageCount) => {
        return (
            <CCol className=" pt-3 justify-content-between d-flex border-start border-end border-bottom">
                <CCol className="d-flex align-items-center justify-content-start ms-3">
                    {renderPaginationGroup(pageCount)}
                </CCol>
                <CCol className="d-flex align-items-center justify-content-center mb-3">
                    <span style={{ lineHeight: 2 }}>
                        Page{' '}
                        <strong>
                            {table.getState().pagination.pageIndex + 1} of{' '}
                            {table.getPageCount()}
                        </strong>
                    </span>
                </CCol>

                <CCol className="d-flex align-items-center justify-content-end me-3 mb-3">
                    <CDropdown>
                        <CDropdownToggle>
                            Show {table.getState().pagination.pageSize}
                        </CDropdownToggle>
                        <CDropdownMenu>
                            {possiblePageSizes.map((pageSize) => (
                                <CDropdownItem
                                    onClick={() =>
                                        setPaginationState({
                                            ...paginationState,
                                            pageSize: pageSize,
                                        })
                                    }
                                >
                                    Show {pageSize}
                                </CDropdownItem>
                            ))}
                        </CDropdownMenu>
                    </CDropdown>
                </CCol>
            </CCol>
        )
    }

    const renderEmptyRows = (count) => {
        if (count < 0) {
            return <></>
        }
        return (
            <>
                {[...Array(count)].map((_, index) => {
                    return (
                        <tr style={{ height: rowHeight }}>
                            {[...Array(table.getAllColumns().length)].map((_, index) => {
                                return (
                                    <td>
                                        <br></br>{' '}
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
            </>
        )
    }

    const renderFilters = () => {
        return (
            <CTableHead className="ms-1 mb-1">
                <tr>
                    {table.getAllColumns().map((item) => {
                        if (item.getCanFilter()) {
                            if (!doRerender) {
                                return (
                                    <td>
                                        <CInputGroup>
                                            <CInputGroupText>
                                                <FaFilter />
                                            </CInputGroupText>
                                            <CFormInput
                                                value={
                                                    item.getFilterValue() === undefined
                                                        ? ''
                                                        : item.getFilterValue()
                                                }
                                                onChange={(e) => {
                                                    item.setFilterValue(e.target.value)
                                                    goToPageIndex(0)
                                                }}
                                            />

                                            <CButton
                                                color="secondary"
                                                onClick={() => {
                                                    item.setFilterValue('')
                                                    setDoRerender(true)
                                                }}
                                            >
                                                <FaTimes className="mb-1" />
                                            </CButton>
                                        </CInputGroup>
                                    </td>
                                )
                            }
                            setDoRerender(false)
                            return ''
                        }
                        return <td />
                    })}
                </tr>
            </CTableHead>
        )
    }

    const renderRows = () => {
        return table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
                <tr
                    key={row.id}
                    className={row.original === dataTemp?.[0] ? 'first-row-class' : ''}
                    style={
                        onRowClick !== undefined
                            ? { cursor: 'pointer', height: rowHeight }
                            : { height: rowHeight }
                    }
                    onClick={() => {
                        if (onRowClick !== undefined) {
                            onRowClick(row)
                        }
                    }}
                >
                    {row.getVisibleCells().map((cell) => (
                        <td
                            className="border-start"
                            style={{
                                textAlign: 'center',
                                verticalAlign: 'middle',
                            }}
                            key={cell.id}
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>
            </Fragment>
        ))
    }

    return (
        <>
            <CContainer
                className={className}
                fluid
                style={{
                    background: 'white',
                    padding: 0,
                    border: '0px solid #d3d3d3',
                }}
            >
                {isLoading || dataTemp === undefined || dataTemp === null ? (
                    <div className="d-flex justify-content-center">
                        <CSpinner />
                    </div>
                ) : (
                    <div>
                        <div
                            style={{ overflowX: 'scroll' }}
                            className="border-start border-top border-end"
                        >
                            <CTable striped style={{ marginBottom: '0px' }}>
                                {enableFilters && <>{renderFilters()}</>}
                                <CTableHead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    className={
                                                        header.index === 0
                                                            ? ''
                                                            : 'border-start'
                                                    }
                                                    key={header.id}
                                                    style={{ textAlign: 'center' }}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef
                                                                  .header,
                                                              header.getContext(),
                                                          )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </CTableHead>
                                <CTableBody>
                                    {dataTemp.length === 0 ? (
                                        <>
                                            {!noEmptyRows &&
                                                renderEmptyRows(paginationState.pageSize)}
                                        </>
                                    ) : (
                                        <>
                                            {renderRows()}
                                            {!noEmptyRows &&
                                                renderEmptyRows(
                                                    paginationState.pageSize -
                                                        table.getRowModel().rows.length,
                                                )}
                                        </>
                                    )}
                                </CTableBody>
                            </CTable>
                        </div>
                        {(table.getCanNextPage() || table.getCanPreviousPage()) &&
                            renderPagination(table.getPageCount())}
                    </div>
                )}
            </CContainer>
        </>
    )
}

const smallText = (text) => <p className="small text-muted">{text}</p>

const RenderBadge = ({ text, color, onClick }) => (
    <div>
        <CBadge color={color} onClick={onClick || null}>
            {text}
        </CBadge>
    </div>
)

const RenderTitleSubtitle = ({ top, bottom }) => (
    <>
        <p style={{ margin: 0 }}>{top}</p>
        {smallText(bottom)}
    </>
)

const RenderStatus = ({ lastActive }) => {
    lastActive.setHours(lastActive.getHours() + 2)
    const fifteenSecondsAgo = new Date()
    fifteenSecondsAgo.setSeconds(fifteenSecondsAgo.getSeconds() - 15)
    let status = 'Online'
    if (lastActive < fifteenSecondsAgo) {
        status = 'Offline'
    }
    return (
        <div>
            <CBadge color={status === 'Online' ? 'success' : 'danger'}>{status}</CBadge>
            {smallText(`Last Active: ${lastActive.toLocaleString('de-DE')}`)}
        </div>
    )
}

DataTable.RenderBadge = RenderBadge
DataTable.RenderStatus = RenderStatus
DataTable.RenderTitleSubtitle = RenderTitleSubtitle

export default DataTable
