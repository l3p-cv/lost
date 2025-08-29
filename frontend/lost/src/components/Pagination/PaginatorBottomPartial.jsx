import {
    CCol,
    CRow,
    CPagination,
    CPaginationItem,
} from '@coreui/react'
import { faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from "react";
import PageSizeNavigator from './PageSizeNavigator';


const PaginatorBottomPartial = ({
    table,
    paginationState,
    setPaginationState,
    visible = true,
    totalPages = undefined,
    pageSize = 10,
    large = true // TODO: implement
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
    let buttonFontsize = "1rem"
    let buttonWidth = "100%"
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

    const handleJump = (pageTarget) => {
        setPaginationState(pageTarget => ({
            ...pageTarget,
            pageIndex: pageTarget
        }));
        table.setPageIndex(pageTarget)
    }

    const has2Previous = (paginationState.pageIndex > 1)
    const hasPrevious = (paginationState.pageIndex > 0)
    const hasNext = ((paginationState.pageIndex + 1) < totalPages)
    const has2Next = ((paginationState.pageIndex + 2) < totalPages)

    useEffect(() => {
        setTargetPage(paginationState.pageIndex + 1)
    }, [paginationState])

    const currentPageIndex = table.getState().pagination.pageIndex

    return (
        <>
            <CRow className='className="mt-3 d-flex justify-content-between align-items-center'>
                <CCol xs={large ? "auto": ""}
                    className="d-flex justify-content-center mt-1">
                    <CPagination aria-label="Page navigation" className="mb-0">
                        <CPaginationItem
                            aria-label="First"
                            onClick={() =>  {handleJump(0)}}
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
                            onClick={() => {handleJump(currentPageIndex-2)}}
                        >
                            {currentPageIndex - 1}
                        </CPaginationItem>
                        }
                        
                        {hasPrevious && 
                        <CPaginationItem 
                            onClick={() => {handleJump(currentPageIndex-1)}}
                        >
                            {currentPageIndex}
                        </CPaginationItem>
                        }

                        <CPaginationItem active>{currentPageIndex + 1}</CPaginationItem>

                        {hasNext && 
                        <CPaginationItem 
                            onClick={() => {handleJump(currentPageIndex + 1)}}
                        >
                            {currentPageIndex + 2}
                        </CPaginationItem>
                        }

                        {(has2Next && !hasPrevious) && 
                        <CPaginationItem 
                            onClick={() => {handleJump(currentPageIndex + 2)}}
                        >
                            {currentPageIndex + 3}
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
                            onClick={() => {handleJump(totalPages -1 )}}
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
                        setPaginationState={setPaginationState}
                        possiblePageSizes={possiblePageSizes}
                        buttonWidth={buttonWidth}
                        minButtonWidth={minButtonWidth}
                        wide={large}
                    />
                </CCol>
            </CRow>
        </>
    )
}

export default PaginatorBottomPartial