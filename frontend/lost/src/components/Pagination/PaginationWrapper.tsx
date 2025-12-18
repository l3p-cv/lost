import PaginatorBottomPartial from './PaginatorBottomPartial'
import PaginatorBottomWhole from './PaginatorBottomWhole'

type PaginationWrapperProps = {
  table
  pageSize: number
  paginationState: { pageSize: number; pagieIndex: number }
  visible: boolean
  totalPages: number
  wholeData: boolean
  pageCount: number
  large: boolean
  setPaginationState: (arg1: number) => void
}

const PaginationWrapper = ({
  table,
  pageSize,
  paginationState,
  setPaginationState,
  visible = true,
  totalPages = table.getPageCount(),
  wholeData = true,
  pageCount = undefined,
  large = true,
}: PaginationWrapperProps) => {
  if (wholeData) {
    return (
      <PaginatorBottomWhole
        table={table}
        visible={visible}
        totalPages={totalPages}
        large={large}
        pageSize={pageSize}
      />
    )
  }
  return (
    <PaginatorBottomPartial
      table={table}
      visible={visible}
      totalPages={pageCount}
      pageSize={pageSize}
      paginationState={paginationState}
      setPaginationState={setPaginationState}
      large={large}
    />
  )
}

export default PaginationWrapper
