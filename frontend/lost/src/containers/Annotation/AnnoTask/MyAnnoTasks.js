import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Progress, Card, CardHeader, CardBody, Row, Col } from 'reactstrap'
import { CRow } from '@coreui/react'
import { getColor } from './utils'
import AmountPerLabel from './AmountPerLabel'
import IconButton from '../../../components/IconButton'
import Modal from 'react-modal'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

import actions from '../../../actions'
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

class MyAnnoTasks extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalIsOpen: false,
        }

        this.openModal = this.openModal.bind(this)
        this.afterOpenModal = this.afterOpenModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
    }

    openModal() {
        this.setState({ modalIsOpen: true })
    }

    afterOpenModal() {
        // references are now sync'd and can be accessed.
        //this.subtitle.style.color = '#f00';
    }

    closeModal() {
        this.setState({ modalIsOpen: false })
    }

    handleRowClick(annoTask) {
        const { id, type, status } = annoTask
        if (status === 'inProgress') {
            this.props.callBack(id, type)
        }
    }
    handleStatisticsClick(annoTask) {
        this.props.getAnnoTaskStatistic(annoTask.id)

        this.openModal()
    }
    renderStatisticModal() {
        return (
            <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                style={customStyles}
                ariaHideApp={false}
                contentLabel="Logfile"
            >
                <Card style={{ height: '90%' }}>
                    <CardHeader>
                        <i className="icon-chart"></i> Statistics
                    </CardHeader>
                    <CardBody style={{ height: '100%' }}>
                        {this.renderStatistic()}
                    </CardBody>
                </Card>
                <CRow className="justify-content-end" style={{ marginRight: '5px' }}>
                    <IconButton
                        isOutline={false}
                        color="secondary"
                        icon={faTimes}
                        text="Close"
                        onClick={this.closeModal}
                    ></IconButton>
                </CRow>
            </Modal>
        )
    }

    renderStatistic() {
        if (this.props.specificAnnoTaskStatistic) {
            return (
                <div>
                    <Row>
                        <Col xs="3" md="3" xl="3">
                            <div className="callout callout-danger">
                                <small className="text-muted">Working on</small>
                                <br />
                                <strong>
                                    {this.props.specificAnnoTaskStatistic.name}
                                </strong>
                            </div>
                        </Col>
                        <Col xs="3" md="3" xl="3">
                            <div className="callout callout-info">
                                <small className="text-muted">Pipeline</small>
                                <br />
                                <strong>
                                    {this.props.specificAnnoTaskStatistic.pipelineName}
                                </strong>
                            </div>
                        </Col>
                        <Col xs="3" md="3" xl="3">
                            <div className="callout callout-warning">
                                <small className="text-muted">Annotations</small>
                                <br />
                                <strong className="h4">
                                    {this.props.specificAnnoTaskStatistic.finished}/
                                    {this.props.specificAnnoTaskStatistic.size}
                                </strong>
                            </div>
                        </Col>
                        <Col xs="3" md="3" xl="3">
                            <div className="callout callout-success">
                                <small className="text-muted">Seconds/Annotation</small>
                                <br />
                                <strong className="h4">
                                    &#8709;{' '}
                                    {
                                        this.props.specificAnnoTaskStatistic.statistic
                                            .secondsPerAnno
                                    }
                                </strong>
                            </div>
                        </Col>
                    </Row>
                    <AmountPerLabel
                        stats={
                            this.props.specificAnnoTaskStatistic.statistic.amountPerLabel
                        }
                    ></AmountPerLabel>
                </div>
            )
        } else return <div>No Data available.</div>
    }

    render() {
        return (
            <React.Fragment>
                {this.renderStatisticModal()}
                <ReactTable
                    columns={[
                        {
                            Header: 'Name',
                            accessor: 'name',
                            width: 250,
                            Cell: (row) => {
                                return (
                                    <>
                                        <div>{row.original.name}</div>
                                        <div className="small text-muted">
                                            ID: {row.original.id}
                                        </div>
                                    </>
                                )
                            },
                        },
                        {
                            Header: 'Pipeline',
                            accessor: 'name',
                            Cell: (row) => {
                                return (
                                    <>
                                        <div>{row.original.pipelineName}</div>
                                        <div className="small text-muted">
                                            Created by: {row.original.pipelineCreator}
                                        </div>
                                    </>
                                )
                            },
                        },
                        {
                            Header: 'Group / User',
                            accessor: 'name',
                            Cell: (row) => {
                                return <div>{row.original.group}</div>
                            },
                        },
                        {
                            Header: 'Progress',
                            accessor: 'name',
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
                            accessor: 'name',
                            Cell: (row) => {
                                return <strong>{row.original.type}</strong>
                            },
                        },
                        {
                            Header: 'Activity',
                            accessor: 'name',
                            Cell: (row) => {
                                return (
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
                                                </div>{' '}
                                            </>
                                        ) : (
                                            ''
                                        )}
                                    </>
                                )
                            },
                        },
                        {
                            Header: 'Statistic',
                            accessor: 'name',
                            Cell: (row) => {
                                const progress = Math.floor(
                                    (row.original.finished / row.original.size) * 100,
                                )
                                return (
                                    <>
                                        <IconButton
                                            onClick={() =>
                                                this.handleStatisticsClick(row.original)
                                            }
                                            color="primary"
                                            disabled={progress > 0 ? false : true}
                                            text="Statistic"
                                            icon={faChartBar}
                                        />
                                    </>
                                )
                            },
                        },
                        {
                            Header: 'Annotate',
                            accessor: 'name',
                            Cell: (row) => {
                                const progress = Math.floor(
                                    (row.original.finished / row.original.size) * 100,
                                )
                                return (
                                    <>
                                        {row.original.status === 'inProgress' ? (
                                            <IconButton
                                                onClick={() =>
                                                    this.handleRowClick(row.original)
                                                }
                                                color="primary"
                                                isOutline={false}
                                                text="Annotate"
                                                icon={faPencil}
                                            />
                                        ) : (
                                            <IconButton
                                                onClick={() =>
                                                    this.handleRowClick(row.original)
                                                }
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
                    data={this.props.annoTasks}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />
            </React.Fragment>
        )
    }
}

function mapStateToProps(state) {
    return { specificAnnoTaskStatistic: state.annoTask.annoTaskStatistic }
}

export default connect(mapStateToProps, { getAnnoTaskStatistic })(MyAnnoTasks)
