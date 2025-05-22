import {
    CCol,
    CRow,
    CForm,
    CFormInput,
    CFormSelect,
} from '@coreui/react'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../IconButton'
import React, { useState, useEffect } from "react";

// TODO:
// TODO: make buttons work
// TODO: really load the next pages!!!
// TODO: make jumping work
// TODO: make page-index-input work...
const TablePagination = ({ table,
    totalPages,
    targetPage,
    setTargetPage,
    setPaginationState,
    }) => {
    // const [currentPage, setCurrentPage] = useState(table.getState().pagination.pageIndex + 1);

    const handleSubmit = (value) => {
        if (isNaN(value)) {
            setTargetPage(table.getState().pagination.pageIndex + 1)
            return table.getState().pagination.pageIndex + 1
        }
        if (value < 1) {
            setTargetPage(1)
            return 1
        }
        if (value > totalPages) {
            setTargetPage(totalPages)
            return totalPages
        }
        return value
    }

    const handleInput = (e) => {
        setTargetPage(parseInt(e.target.value))
    }

    const jumpToPage = (e) => {
        let actualPage = handleSubmit(targetPage)
        e.preventDefault()
        setPaginationState(prev => ({
            ...prev,
            pageIndex: actualPage - 1
        }));
        table.setPageIndex(actualPage - 1);
        console.log("Paginator set table to: ", table)
    }

    return (
        <div className="d-flex align-items-center gap-2 my-2 text-muted small">
            <span style={{ marginLeft: "0%" }}>
                <>Page</>
            </span>
            <CForm onSubmit={jumpToPage}>
                <CFormInput
                    id="currentPageShown2"
                    type="number"
                    value={targetPage}
                    onInput={handleInput}
                    // min={1}
                    className="text-center"
                    // max={totalPages}
                    size="sm"
                    style={{ width: '55px' }} // Optional inline style
                />
            </CForm>
            <span>
                <>of {totalPages}</>
            </span>
        </div>
    )
}


const PaginatorBottomPartial = ({
    table,
    tableData,
    dataTemp,
    setDataTemp,
    paginationState,
    setPaginationState,
    visible = true,
    totalPages = undefined,
    pageSize = 10,
    onPaginationChange = () => { },
}) => {

    if (!visible) return
    const [possiblePageSizes, setPossiblePageSizes] = useState([
        pageSize,
        pageSize * 2,
        pageSize * 3,
        pageSize * 4,
        pageSize * 5,
    ])

    // useEffect(() => {
    //     console.log("CHILD CHANGED PAGINATION!!!")
    //     onPaginationChange(table)
    // }, [paginationState])


    // TODO: use for page-changing!!!
    const goToPageIndex = (index) => {
        setPaginationState({ ...paginationState, pageIndex: index + 1 })
    }

    // const goToPageIndex = (index) => {
    //     setPaginationState(prev => ({ ...prev, pageIndex: index }))
    // }

    //////////// The old code: TODO: remove mark
    // const [targetPage, setTargetPage] = useState(table.getState().pagination.pageIndex + 1);
    const [targetPage, setTargetPage] = useState(paginationState.pageIndex + 1);
    const buttonFontsize = "1rem"
    const buttonWidth = "100%"

    const handlePrev = () => {
        setTargetPage(table.getState().pagination.pageIndex)
        table.previousPage()
        console.log("Current index: ", table.getState().pagination.pageIndex)
    }

    // const handleNext = () => {
    // setTargetPage(table.getState().pagination.pageIndex + 2)
    // table.nextPage()

    // goToPageIndex(paginationState.pageIndex + 1)

    // table.setPageIndex(table.getState().pagination.pageIndex + 1)
    // console.log("Next page set: ", table.getState().pagination.pageIndex)
    // goToPageIndex(paginationState.pageIndex + 1)
    // table.nextPage() // HACK: this works in getting to the next page...

    // setPaginationState(prev => ({
    //     ...prev,
    //     pageIndex: prev.pageIndex + 1
    // }))
    // console.log("New expected pageIndex: ", paginationState.pageIndex + 1)
    // }

    // GPTs solution
    const handleNext = () => {
        const nextIndex = paginationState.pageIndex + 1;
        setPaginationState(prev => ({
            ...prev,
            pageIndex: nextIndex
        }));
        table.setPageIndex(nextIndex);
    };


    function changePageState(num) {
        setPaginationState(() => ({
            ...paginationState,
            pageSize: num
        }))
        table.setPageSize(num)
    }
    console.log("Rendering table with pageIndex:", paginationState.pageIndex);

    return (
        <CRow>
            <CCol>
                {
                    <IconButton
                        icon={faAngleLeft}
                        text="Previous"
                        // onClick={() => table.previousPage()}
                        onClick={handlePrev}
                        disabled={!table.getCanPreviousPage()}
                        style={{ fontSize: buttonFontsize, padding: '0.75rem 1.5rem', width: buttonWidth }}
                    />
                }
            </CCol>
            <CCol>
                <TablePagination
                    table={table}
                    totalPages={totalPages}
                    targetPage={targetPage}
                    setTargetPage={setTargetPage} 
                    setPaginationState={setPaginationState}
                    />
            </CCol>
            <CCol xs="auto" style={{ marginRight: '0%' }}>

                {/* <label htmlFor="pageSize" className="form-label me-2">
                        Rows per page:
                    </label> */}
                <div className="d-flex align-items-center gap-2 justify-content-center my-2">
                    {/* TODO: make changin page-size relevant!!! */}
                    <CFormSelect
                        id="pageSize"
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => changePageState(Number(e.target.value))}
                        // onChange={(e) =>
                        //     setPaginationState(() => ({
                        //         ...paginationState,
                        //         pageSize: Number(e.target.value)
                        //     }))}
                        // //table.setPageSize(Number(e.target.value))}
                        className="form-select-sm"
                    >
                        {possiblePageSizes.map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                Show {pageSize}
                            </option>
                        ))}
                    </CFormSelect>
                </div>
            </CCol>
            <CCol>
                {
                    <IconButton
                        icon={faAngleRight}
                        text="Next"
                        // onClick={() => table.nextPage()}
                        onClick={handleNext}
                        // disabled={!table.getCanNextPage()}
                        style={{
                            float: 'right', fontSize: buttonFontsize, padding: '0.75rem 1.5rem',
                            width: buttonWidth
                        }}
                    />
                }
            </CCol>
        </CRow>
    )
}

export default PaginatorBottomPartial