import {
    CForm,
    CFormInput,
    CFormSelect,
} from '@coreui/react'
import React from "react";


const PageSizeNavigator = ({
    table,
    totalPages,
    targetPage,
    setTargetPage,
    setPaginationState=()=>{},
    possiblePageSizes = [10, 20, 50, 100],
    buttonWidth,
    minButtonWidth,
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
        setPaginationState(prev => ({
            ...prev,
            pageIndex: actualPage - 1
        }));
        table.setPageIndex(actualPage - 1);
        console.log("Paginator set table to: ", table)
    }

        return (
            <div
                className={wide ? "d-flex bg-light border rounded overflow-hidden" : "d-flex flex-column bg-light border rounded p-2 gap-2"}
                style={wide ? { height: '40px', minWidth: '310px' } : { minWidth: '1px' }}
            >
                {/* Left: Page Jump */}
                <div className="d-flex align-items-center gap-2 px-3">
                    <span className="text-muted small">Page</span>
                    <CForm onSubmit={jumpToPage} className="d-flex align-items-center gap-2">
                        <CFormInput
                            max={totalPages}
                            min={1}
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
                {wide && 
                <div className={"vr my-1"} />
                }
                {!wide &&
                <hr className="my-1" />
                }

                {/* Right: Page Size Selector */}
                <div className="d-flex align-items-center justify-content-end gap-2 px-3">
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

export default PageSizeNavigator