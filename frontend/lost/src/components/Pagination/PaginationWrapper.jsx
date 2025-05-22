import PaginatorBottomPartial from "./PaginatorBottomPartial"
import PaginatorBottomWhole from "./PaginatorBottomWhole"

const PaginationWrapper = ({
    table,
    tableData,
    pageSize,
    paginationState,
    setPaginationState,
    dataTemp = undefined,
    setDataTemp=()=>{},
    visible = true,
    totalPages = table.getPageCount(),
    wholeData = true,
    onpaginationChange = () => { },
    pageCount=undefined,
}) => {


    if (wholeData) {
        return (
            <PaginatorBottomWhole table={table} visible={visible} totalPages={totalPages} />
        )
    }

    return (
        <PaginatorBottomPartial table={table} visible={visible} pageSize={pageSize}
            tableData={tableData}
            onPaginationChange={onpaginationChange}
            totalPages={pageCount}
            dataTemp={dataTemp}
            setDataTemp={setDataTemp}
            paginationState={paginationState}
            setPaginationState={setPaginationState}
        />
    )

}


export default PaginationWrapper