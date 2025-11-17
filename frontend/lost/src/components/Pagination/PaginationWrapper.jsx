import PaginatorBottomPartial from './PaginatorBottomPartial'
import PaginatorBottomWhole from './PaginatorBottomWhole'

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
}) => {
  if (wholeData) {
    return (
      <PaginatorBottomWhole
        table={table}
        visible={visible}
        totalPages={totalPages}
        large={large}
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
