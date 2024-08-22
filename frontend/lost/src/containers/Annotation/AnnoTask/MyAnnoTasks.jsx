import React, { useState, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Progress, Card, CardHeader, CardBody, Row, Col } from 'reactstrap'
import { CRow } from '@coreui/react'
import { getColor } from './utils'
import AmountPerLabel from './AmountPerLabel'
import IconButton from '../../../components/IconButton'
import Modal from 'react-modal'
import { createColumnHelper } from '@tanstack/react-table'
import 'react-table/react-table.css'

import DataTable from '../../../components/NewDataTable'
import actions from '../../../actions'
import * as atActions from '../../../actions/annoTask/anno_task_api'
import { faChartBar, faCheck, faPencil, faTimes } from '@fortawesome/free-solid-svg-icons'

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

    const handleStatisticsClick = useCallback(
        (annoTask) => {
            dispatch(getAnnoTaskStatistic(annoTask.id))
            openModal()
        },
        [dispatch, openModal],
    )

    const refetch = () => {
        mutate({
            pageSize: datatableInfo.pageSize,
            page: datatableInfo.page,
            annoTaskListRandKey,
            sorted: datatableInfo.sorted,
            filterOptions: {},
        })
    }
    useEffect(() => {
        if (annoTaskListRandKey) {
            refetch()
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
        if (annoTaskListData) {
            setPages(annoTaskListData.pages)
            setATData(annoTaskListData.rows)
        }
    }, [annoTaskListData])

    const renderStatistic = () => {
        if (specificAnnoTaskStatistic) {
            return (
                <div>
                    <Row>
                        <Col xs="3" md="3" xl="3">
                            <div className="callout callout-danger">
                                <small className="text-muted">Working on</small>
                                <br />
                                <strong>{specificAnnoTaskStatistic.name}</strong>
                            </div>
                        </Col>
                        <Col xs="3" md="3" xl="3">
                            <div className="callout callout-info">
                                <small className="text-muted">Pipeline</small>
                                <br />
                                <strong>{specificAnnoTaskStatistic.pipelineName}</strong>
                            </div>
                        </Col>
                        <Col xs="3" md="3" xl="3">
                            <div className="callout callout-warning">
                                <small className="text-muted">Annotations</small>
                                <br />
                                <strong className="h4">
                                    {specificAnnoTaskStatistic.finished}/
                                    {specificAnnoTaskStatistic.size}
                                </strong>
                            </div>
                        </Col>
                        <Col xs="3" md="3" xl="3">
                            <div className="callout callout-success">
                                <small className="text-muted">Seconds/Annotation</small>
                                <br />
                                <strong className="h4">
                                    &#8709;{' '}
                                    {specificAnnoTaskStatistic.statistic.secondsPerAnno}
                                </strong>
                            </div>
                        </Col>
                    </Row>
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
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            ariaHideApp={false}
            contentLabel="Logfile"
        >
            <Card style={{ height: '90%' }}>
                <CardHeader>
                    <i className="icon-chart"></i> Statistics
                </CardHeader>
                <CardBody style={{ height: '100%' }}>{renderStatistic()}</CardBody>
            </Card>
            <CRow className="justify-content-end" style={{ marginRight: '5px' }}>
                <IconButton
                    isOutline={false}
                    color="secondary"
                    icon={faTimes}
                    text="Close"
                    onClick={closeModal}
                />
            </CRow>
        </Modal>
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
                        <div>{row.original.name}</div>
                        <div className="small text-muted">ID: {row.original.id}</div>
                    </>
                ),
                size: 250,
            }),
            columnHelper.accessor('pipelineName', {
                header: 'Pipeline',
                cell: ({ row }) => (
                    <>
                        <div>{row.original.pipelineName}</div>
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
                            <Progress
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
                id: 'statistic',
                header: 'Statistic',
                cell: ({ row }) => {
                    const progress = Math.floor(
                        (row.original.finished / row.original.size) * 100,
                    )
                    return (
                        <IconButton
                            onClick={() => handleStatisticsClick(row.original)}
                            color="primary"
                            disabled={progress > 0 ? false : true}
                            text="Statistic"
                            icon={faChartBar}
                        />
                    )
                },
            }),
            columnHelper.display({
                id: 'annotate',
                header: 'Annotate',
                cell: ({ row }) => {
                    const progress = Math.floor(
                        (row.original.finished / row.original.size) * 100,
                    )
                    return (
                        <>
                            {row.original.status === 'inProgress' ? (
                                <IconButton
                                    onClick={() => handleRowClick(row.original)}
                                    color="primary"
                                    isOutline={false}
                                    text="Annotate"
                                    icon={faPencil}
                                />
                            ) : (
                                <IconButton
                                    onClick={() => handleRowClick(row.original)}
                                    color="primary"
                                    isOutline={false}
                                    disabled
                                    text="Finished"
                                    icon={faCheck}
                                />
                            )}
                        </>
                    )
                },
            }),
        ]

        return columns
    }

    return (
        <>
            {renderStatisticModal()}
            {/* <ReactTable
                columns={[
                    {
                        Header: 'Name',
                        accessor: 'name',
                        width: 250,
                        Cell: (row) => (
                            <>
                                <div>{row.original.name}</div>
                                <div className="small text-muted">
                                    ID: {row.original.id}
                                </div>
                            </>
                        ),
                    },
                    {
                        Header: 'Pipeline',
                        accessor: 'pipelineName',
                        Cell: (row) => (
                            <>
                                <div>{row.original.pipelineName}</div>
                                <div className="small text-muted">
                                    Created by: {row.original.pipelineCreator}
                                </div>
                            </>
                        ),
                    },
                    {
                        Header: 'Group / User',
                        accessor: 'group',
                        Cell: (row) => <div>{row.original.group}</div>,
                    },
                    {
                        Header: 'Progress',
                        accessor: 'progress',
                        width: 300,
                        Cell: (row) => {
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
                                    <Progress
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
                    },
                    {
                        Header: 'Annotation Type',
                        accessor: 'type',
                        Cell: (row) => <strong>{row.original.type}</strong>,
                    },
                    {
                        Header: 'Activity',
                        accessor: 'lastActivity',
                        Cell: (row) => (
                            <>
                                {row.original.lastActivity ? (
                                    <>
                                        <strong>
                                            {new Date(
                                                row.original.lastActivity,
                                            ).toLocaleString()}
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
                    },
                    {
                        Header: 'Statistic',
                        accessor: 'statistic',
                        Cell: (row) => {
                            const progress = Math.floor(
                                (row.original.finished / row.original.size) * 100,
                            )
                            return (
                                <IconButton
                                    onClick={() => handleStatisticsClick(row.original)}
                                    color="primary"
                                    disabled={progress > 0 ? false : true}
                                    text="Statistic"
                                    icon={faChartBar}
                                />
                            )
                        },
                    },
                    {
                        Header: 'Annotate',
                        accessor: 'annotate',
                        Cell: (row) => {
                            const progress = Math.floor(
                                (row.original.finished / row.original.size) * 100,
                            )
                            return (
                                <>
                                    {row.original.status === 'inProgress' ? (
                                        <IconButton
                                            onClick={() => handleRowClick(row.original)}
                                            color="primary"
                                            isOutline={false}
                                            text="Annotate"
                                            icon={faPencil}
                                        />
                                    ) : (
                                        <IconButton
                                            onClick={() => handleRowClick(row.original)}
                                            color="primary"
                                            isOutline={false}
                                            disabled
                                            text="Finished"
                                            icon={faCheck}
                                        />
                                    )}
                                </>
                            )
                        },
                    },
                ]}
                defaultSorted={[
                    {
                        id: 'lastActivity',
                        desc: false,
                    },
                ]}
                data={annoTasks}
                defaultPageSize={10}
                className="-striped -highlight"
            /> */}
            <DataTable
                className="mt-3"
                data={aTData}
                columns={defineColumns()}
                onPaginationChange={(table) => {
                    setATData([])
                    const tableState = table.getState()
                    setDatatableInfo({
                        pageSize: tableState.pagination.pageSize,
                        page: tableState.pagination.pageIndex,
                        sorted: tableState.sorting,
                        filtered: tableState.columnFilters,
                    })
                }}
                pageCount={pages}
            />
        </>
    )
}

export default MyAnnoTasks
