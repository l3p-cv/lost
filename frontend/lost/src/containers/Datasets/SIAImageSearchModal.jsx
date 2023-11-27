import { CCol, CFormInput, CModal, CModalBody, CModalHeader, CRow, CTable, CTableBody, CTableHead } from "@coreui/react"
import { createColumnHelper, flexRender, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"
import { Fragment, useEffect, useState } from "react"
import IconButton from "../../components/IconButton"
import { faArrowRight, faSearch } from "@fortawesome/free-solid-svg-icons"
import * as datasetApi from '../../actions/dataset/dataset_api'

const SIAImageSearchModal = ({ datasetId, isVisible, setIsVisible, onChooseImage }) => {

    const { data: searchResults, mutate: doSearch } = datasetApi.useImageSearch()
    const [enteredSearch, setEnteredSearch] = useState("")
    const [tableData, setTableData] = useState(() => [])

    useEffect(() => {
        if (searchResults === undefined || searchResults.length === 0 || searchResults.status !== 200) return
        setTableData(searchResults.data)
    }, [searchResults])

    const columnHelper = createColumnHelper()

    const columns = [
        columnHelper.accessor('annotationIndex', {
            header: 'Image ID'
        }),
        columnHelper.accessor('imageName', {
            header: 'Image name'
        }),
        columnHelper.accessor('annotationId', {
            header: 'Annotation ID'
        }),
        columnHelper.accessor('annotationName', {
            header: 'Annotation Name'
        }),
        columnHelper.display({
            id: 'chooseImage',
            header: () => 'Choose Image',
            cell: props => (<IconButton
                icon={faArrowRight}
                color="primary"
                isOutline={false}
                onClick={() => {
                    const rowData = props.row.original
                    onChooseImage(rowData.annotationId, rowData.annotationIndex)
                }}
                disabled={false}
            />)
        })
    ]

    const table = useReactTable({
        data: tableData,
        columns,
        getSubRows: row => row.children,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel()
    })

    const renderFoundAnnotations = () => {

        if (tableData.length === 0) return

        return (
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
        )
    }

    return (
        <CModal
            visible={isVisible}
            size="xl"
            onClose={() => { setIsVisible(false) }}
        >
            <CModalHeader>Search Annotation</CModalHeader>
            <CModalBody>
                <CRow>
                    <CCol sm="2">Image name:</CCol>
                    <CCol sm="6">
                        <CFormInput
                            type="text"
                            value={enteredSearch}
                            onChange={(e) => setEnteredSearch(e.target.value)}
                        />
                        <IconButton
                            isOutline={false}
                            color="secondary"
                            icon={faSearch}
                            text="Search"
                            onClick={() => doSearch([datasetId, enteredSearch])}
                            style={{ marginTop: '15px' }}
                        ></IconButton>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol md="6">
                        <div style={{ marginTop: '25px' }}></div>
                        {renderFoundAnnotations()}
                    </CCol>
                </CRow>
            </CModalBody>
        </CModal >
    )
}

export default SIAImageSearchModal