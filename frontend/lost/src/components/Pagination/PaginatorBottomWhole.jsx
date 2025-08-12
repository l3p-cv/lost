import {
    CCol,
    CRow,
    CPagination,
    CPaginationItem,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons'
import React, { useState } from "react";
import PageSizeNavigator from './PageSizeNavigator';

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

    const handleJump=(page) => {
        table.setPageIndex(page - 1);
        setTargetPage(page)
    }

    const has2Previous = (table.getState().pagination.pageIndex > 1)
    const hasPrevious = (table.getState().pagination.pageIndex > 0)
    const hasNext = ((table.getState().pagination.pageIndex + 1) < totalPages)
    const has2Next = ((table.getState().pagination.pageIndex + 2) < totalPages)
    const currentPage=table.getState().pagination.pageIndex + 1

    return (
        <>
            <CRow 
                className='className="mt-3 d-flex justify-content-between align-items-center'
            >
                <CCol xs={large ? "auto": ""}
                    className="d-flex justify-content-center mt-1"
                >
                    <CPagination aria-label="Page navigation" className="mb-0">
                        <CPaginationItem
                            aria-label="First"
                            onClick={() =>  {handleJump(1)}}
                            disabled={!hasPrevious}
                            style={{ cursor: hasPrevious ? 'pointer' : 'not-allowed' }}
                        >
                            <FontAwesomeIcon icon={faAnglesLeft} />
                        </CPaginationItem>
                        
                        <CPaginationItem
                            aria-label="Previous"
                            onClick={handlePrev}
                            disabled={!hasPrevious}
                            style={{ cursor: hasPrevious ? 'pointer' : 'not-allowed' }}
                        >
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </CPaginationItem>

                        {(has2Previous && !hasNext) &&
                        <CPaginationItem
                            onClick={() => {handleJump(currentPage-2)}}
                        >
                            {currentPage - 2}
                        </CPaginationItem>
                        }
                        
                        {hasPrevious && 
                        <CPaginationItem 
                            onClick={() => {handleJump(currentPage-1)}}
                        >
                            {currentPage - 1}
                        </CPaginationItem>
                        }

                        <CPaginationItem active>{currentPage}</CPaginationItem>

                        {hasNext && 
                        <CPaginationItem 
                            onClick={() => {handleJump(currentPage + 1)}}
                        >
                            {currentPage + 1}
                        </CPaginationItem>
                        }

                        {(has2Next && !hasPrevious) && 
                        <CPaginationItem 
                            onClick={() => {handleJump(currentPage + 2)}}
                        >
                            {currentPage + 2}
                        </CPaginationItem>
                        }

                        <CPaginationItem
                            aria-label="Next"
                            onClick={handleNext}
                            disabled={!hasNext}
                            style={{ cursor: hasNext ? 'pointer' : 'not-allowed' }}
                        >
                            <FontAwesomeIcon icon={faAngleRight} />
                        </CPaginationItem>

                        <CPaginationItem
                            aria-label="Last"
                            onClick={() => {handleJump(totalPages)}}
                            disabled={!hasNext}
                            style={{ cursor: hasNext ? 'pointer' : 'not-allowed' }}
                        >
                            <FontAwesomeIcon icon={faAnglesRight} />
                        </CPaginationItem>
                    </CPagination>
                </CCol>
                <CCol xs={large ? "auto": ""}
                    className="d-flex justify-content-center mt-1"
                >
                    <PageSizeNavigator
                        table={table}
                        totalPages={totalPages}
                        targetPage={targetPage}
                        setTargetPage={setTargetPage}
                        // setPaginationState={setPaginationState}
                        possiblePageSizes={possiblePageSizes}
                        // buttonWidth={buttonWidth}
                        minButtonWidth={minButtonWidth}
                        wide={true}
                    />
                </CCol>
            </CRow>
        </>
    )
}

export default PaginatorBottomWhole