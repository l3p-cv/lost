import {
    CCol,
    CRow,
    CForm,
    CFormInput,
    CFormSelect,
    CButtonGroup
} from '@coreui/react'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../IconButton'
import CoreIconButton from '../CoreIconButton';
import React, { useState, useEffect } from "react";

const TablePagination = ({ table,
    totalPages,
    targetPage,
    setTargetPage,
    possiblePageSizes = [10, 20, 50, 100],
    wide = true,
}) => {
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

    if (wide) {
        return (
            <div className="d-flex bg-light border rounded overflow-hidden"
                style={{ height: '38px', minWidth: '350px' }}
            >
                {/* Left: Page Jump */}
                <div className="d-flex align-items-center gap-2 px-3 w-50">
                    <span className="text-muted small">Page</span>
                    <CForm onSubmit={jumpToPage} className="d-flex align-items-center gap-2">
                        <CFormInput
                            type="number"
                            value={targetPage}
                            onInput={handleInput}
                            className="form-control-sm text-center"
                            style={{ width: '60px', borderRadius: '0.375rem' }}
                        />
                    </CForm>
                    <span className="text-muted small">of {totalPages}</span>
                </div>

                {/* Divider */}
                <div className="vr my-1" />

                {/* Right: Page Size Selector */}
                <div className="d-flex align-items-center justify-content-end gap-2 px-3 w-50">
                    <span className="text-muted small">Show:</span>
                    <CFormSelect
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        className="form-select-sm"
                        style={{ width: 'auto', minWidth: '80px', borderRadius: '0.375rem' }}
                    >
                        {possiblePageSizes.map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </CFormSelect>
                </div>
            </div>
        )
    } else {
        return (
            <div
                className="d-flex flex-column bg-light border rounded p-2 gap-2"
                style={{ minWidth: '1px' }}
            >
                {/* Page Jump */}
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Page</span>
                    <CForm onSubmit={jumpToPage} className="d-flex align-items-center gap-2">
                        <CFormInput
                            type="number"
                            value={targetPage}
                            onInput={handleInput}
                            className="form-control-sm text-center"
                            style={{ width: '60px', borderRadius: '0.375rem' }}
                        />
                    </CForm>
                    <span className="text-muted small">of {totalPages}</span>
                </div>

                {/* Divider */}
                <hr className="my-1" />

                {/* Page Size Selector */}
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Show:</span>
                    <CFormSelect
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        className="form-select-sm"
                        style={{ width: 'auto', minWidth: '80px', borderRadius: '0.375rem' }}
                    >
                        {possiblePageSizes.map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </CFormSelect>
                </div>
            </div>
        )
    }
}


const PaginatorBottomWhole = ({ table,
    visible = true,
    totalPages = table.getPageCount(),
    pageSize = 10,
    large = true
}) => {

    if (!visible) return
    const [possiblePageSizes, setPossiblePageSizes] = useState([
        pageSize,
        pageSize * 2,
        pageSize * 3,
        pageSize * 4,
        pageSize * 5,
    ])

    const [targetPage, setTargetPage] = useState(table.getState().pagination.pageIndex + 1)
    let buttonFontsize = "1rem"
    // let buttonWidth = "100%"
    let minButtonWidth = "200px"
    let nextText = "Next"
    let prevText = "Previous"

    if (!large) {
        // buttonFontsize = "0.8rem"
        // buttonWidth = "50%"
        minButtonWidth = "100px"
        nextText = ""
        prevText = ""
    }

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
        <>
            <CRow className="align-items-center">
                {/* Left Spacer */}
                <CCol xs="4" />

                {/* Centered Button Group */}
                <CCol xs="4" className="d-flex justify-content-center">
                    <CButtonGroup>
                        <CoreIconButton
                            icon={faAngleLeft}
                            text={prevText}
                            onClick={handlePrev}
                            disabled={!table.getCanPreviousPage()}
                            style={{
                                minWidth: minButtonWidth,
                                fontSize: buttonFontsize,
                                padding: '0.75rem 1.25rem',
                            }}
                        />
                        <CoreIconButton
                            icon={faAngleRight}
                            text={nextText}
                            color='primary'
                            isTextLeft={true}
                            onClick={handleNext}
                            disabled={!table.getCanNextPage()}
                            style={{
                                minWidth: minButtonWidth,
                                fontSize: buttonFontsize,
                                padding: '0.75rem 1.25rem',
                            }}
                        />
                    </CButtonGroup>
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <div className="d-flex justify-content-center my-2">
                        <TablePagination
                            table={table}
                            totalPages={totalPages}
                            targetPage={targetPage}
                            setTargetPage={setTargetPage}
                            wide={large}
                            possiblePageSizes={possiblePageSizes}
                        />
                    </div>
                </CCol>
            </CRow>
        </>
    )
}

export default PaginatorBottomWhole