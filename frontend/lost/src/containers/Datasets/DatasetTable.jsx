import React, { Fragment } from 'react'
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

const DatasetTable = ({ datasets, datasources }) => {
    const [data, setData] = React.useState(() => [...datasets])

    const columnHelper = createColumnHelper()

    const showAnnotasks = (row) => {
        console.log("SHOW ANNOTASKS")
    }

    const showExportMenu = (row) => {
        console.log("Clicked on export menu")
    }

    const renderRowIcon = (row) => {

        // show file icon for annotasks
        if (row.original.isAnnotask) {
            return <FontAwesomeIcon size="xl" icon={faFile} style={{ marginLeft: '20px' }} />
        }

        // dataset that can be opened
        if (row.getCanExpand()) {
            return <FontAwesomeIcon size="2xl" icon={row.getIsExpanded() ? faCaretDown : faCaretRight} onClick={() => row.toggleExpanded()} />
        }

        // dataset that cannot be openened (it has no annotasks assigned)
        return <FontAwesomeIcon size="2xl" icon={faCaretRight} color="grey" />
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
        columnHelper.accessor('datasource', {
            header: () => 'Datasource',
            cell: info => {
                const datasourceID = info.renderValue()

                if (datasourceID in datasources) {
                    return datasources[datasourceID]
                }

                return ""
            }
        }),
        columnHelper.accessor('created_at', {
            header: () => 'Created at',
        }),
        columnHelper.display({
            id: 'showAnnotasks',
            header: () => 'Show Annotasks',
            cell: props => (<IconButton
                icon={faEye}
                color="primary"
                isOutline={false}
                onClick={(row) => showAnnotasks(row)}
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
                    onClick={(row) => showExportMenu(row)}
                    disabled={false}
                    text="Export"
                />
            )
        })
    ]

    const [expanded, setExpanded] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getSubRows: row => row.annotasks,
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