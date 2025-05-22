import PaginatorBottomPartial from "./PaginatorBottomPartial"
import PaginatorBottomWhole from "./PaginatorBottomWhole"

const PaginationWrapper = ({
    table,
    pageSize,
    paginationState,
    setPaginationState,
    visible = true,
    totalPages = table.getPageCount(),
    wholeData = true,
    pageCount = undefined,
}) => {
    if (wholeData) {
        return (
            <PaginatorBottomWhole table={table} visible={visible} totalPages={totalPages} />
        )
    }
    return (
        <PaginatorBottomPartial table={table}
            visible={visible}
            totalPages={pageCount}
            pageSize={pageSize}
            paginationState={paginationState}
            setPaginationState={setPaginationState}
        />
    )

}

export default PaginationWrapper