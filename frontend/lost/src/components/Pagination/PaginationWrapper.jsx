import PaginatorBottomPartial from "./PaginatorBottomPartial"
import PaginatorBottomWhole from "./PaginatorBottomWhole"

const PaginationWrapper = ({
    table,
    visible = true,
    totalPages = table.getPageCount(),
    wholeData = true
}) => {


    if (wholeData) {
        return (
            <PaginatorBottomWhole table={table} visible={visible} totalPages={totalPages} />
        )
    }

    return (
        <PaginatorBottomPartial table={table} visible={visible} totalPages={totalPages} />
    )

}


export default PaginationWrapper