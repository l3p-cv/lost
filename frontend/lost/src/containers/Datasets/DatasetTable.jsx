import React, { Fragment, useEffect } from 'react'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CContainer, CRow, CTable, CTableBody, CTableHead, CCol } from '@coreui/react'
import { faAngleLeft, faAngleRight, faCaretDown, faCaretRight, faDownload, faEye, faFile, faPen } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../components/IconButton'
import { useNavigate } from 'react-router-dom'

const DatasetTable = ({ datasetList, datastores, onExportButtonClicked, onEditButtonClicked }) => {
    const navigate = useNavigate()

    const [tableData, setTableData] = React.useState(() => [...datasetList])

    // update the table when the parameter data changes
    useEffect(() => {
        // possibility to change data between HTTP response and table refresh event
        setTableData(datasetList)
    }, [datasetList])

    const columnHelper = createColumnHelper()

    const openReview = async (index, isAnnotask) => {
        // move to annotation review or dataset review (depending on clicked item)
        const reviewType = (isAnnotask ? 'annotasks' : 'datasets')
        navigate(`/${reviewType}/${index}/review`)
    }

    const renderRowIcon = (row) => {

        // show file icon for annotasks
        if (row.original.isAnnotask) {
            // also use icon to indent child row (margin)
            return <FontAwesomeIcon size="xl" icon={faFile} style={{ marginLeft: row.depth * 25 }} />
        }

        // dataset that can be opened
        if (row.getCanExpand()) {
            // also use icon to indent child row (margin)
            return <FontAwesomeIcon size="2xl" icon={row.getIsExpanded() ? faCaretDown : faCaretRight} onClick={() => row.toggleExpanded()} style={{ marginLeft: row.depth * 25 }} />
        }

        // dataset that cannot be openened (it has no annotasks assigned)
        // also use icon to indent child row (margin)
        return <FontAwesomeIcon size="2xl" icon={faCaretRight} color="grey" style={{ marginLeft: row.depth * 25 }} />
    }

    const columns = [
        columnHelper.display({
            id: 'expander',
            cell: ({ row }) => renderRowIcon(row),
        }),
        columnHelper.accessor('name', {
            header: 'Name'
        }),
        columnHelper.accessor('description', {
            header: 'Description'
        }),
        // columnHelper.accessor('datastoreId', {
        //     header: () => 'Datastore',
        //     cell: info => {
        //         const datastoreID = info.renderValue()

        //         if (datastoreID in datastores) {
        //             return datastores[datastoreID]
        //         }

        //         return ""
        //     }
        // }),
        columnHelper.accessor('createdAt', {
            header: () => 'Created at',
        }),
        columnHelper.display({
            id: 'review',
            header: () => 'Review',
            cell: props => {

                // reviewing metadatasets is impossible
                if (props.row.original.isMetaDataset) return ""

                // disable the review button on datasets without children
                const isDisabled = !(props.row.original.isAnnotask || props.row.original.isReviewable)

                return <IconButton
                    icon={faEye}
                    color="primary"
                    isOutline={false}
                    onClick={() => {
                        const rowData = props.row.original
                        const isAnnotask = rowData.isAnnotask === true
                        openReview(rowData.idx, isAnnotask)
                    }}
                    disabled={isDisabled}
                // text="Review"
                />
            }
        }),
        columnHelper.display({
            id: 'showExport',
            header: () => 'Export',
            cell: props => {
                const rowData = props.row.original

                // only show edit icon for annotasks
                // @TODO add support for exporting datasets
                if (!rowData.isAnnotask) return ""

                return <IconButton
                    icon={faDownload}
                    color="primary"
                    isOutline={false}
                    onClick={() => {
                        const datasetID = rowData.idx
                        const isAnnotask = rowData.isAnnotask === true
                        onExportButtonClicked(datasetID, isAnnotask)
                    }}
                    disabled={false}
                // text="Export"
                />
            }
        }),
        columnHelper.display({
            id: 'showEdit',
            header: () => 'Edit',
            cell: props => {
                const rowData = props.row.original

                // only show edit icon for datasets
                if (rowData.isAnnotask || rowData.isMetaDataset) return ""

                return (
                    <IconButton
                        icon={faPen}
                        color="primary"
                        isOutline={false}
                        onClick={() => {
                            onEditButtonClicked(props.row.original)
                        }}
                        disabled={false}
                    // text="Edit"
                    />
                )
            }
        })
    ]

    const [expanded, setExpanded] = React.useState({})

    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getSubRows: row => row.children,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel()
    })

    return (
        <>
            <CContainer style={{ background: 'white', padding: 15, borderRadius: 10, border: '1px solid #cce2ff' }}>
                <CTable striped>
                    <CTableHead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </CTableHead>
                    <CTableBody>
                        {table.getRowModel().rows.map(row => (
                            <Fragment key={row.id}>
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            </Fragment>
                        ))}
                    </CTableBody>
                </CTable>

                <CRow>
                    <CCol>
                        {<IconButton
                            icon={faAngleLeft}
                            text="Previous"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        />}
                    </CCol>
                    <CCol>
                        <span style={{ lineHeight: 2 }}>
                            Page
                            <strong>
                                {table.getState().pagination.pageIndex + 1} of{' '}
                                {table.getPageCount()}
                            </strong>
                        </span>
                    </CCol>
                    <CCol>
                        <span style={{ lineHeight: 2 }}>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => {
                                    table.setPageSize(Number(e.target.value))
                                }}
                            >
                                {[10, 20, 30, 40, 50].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>
                                        Show {pageSize}
                                    </option>
                                ))}
                            </select>
                        </span>
                    </CCol>
                    <CCol>
                        {<IconButton
                            icon={faAngleRight}
                            text="Next"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            style={{ float: 'right' }}
                        />}
                    </CCol>
                </CRow>
            </CContainer>
        </>
    )
}

export default DatasetTable