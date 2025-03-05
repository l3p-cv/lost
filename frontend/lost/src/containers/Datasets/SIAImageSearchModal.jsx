import {
    CContainer,
    CCol,
    CFormInput,
    CModal,
    CModalBody,
    CModalHeader,
    CRow,
    CTable,
    CTableBody,
    CTableHead,
} from '@coreui/react'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Fragment, useEffect, useState } from 'react'
import IconButton from '../../components/IconButton'
import {
    faAngleLeft,
    faAngleRight,
    faArrowRight,
    faSearch,
} from '@fortawesome/free-solid-svg-icons'

import {
    faSquare,
    faSquareCheck,
} from '@fortawesome/free-regular-svg-icons'
import { Label } from 'semantic-ui-react'
import * as datasetReviewApi from '../../actions/dataset/dataset_review_api'

const SIAImageSearchModal = ({
    isAnnotaskReview,
    id,
    isVisible,
    setIsVisible,
    onChooseImage,
}) => {
    const { data: possibleImageLabels,
        refetch: reloadPossibleImageLabels
    } = datasetReviewApi.useGetPossibleLabels(id)
    const { data: searchResults, mutate: doSearch } =
        datasetReviewApi.useImageSearch(isAnnotaskReview)
    const [enteredSearch, setEnteredSearch] = useState('')
    const [isFirstSearch, setIsFirstSearch] = useState(true)
    const [tableData, setTableData] = useState(() => [])
    const [selectedFilterLabels, setSelectedFilterLabels] = useState(() => [])

    useEffect(()=>{
        reloadPossibleImageLabels()
    }, [])

    useEffect(()=>{
        console.log(selectedFilterLabels);
        
    }, [selectedFilterLabels])

    useEffect(()=> {
        if(possibleImageLabels === undefined) return

        // activate all labels by default
        const allLabelIds = []
        possibleImageLabels.forEach((label) => allLabelIds.push(label.id))
        setSelectedFilterLabels(allLabelIds)
    }, [possibleImageLabels])

    useEffect(() => {
        if (
            searchResults === undefined ||
            searchResults.length === 0 ||
            searchResults.status !== 200
        )
            return
        setTableData(searchResults.data)
    }, [searchResults])

    const columnHelper = createColumnHelper()

    const columns = [
        columnHelper.accessor('imageId', {
            header: 'Image ID',
        }),
        columnHelper.accessor('imageName', {
            header: 'Image name',
        }),
        columnHelper.accessor('annotationId', {
            header: 'AnnoTask ID',
        }),
        columnHelper.accessor('annotationName', {
            header: 'AnnoTask Name',
        }),
        columnHelper.display({
            id: 'chooseImage',
            header: () => 'Choose Image',
            cell: (props) => (
                <IconButton
                    icon={faArrowRight}
                    color="primary"
                    isOutline={false}
                    onClick={() => {
                        setIsVisible(false)
                        const rowData = props.row.original
                        onChooseImage(rowData.annotationId, rowData.imageId)
                    }}
                    disabled={false}
                />
            ),
        }),
    ]

    const table = useReactTable({
        data: tableData,
        columns,
        getSubRows: (row) => row.children,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    const getContrastColor = (hexColor) => {
        hexColor = hexColor.replace('#', '')

        const r = parseInt(hexColor.substring(0, 2), 16)
        const g = parseInt(hexColor.substring(2, 4), 16)
        const b = parseInt(hexColor.substring(4, 6), 16)

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

        return luminance > 0.5 ? '#000000' : '#ffffff'
    }

    const toggleSelectLabel = (labelId) => {
        // copy list
        const _selectedFilterLabels = selectedFilterLabels.slice()

        if (_selectedFilterLabels.includes(labelId)) {
            // remove item from list
            const index = _selectedFilterLabels.indexOf(labelId);
            if (index > -1) _selectedFilterLabels.splice(index, 1);
        } else {
            _selectedFilterLabels.push(labelId)
        }

        setSelectedFilterLabels(_selectedFilterLabels)
    }

    const renderPossibleLabels = () => {
        if (possibleImageLabels === undefined) return ''
        const html = []
        possibleImageLabels.forEach((label) => {

            // set a default label color in case the label has no color assigned
            if(label.color === null) label.color = '#50b897'

            const labelColor = selectedFilterLabels.includes(label.id) ? label.color : '#95a5a6'

            html.push(
                <Label
                    as="div"
                    tag
                    key={label.id}
                    style={{
                        marginTop: 5,
                        marginLeft: 30,
                        opacity: 1,
                        cursor: 'pointer',
                        color: getContrastColor(labelColor),
                        background: labelColor,
                        userSelect: 'none',
                    }}
                    onClick={() => toggleSelectLabel(label.id)}
                >
                    {label.name}
                </Label>,
            )
        })

        return html
    }

    const renderFoundAnnotations = () => {
        if (tableData.length === 0) {
            // don't show the "no images found" when the user did not do a search before
            if (isFirstSearch) return null

            return (
                <CRow>
                    <CCol sm="2">Results:</CCol>
                    <CCol md="6">No images found</CCol>
                </CRow>
            )
        }

        return (
            <CRow>
                <CCol sm="2">Results:</CCol>
                <CCol md="8">
                    <div style={{ marginTop: '25px' }}></div>
                    <CContainer
                        style={{
                            background: 'white',
                            padding: 15,
                            borderRadius: 10,
                            border: '1px solid #cce2ff',
                        }}
                    >
                        <CTable>
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
                        <CRow>
                            <CCol>
                                {
                                    <IconButton
                                        icon={faAngleLeft}
                                        text="Previous"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    />
                                }
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
                                        onChange={(e) => {
                                            table.setPageSize(Number(e.target.value))
                                        }}
                                    >
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                Show {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </span>
                            </CCol>
                            <CCol>
                                {
                                    <IconButton
                                        icon={faAngleRight}
                                        text="Next"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        style={{ float: 'right' }}
                                    />
                                }
                            </CCol>
                        </CRow>
                    </CContainer>
                </CCol>
            </CRow>
        )
    }

    return (
        <CModal
            visible={isVisible}
            size="xl"
            onClose={() => {
                setIsVisible(false)
            }}
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
                    </CCol>
                </CRow>
                <div>&nbsp;</div>
                <CRow>
                    <CCol sm="2">Filter Labels:</CCol>
                    <CCol sm="6">
                        {renderPossibleLabels()}
                    </CCol>
                    <CCol sm="2">
                        <IconButton
                            isOutline={true}
                            color="primary"
                            icon={faSquareCheck}
                            text="Select all"
                            onClick={() => {
                                const allLabelIds = []
                                possibleImageLabels.forEach((label) => allLabelIds.push(label.id))
                                setSelectedFilterLabels(allLabelIds)
                            }}
                            style={{ marginTop: '15px' }}
                        ></IconButton>
                        &nbsp;
                        <IconButton
                            isOutline={true}
                            color="primary"
                            icon={faSquare}
                            text="Deselect all"
                            onClick={() => {
                                setSelectedFilterLabels([])
                            }}
                            style={{ marginTop: '15px' }}
                        ></IconButton>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol sm="2">&nbsp;</CCol>
                    <CCol sm="6">
                        <IconButton
                            isOutline={false}
                            color="primary"
                            icon={faSearch}
                            text="Search"
                            onClick={() => {
                                setIsFirstSearch(false)
                                doSearch([id, enteredSearch, selectedFilterLabels])
                            }}
                            style={{ marginTop: '15px' }}
                        ></IconButton>
                    </CCol>
                </CRow>
                <div style={{ marginTop: '25px' }}>&nbsp;</div>
                {renderFoundAnnotations()}
            </CModalBody>
        </CModal>
    )
}

export default SIAImageSearchModal
