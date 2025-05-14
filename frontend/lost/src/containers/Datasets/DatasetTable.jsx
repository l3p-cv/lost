import {
    faCaretDown,
    faCaretRight,
    faDownload,
    faEye,
    faFile,
    faPen,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { createColumnHelper } from '@tanstack/react-table'
import React, { Fragment, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BaseContainer from '../../components/BaseContainer'
import IconButton from '../../components/IconButton'
import CoreDataTable from '../../components/CoreDataTable'

const DatasetTable = ({
    datasetList,
    datastores,
    onExportButtonClicked,
    onEditButtonClicked,
}) => {
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
        const reviewType = isAnnotask ? 'annotasks' : 'datasets'
        navigate(`/${reviewType}/${index}/review`)
    }

    const renderRowIcon = (row) => {
        // show file icon for annotasks
        if (row.original.isAnnotask) {
            // also use icon to indent child row (margin)
            return (
                <FontAwesomeIcon
                    size="xl"
                    icon={faFile}
                    style={{ marginLeft: row.depth * 25 }}
                />
            )
        }

        // dataset that can be opened
        if (row.getCanExpand()) {
            // also use icon to indent child row (margin)
            return (
                <FontAwesomeIcon
                    size="2xl"
                    icon={row.getIsExpanded() ? faCaretDown : faCaretRight}
                    onClick={() => row.toggleExpanded()}
                    style={{ marginLeft: row.depth * 25 }}
                />
            )
        }

        // dataset that cannot be openened (it has no annotasks assigned)
        // also use icon to indent child row (margin)
        return (
            <FontAwesomeIcon
                size="2xl"
                icon={faCaretRight}
                color="grey"
                style={{ marginLeft: row.depth * 25 }}
            />
        )
    }

    const columns = [
        columnHelper.display({
            id: 'expander',
            cell: ({ row }) => renderRowIcon(row),
        }),
        columnHelper.accessor('name', {
            header: 'Name',
            cell: (props) => {
                return (
                    <>
                        {props.row.original.name}
                        <div className="small text-muted">
                            {`ID: ${props.row.original.idx}`}
                        </div>
                    </>)
            }
        }),
        columnHelper.accessor('description', {
            header: 'Description/Status',
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
            cell: (props) => {
                if (props.row.original.isMetaDataset) return ''
                if (props.row.original.isAnnotask) return props.row.original.created_at
                return props.row.original.createdAt // isDataset
            }
        }),
        columnHelper.display({
            id: 'review',
            header: () => 'Review',
            cell: (props) => {
                // reviewing metadatasets is impossible
                if (props.row.original.isMetaDataset) return ''

                // disable the review button on datasets without children
                const isDisabled = !(
                    props.row.original.isAnnotask || props.row.original.isReviewable
                )

                return (
                    <IconButton
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
                )
            },
        }),
        columnHelper.display({
            id: 'showExport',
            header: () => 'Export',
            cell: (props) => {
                const rowData = props.row.original

                if (rowData.idx == '-1') return ''

                // disable the review button on datasets without children
                const isDisabled = !(
                    props.row.original.isAnnotask || props.row.original.isReviewable
                )

                return (
                    <IconButton
                        icon={faDownload}
                        color="primary"
                        isOutline={false}
                        onClick={() => {
                            const datasetID = rowData.idx
                            const isAnnotask = rowData.isAnnotask === true
                            const name = rowData.name
                            const description = rowData.description
                            onExportButtonClicked(
                                datasetID,
                                isAnnotask,
                                name,
                                description,
                            )
                        }}
                        disabled={isDisabled}
                    />
                )
            },
        }),
        columnHelper.display({
            id: 'showEdit',
            header: () => 'Edit',
            cell: (props) => {
                const rowData = props.row.original

                // only show edit icon for datasets
                if (rowData.isAnnotask || rowData.isMetaDataset) return ''

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
            },
        }),
    ]

    return (
        <BaseContainer>
            <CoreDataTable tableData={tableData} columns={columns} />
        </BaseContainer>
    )
}

export default DatasetTable
