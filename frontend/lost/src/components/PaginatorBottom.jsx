import { CCol, CRow, CForm, CFormInput } from '@coreui/react'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import IconButton from './IconButton'
import React, { useState, useEffect } from "react";

const TablePagination = ({ table, totalPages, targetPage, setTargetPage }) => {
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
        table.setPageIndex(actualPage - 1)
    }

    return (
        <div className="d-flex align-items-center gap-2">
            <span style={{ marginLeft: "25%" }}>Page</span>
            <CForm onSubmit={jumpToPage}>
                <CFormInput
                    id="currentPageShown2"
                    type="number"
                    value={targetPage}
                    onInput={handleInput}
                    min={1}
                    // max={totalPages}
                    size="sm"
                    style={{ width: '60px' }} // Optional inline style
                />
            </CForm>
            <span>of {totalPages}</span>
        </div>
    )
}


const PaginatorBottom = ({ table }) => {
    const [targetPage, setTargetPage] = useState(table.getState().pagination.pageIndex + 1);
    const buttonFontsize = "1rem"
    const buttonWidth = "100%"

    const handlePrev = () => {
        setTargetPage(table.getState().pagination.pageIndex)
        table.previousPage()
        console.log("Current index: ", table.getState().pagination.pageIndex)
    }

    const handleNext = () => {
        setTargetPage(table.getState().pagination.pageIndex + 2)
        table.nextPage()
    }

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
                    totalPages={table.getPageCount()}
                    targetPage={targetPage}
                    setTargetPage={setTargetPage} />
            </CCol>
            <CCol>
                <span style={{ lineHeight: 2, marginLeft: "25%", marginRight: "25%" }}>
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
                        // onClick={() => table.nextPage()}
                        onClick={handleNext}
                        disabled={!table.getCanNextPage()}
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

export default PaginatorBottom