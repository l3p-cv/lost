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
import { CTable, CTableBody, CTableHead } from '@coreui/react'
import { faCaretDown, faCaretRight, faDownload, faEye, faFile } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../components/IconButton'

const DatasetTable = ({ datasetList, datasources, onExportButtonClicked }) => {
    const [tableData, setTableData] = React.useState(() => [...datasetList])

    // update the table when the parameter data changes
    useEffect(() => {
        // possibility to change data between HTTP response and table refresh event
        setTableData(datasetList)
    }, [datasetList])

    const columnHelper = createColumnHelper()

    const showAnnotasks = (datasetID) => {
        console.log("SHOW ANNOTASKS:", datasetID)
    }

    const renderRowIcon = (row) => {

        // show file icon for annotasks
        if (row.depth.isAnnotask) {
            // also use icon to indent child row (margin)
            return <FontAwesomeIcon size="xl" icon={faFile} style={{ marginLeft: row.depth * 20 }} />
        }

        // dataset that can be opened
        if (row.getCanExpand()) {
            // also use icon to indent child row (margin)
            return <FontAwesomeIcon size="2xl" icon={row.getIsExpanded() ? faCaretDown : faCaretRight} onClick={() => row.toggleExpanded()} style={{ marginLeft: row.depth * 20 }} />
        }

        // dataset that cannot be openened (it has no annotasks assigned)
        // also use icon to indent child row (margin)
        return <FontAwesomeIcon size="2xl" icon={faCaretRight} color="grey" style={{ marginLeft: row.depth * 20 }} />
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
        columnHelper.accessor('datasourceId', {
            header: () => 'Datasource',
            cell: info => {
                const datasourceID = info.renderValue()

                if (datasourceID in datasources) {
                    return datasources[datasourceID]
                }

                return ""
            }
        }),
        columnHelper.accessor('createdAt', {
            header: () => 'Created at',
        }),
        columnHelper.display({
            id: 'showAnnotasks',
            header: () => 'Show Annotasks',
            cell: props => (<IconButton
                icon={faEye}
                color="primary"
                isOutline={false}
                onClick={() => {
                    const datasetID = props.row.original.id
                    showAnnotasks(datasetID)
                }}
                disabled={false}
                text="Review"
            />)
        }),
        columnHelper.display({
            id: 'showExport',
            header: () => 'Export',
            cell: props => (
                <IconButton
                    icon={faDownload}
                    color="primary"
                    isOutline={false}
                    onClick={() => {
                        const datasetID = props.row.original.id
                        onExportButtonClicked(datasetID)
                    }}
                    disabled={false}
                    text="Export"
                />
            )
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
            <div className="h-4">&nbsp;</div>
            <CTable>
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
        </>
    )
}

export default DatasetTable