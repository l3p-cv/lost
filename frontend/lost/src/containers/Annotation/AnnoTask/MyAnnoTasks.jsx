import { CButtonToolbar, CCard, CCardBody, CCardHeader, CCol, CFormInput, CModal, CProgress, CRow } from '@coreui/react'
import { faChartBar, faCheck, faPencil, faTimes } from '@fortawesome/free-solid-svg-icons'
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaFilter, FaTrashAlt } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import 'react-table/react-table.css'
import IconButton from '../../../components/IconButton'
import AmountPerLabel from './AmountPerLabel'
import { getColor } from './utils'
import actions from '../../../actions'
import * as atActions from '../../../actions/annoTask/anno_task_api'
import DropdownInput from '../../../components/DropdownInput'
// import DataTable from '../../../components/NewDataTable'
import CoreDataTable from '../../../components/CoreDataTable'
import BaseContainer from '../../../components/BaseContainer'
import CoreIconButton from '../../../components/CoreIconButton'
import ErrorBoundary from '../../../components/ErrorBoundary'

const { getAnnoTaskStatistic } = actions

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '85%',
        height: '85%',
        maxWidth: '75rem',
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.75)',
    },
}

const MyAnnoTasks = ({ callBack, annoTasks }) => {
    const { t } = useTranslation()
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [aTData, setATData] = useState([])
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(null)
    const [pageSize, setPageSize] = useState(10)
    const [annoTaskListRandKey, setAnnoTaskListRandKey] = useState()
    const [datatableInfo, setDatatableInfo] = useState()
    const dispatch = useDispatch()
    const specificAnnoTaskStatistic = useSelector(
        (state) => state.annoTask.annoTaskStatistic,
    )
    const [resetFilters, setResetFilters] = useState(false)
    const [beginFilterDate, setBeginFilterDate] = useState()
    const [endFilterDate, setEndFilterDate] = useState()
    const [filteredStates, setFilteredStates] = useState([])
    const [filteredName, setFilteredName] = useState('')

    const openModal = useCallback(() => setModalIsOpen(true), [])
    const closeModal = useCallback(() => setModalIsOpen(false), [])

    const handleRowClick = useCallback(
        (annoTask) => {
            const { id, type, status } = annoTask
            if (status === 'inProgress') {
                callBack(id, type)
            }
        },
        [callBack],
    )
    const {
        isLoading: isLoadingAnnoTaskListData,
        data: annoTaskListData,
        status,
        mutate,
    } = atActions.useAnnotaskListFiltered()

    const {
        data: filterLabels,
        isLoading: filterLabelsLoading,
        refetch: fetchFilterLabels,
    } = atActions.useFilterLabels()

    const handleStatisticsClick = useCallback(
        (annoTask) => {
            dispatch(getAnnoTaskStatistic(annoTask.id))
            openModal()
        },
        [dispatch, openModal],
    )
    useEffect(() => {
        fetchFilterLabels()
    }, [])

    const refetch = () => {
        mutate({
            pageSize: datatableInfo.pageSize,
            page: datatableInfo.page,
            annoTaskListRandKey,
            sorted: datatableInfo.sorted,
            filterOptions: {
                beginFilterDate,
                endFilterDate,
                filteredStates,
                filteredName,
            },
        })
    }
    useEffect(() => {
        if (annoTaskListRandKey) {
            refetch()
            fetchFilterLabels()
        }
    }, [annoTaskListRandKey])

    useEffect(() => {
        setAnnoTaskListRandKey(Date.now().toString())
    }, [])

    useEffect(() => {
        if (datatableInfo) {
            setPageSize(datatableInfo.pageSize)
            setPage(datatableInfo.page)
            setAnnoTaskListRandKey(Date.now().toString())
        }
    }, [datatableInfo])

    useEffect(() => {
      if (aTData.length > 0) {
        const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true'
        const currentStep = parseInt(localStorage.getItem('currentStep') || '0')
        if (joyrideRunning && currentStep === 30) {
          window.dispatchEvent(
            new CustomEvent('joyride-next-step', {
              detail: { step: 'latest-running-annotask' },
            })
          )
        }
      }
    }, [aTData])

    useEffect(() => {
        if (annoTaskListData) {
            setPages(annoTaskListData.pages)
            setATData(annoTaskListData.annoTasks)
        }
    }, [annoTaskListData])

    const handleStateUpdate = (label) => {
        setFilteredStates(label)
    }

    const applyFilter = () => {
        setAnnoTaskListRandKey(Date.now().toString())
    }

    useEffect(() => {
        setResetFilters(false)
    }, [resetFilters])

    const resetFilter = () => {
        setResetFilters(true)
        setFilteredName('')
    }

    const renderStatistic = () => {
        if (specificAnnoTaskStatistic) {
            return (
                <div>
                    <CRow>
                        <CCol xs="3" md="3" xl="3">
                            <div className="callout callout-danger">
                                <small className="text-muted">Working on</small>
                                <br />
                                <strong>{specificAnnoTaskStatistic.name}</strong>
                            </div>
                        </CCol>
                        <CCol xs="3" md="3" xl="3">
                            <div className="callout callout-info">
                                <small className="text-muted">Pipeline</small>
                                <br />
                                <strong>{specificAnnoTaskStatistic.pipelineName}</strong>
                            </div>
                        </CCol>
                        <CCol xs="3" md="3" xl="3">
                            <div className="callout callout-warning">
                                <small className="text-muted">Annotations</small>
                                <br />
                                <strong className="h4">
                                    {specificAnnoTaskStatistic.finished}/
                                    {specificAnnoTaskStatistic.size}
                                </strong>
                            </div>
                        </CCol>
                        <CCol xs="3" md="3" xl="3">
                            <div className="callout callout-success">
                                <small className="text-muted">Seconds/Annotation</small>
                                <br />
                                <strong className="h4">
                                    &#8709;{' '}
                                    {specificAnnoTaskStatistic.statistic.secondsPerAnno}
                                </strong>
                            </div>
                        </CCol>
                    </CRow>
                    <AmountPerLabel
                        stats={specificAnnoTaskStatistic.statistic.amountPerLabel}
                    />
                </div>
            )
        } else {
            return <div>No Data available.</div>
        }
    }

    const renderStatisticModal = () => (
        <CModal
            visible={modalIsOpen}
            onClose={() => {
                if (modalIsOpen){
                    closeModal()
                }
            }}
            ariaHideApp={false}
            contentLabel="Logfile"
        >
            <CCard style={{ height: '90%' }}>
                <CCardHeader>
                    <i className="icon-chart"></i> Statistics
                </CCardHeader>
                <CCardBody style={{ height: '100%' }}>{renderStatistic()}</CCardBody>
            </CCard>
            <CRow className="justify-content-end" style={{ marginRight: '5px' }}>
                <IconButton
                    isOutline={false}
                    color="secondary"
                    icon={faTimes}
                    text="Close"
                    onClick={() => {
                        if (modalIsOpen){
                            closeModal()
                        }
                    }}
                />
            </CRow>
        </CModal>
    )

    const defineColumns = () => {
        const columnHelper = createColumnHelper()

        let columns = []

        columns = [
            ...columns,
            columnHelper.accessor('name', {
                header: 'Name',
                cell: ({ row }) => (
                    <>
                        <div><b>{row.original.name}</b></div>
                        <div className="small text-muted">ID: {row.original.id}</div>
                    </>
                ),
                size: 250,
            }),
            columnHelper.accessor('pipelineName', {
                header: 'Pipeline',
                cell: ({ row }) => (
                    <>
                        <div><b>{row.original.pipelineName}</b></div>
                        <div className="small text-muted">
                            Created by: {row.original.pipelineCreator}
                        </div>
                    </>
                ),
            }),
            columnHelper.accessor('group', {
                header: 'Group / User',
                cell: ({ row }) => <div>{row.original.group}</div>,
            }),
            columnHelper.accessor('progress', {
                header: 'Progress',
                cell: ({ row }) => {
                    const progress = Math.floor(
                        (row.original.finished / row.original.size) * 100,
                    )
                    return (
                        <>
                            <div className="clearfix">
                                <div className="float-left">
                                    <strong>{progress}%</strong>
                                </div>
                                <div className="float-right">
                                    <small className="text-muted">
                                        Started at:{' '}
                                        {new Date(
                                            row.original.createdAt,
                                        ).toLocaleString()}
                                    </small>
                                </div>
                            </div>
                            <CProgress
                                className="progress-xs"
                                color={getColor(progress)}
                                value={progress}
                            />
                            <div className="small text-muted">
                                {row.original.finished}/{row.original.size}
                            </div>
                        </>
                    )
                },
                size: 300,
            }),
            columnHelper.accessor('type', {
                header: 'Annotation Type',
                cell: ({ row }) => <strong>{row.original.type}</strong>,
            }),
            columnHelper.accessor('lastActivity', {
                header: 'Activity',
                cell: ({ row }) => (
                    <>
                        {row.original.lastActivity ? (
                            <>
                                <strong>
                                    {new Date(row.original.lastActivity).toLocaleString()}
                                </strong>
                                <div className="small text-muted">
                                    by {row.original.lastAnnotator}
                                </div>
                            </>
                        ) : (
                            ''
                        )}
                    </>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const progress = Math.floor(
                        (row.original.finished / row.original.size) * 100,
                    )
                    return (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap'
                        }}>
                        <CoreIconButton
                            onClick={() => handleStatisticsClick(row.original)}
                            color="info"
                            style={{marginRight: 5}}
                            disabled={progress > 0 ? false : true}
                            // text="Statistic"
                            toolTip='Show Statistics'
                            isOutline={true}
                            icon={faChartBar}
                        />
                        {row.original.status === 'inProgress' ? (
                            <CoreIconButton
                                style={{marginRight: 5}}
                                onClick={() => handleRowClick(row.original)}
                                color="primary"
                                text="Annotate"
                                toolTip='Annotate this Task'
                                isOutline={true}
                                icon={faPencil}
                            />
                        ) : (
                            <CoreIconButton
                                style={{marginRight: 5}}
                                onClick={() => handleRowClick(row.original)}
                                color="primary"
                                isOutline={false}
                                disabled
                                text="Finished"
                                icon={faCheck}
                            />
                        )}
                        </div>
                    )
                },
            }),
        ]

        return columns
    }

    const stateAnnoTask = [
        { id: 2, label: 'In progress' },
        { id: 3, label: 'Finished' },
    ]

    const getRowClassName = (original, index) => {
    if (aTData.length === 0) return ''
            const newestTask = aTData.reduce((newest, current) => 
            current.id > newest.id ? current : newest
        )
        
        return original.id === newestTask.id ? 'first-row-class' : ''
    }

    const renderFilter = () => {
        return (
            <>
                {filterLabels && (
                    <>
                    <ErrorBoundary>
                        <CCol>
                            <CButtonToolbar
                                // className="justify-left"
                                style={{
                                    marginBottom: 10,
                                    marginTop: 10,
                                }}
                            >
                                <DropdownInput
                                    onLabelUpdate={(label) => handleStateUpdate(label)}
                                    placeholder={'State'}
                                    options={stateAnnoTask}
                                    reset={resetFilters}
                                />
                                <CFormInput
                                    type="search"
                                    style={{ width: 200, marginLeft: 20 }}
                                    value={filteredName}
                                    onChange={(e) => {
                                        setFilteredName(e.target.value)
                                    }}
                                    relatedId={[1]}
                                    placeholder="Name"
                                />
                                <CoreIconButton
                                    onClick={() => resetFilter()}
                                    color="danger"
                                    isOutline={true}
                                    style={{ marginLeft: 20 }}
                                    text="Reset filter"
                                    icon={<FaTrashAlt />}
                                />
                                <CoreIconButton
                                    onClick={() => applyFilter()}
                                    color="info"
                                    isOutline={true}
                                    style={{ marginLeft: 20 }}
                                    text="Apply filter"
                                    icon={<FaFilter />}
                                />
                            </CButtonToolbar>
                            <CButtonToolbar
                                className=" justify-content-between "
                                style={{
                                    marginBottom: 10,
                                    marginTop: 10,
                                }}
                            >
                                {/* <CCol className="d-flex">
                                    <div style={{ margin: 'auto', marginLeft: 0 }}>
                                        <SingleInputDateRangePicker
                                            style={{ marginLeft: 5 }}
                                            beginDate={beginFilterDate}
                                            endDate={endFilterDate}
                                            setBeginDate={setBeginFilterDate}
                                            setEndDate={setEndFilterDate}
                                            disabled={false}
                                            showPopUp={false}
                                        />
                                    </div>
                                </CCol> */}
                                <CCol className="justify-content-end d-flex"></CCol>
                            </CButtonToolbar>
                        </CCol>
                    </ErrorBoundary>
                    </>
                )}
            </>
        )
    }

    const [lastRequestedPage, setLastRequestedPage] = useState(0)
    const columns = useMemo(() => defineColumns())
    return (
        <>
            {renderStatisticModal()}
            <CCol sm="12">{filterLabels && renderFilter()}</CCol>
                <hr />
                <ErrorBoundary>
                <CoreDataTable
                    columns={columns}
                    tableData={aTData}
                    onPaginationChange={(table) => {
                        const nextPage = table.getState().pagination.pageIndex;
                        setLastRequestedPage(nextPage);
                        // setATData([]); // simulate fetch
                        const tableState = table.getState()
                        setDatatableInfo({
                            pageSize: tableState.pagination.pageSize,
                            page: tableState.pagination.pageIndex,
                            sorted: tableState.sorting,
                            filtered: tableState.columnFilters,
                        })
                    }}
                    pageCount={pages}
                    wholeData={false}
                    getRowClassName={getRowClassName}
                />
                </ErrorBoundary>
        </>
    )
}

export default MyAnnoTasks