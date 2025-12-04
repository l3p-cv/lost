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
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CoreDataTable from '../../components/CoreDataTable'
import CoreIconButton from '../../components/CoreIconButton'
import HelpButton from '../../components/HelpButton'
import { CTooltip } from '@coreui/react'
import ErrorBoundary from '../../components/ErrorBoundary'

const DatasetTable = ({
  datasetList,
  // datastores,
  onExportButtonClicked,
  onEditButtonClicked,
  page,
  pageCount,
  setLastRequestedPage,
  setDatatableInfo,
}) => {
  const [expanded, setExpanded] = useState({})
  const navigate = useNavigate()
  const [tableData, setTableData] = React.useState(() => [...datasetList])

  // update the table when the parameter data changes
  useEffect(() => {
    // possibility to change data between HTTP response and table refresh event
    setTableData(datasetList)
  }, [datasetList])

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
        <FontAwesomeIcon size="xl" icon={faFile} style={{ marginLeft: row.depth * 25 }} />
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

  const defineColumns = () => {
    const columnHelper = createColumnHelper()
    let columns = []
    columns = [
      columnHelper.display({
        id: 'expander',
        header: 'Expand',
        cell: ({ row }) => renderRowIcon(row),
      }),
      columnHelper.display({
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          if (row.original.isMetaDataset) return <b>{row.original.name}</b>
          if (row.original.isAnnotask) {
            return (
              <>
                {/* <b>{row.original.name}</b> */}
                {row.original.name}
                <div className="small text-muted">{`ID: ${row.original.idx}`}</div>
              </>
            )
          }
          return (
            <>
              <CTooltip content={row.original.description} placement="top">
                <b style={{ textDecoration: 'grey dotted underline' }}>
                  {row.original.name}
                </b>
              </CTooltip>
              <div className="small text-muted">{`ID: ${row.original.idx}`}</div>
            </>
          )
        },
      }),
      columnHelper.display({
        id: 'annotaskStatus',
        header: 'Task Status',
        cell: ({ row }) => {
          if (row.original.isAnnotask) return row.original.description
          return '-'
        },
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
        cell: ({ row }) => {
          if (row.original.isMetaDataset) return ''
          if (row.original.isAnnotask) return row.original.created_at
          return row.original.createdAt // isDataset
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => 'Actions',
        cell: ({ row }) => {
          const rowData = row.original

          // reviewing metadatasets is impossible
          if (row.original.isMetaDataset) return ''

          // disable the review button on datasets without children
          const isDisabled = !(row.original.isAnnotask || row.original.isReviewable)

          const isRegularDataset = !(rowData.isAnnotask || rowData.isMetaDataset)

          return (
            <>
              <CoreIconButton
                icon={faEye}
                color="info"
                isOutline={true}
                style={{ marginRight: '5px' }}
                onClick={() => {
                  const rowData = row.original
                  const isAnnotask = rowData.isAnnotask === true
                  openReview(rowData.idx, isAnnotask)
                }}
                disabled={isDisabled}
                toolTip="Review Dataset/Task"
              />
              <CoreIconButton
                icon={faDownload}
                color="info"
                isOutline={true}
                style={{ marginRight: '5px' }}
                onClick={() => {
                  const datasetID = rowData.idx
                  const isAnnotask = rowData.isAnnotask === true
                  const name = rowData.name
                  const description = rowData.description
                  onExportButtonClicked(datasetID, isAnnotask, name, description)
                }}
                disabled={isDisabled}
                toolTip="Export Dataset"
              />

              {isRegularDataset && (
                <CoreIconButton
                  icon={faPen}
                  style={{ marginRight: '5px' }}
                  color="warning"
                  isOutline={true}
                  onClick={() => {
                    onEditButtonClicked(row.original)
                  }}
                  disabled={false}
                  toolTip="Edit Dataset"
                />
              )}
            </>
          )
        },
      }),
    ]
    return columns
  }

  const columns = useMemo(() => defineColumns(), [tableData])

  return (
    <ErrorBoundary>
      <CoreDataTable
        columns={columns}
        tableData={tableData}
        onPaginationChange={(table) => {
          setExpanded({})
          const nextPage = table.getState().pagination.pageIndex
          setLastRequestedPage(nextPage)
          const tableState = table.getState()
          setDatatableInfo({
            pageSize: tableState.pagination.pageSize,
            page: tableState.pagination.pageIndex,
            sorted: tableState.sorting,
            filtered: tableState.columnFilters,
          })
        }}
        pageIndex={page}
        pageCount={pageCount}
        wholeData={false}
        expanded={expanded}
        setExpanded={setExpanded}
      />
    </ErrorBoundary>
  )
}

export default DatasetTable
