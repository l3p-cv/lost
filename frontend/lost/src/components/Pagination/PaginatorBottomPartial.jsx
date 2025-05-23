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


const TablePagination = ({ table,
    totalPages,
    targetPage,
    setTargetPage,
    setPaginationState,
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
        setPaginationState(prev => ({
            ...prev,
            pageIndex: actualPage - 1
        }));
        table.setPageIndex(actualPage - 1);
        console.log("Paginator set table to: ", table)
    }

    return (
        <div
            className="d-inline-flex align-items-center gap-2 my-2 text-muted small"
            style={{
                border: '1px solid var(--cui-secondary)', // outer border
                borderRadius: '0.25rem',     
                padding: '0.05rem 0.05rem',  
                backgroundColor: 'var(--cui-light',
                height: "35px"
            }}
        >
            <span>Page</span>
            <CForm onSubmit={jumpToPage}>
                <CFormInput
                    id="currentPageShown2"
                    type="number"
                    value={targetPage}
                    onInput={handleInput}
                    className="text-center"
                    size="sm"
                    style={{
                        width: '60px',
                        border: '1px solid var(--cui-secondary)', // inner border
                        borderRadius: '0.5rem',
                    }}
                />
            </CForm>
            <span>of {totalPages}</span>
        </div>
    )
}


const PaginatorBottomPartial = ({
    table,
    paginationState,
    setPaginationState,
    visible = true,
    totalPages = undefined,
    pageSize = 10,
}) => {

    if (!visible) return
    const [possiblePageSizes, setPossiblePageSizes] = useState([
        pageSize,
        pageSize * 2,
        pageSize * 3,
        pageSize * 4,
        pageSize * 5,
    ])

    const [targetPage, setTargetPage] = useState(paginationState.pageIndex + 1);
    const buttonFontsize = "1rem"
    const buttonWidth = "100%"

    const handlePrev = () => {
        const prevIndex = paginationState.pageIndex + -1
        setPaginationState(prev => ({
            ...prev,
            pageIndex: prevIndex
        }));
        table.setPageIndex(prevIndex)
    }

    const handleNext = () => {
        const nextIndex = paginationState.pageIndex + 1
        setPaginationState(prev => ({
            ...prev,
            pageIndex: nextIndex
        }));
        table.setPageIndex(nextIndex)
    }

    function changePageState(num) {
        setPaginationState(() => ({
            ...paginationState,
            pageSize: num
        }))
        table.setPageSize(num)
    }

    const hasPrevious = (paginationState.pageIndex > 0)
    const hasNext = ((paginationState.pageIndex + 1) < totalPages)

    useEffect(() => {
        setTargetPage(paginationState.pageIndex + 1)
    }, [paginationState])

    return (
        <CRow>
            <CCol>
                <IconButton
                    icon={faAngleLeft}
                    text="Previous"
                    onClick={handlePrev}
                    disabled={!hasPrevious}
                    style={{ fontSize: buttonFontsize, padding: '0.75rem 1.5rem', width: buttonWidth }}
                />
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
                <div className="d-flex align-items-center gap-2 justify-content-center my-2">
                    <CFormSelect
                        id="pageSize"
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => changePageState(Number(e.target.value))}
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
                <IconButton
                    icon={faAngleRight}
                    text="Next"
                    onClick={handleNext}
                    disabled={!hasNext}
                    style={{
                        float: 'right', fontSize: buttonFontsize, padding: '0.75rem 1.5rem',
                        width: buttonWidth
                    }}
                />
            </CCol>
        </CRow>
    )
}

export default PaginatorBottomPartial