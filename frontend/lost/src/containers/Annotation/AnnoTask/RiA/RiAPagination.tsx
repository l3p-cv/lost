import { CPagination, CPaginationItem, CRow } from '@coreui/react'
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type RiAPaginationProps = {
  // 0-based current page (already clamped by the parent)
  page: number
  pageCount: number
  onChange: (page: number) => void
}

// PaginatorBottomWhole look without the tanstack table — plain page state
const RiAPagination = ({ page, pageCount, onChange }: RiAPaginationProps) => {
  if (pageCount <= 1) return null

  return (
    <CRow className="d-flex justify-content-center mt-3">
      <CPagination aria-label="Page navigation" className="mb-0">
        <CPaginationItem
          aria-label="First"
          disabled={page === 0}
          onClick={() => onChange(0)}
          style={{ cursor: page === 0 ? 'not-allowed' : 'pointer' }}
        >
          <FontAwesomeIcon icon={faAnglesLeft} />
        </CPaginationItem>
        <CPaginationItem
          aria-label="Previous"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          style={{ cursor: page === 0 ? 'not-allowed' : 'pointer' }}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
        </CPaginationItem>
        {page > 1 && (
          <CPaginationItem onClick={() => onChange(page - 2)}>{page - 1}</CPaginationItem>
        )}
        {page > 0 && (
          <CPaginationItem onClick={() => onChange(page - 1)}>{page}</CPaginationItem>
        )}
        <CPaginationItem active>{page + 1}</CPaginationItem>
        {page + 1 < pageCount && (
          <CPaginationItem onClick={() => onChange(page + 1)}>{page + 2}</CPaginationItem>
        )}
        {page + 2 < pageCount && (
          <CPaginationItem onClick={() => onChange(page + 2)}>{page + 3}</CPaginationItem>
        )}
        <CPaginationItem
          aria-label="Next"
          disabled={page + 1 >= pageCount}
          onClick={() => onChange(page + 1)}
          style={{ cursor: page + 1 >= pageCount ? 'not-allowed' : 'pointer' }}
        >
          <FontAwesomeIcon icon={faAngleRight} />
        </CPaginationItem>
        <CPaginationItem
          aria-label="Last"
          disabled={page + 1 >= pageCount}
          onClick={() => onChange(pageCount - 1)}
          style={{ cursor: page + 1 >= pageCount ? 'not-allowed' : 'pointer' }}
        >
          <FontAwesomeIcon icon={faAnglesRight} />
        </CPaginationItem>
      </CPagination>
    </CRow>
  )
}

export default RiAPagination