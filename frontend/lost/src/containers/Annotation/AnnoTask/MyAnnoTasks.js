import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Progress, Table, Card, CardHeader, CardBody, Row, Col } from 'reactstrap'
import { CRow, CCol } from '@coreui/react'
import { getColor } from './utils'
import AmountPerLabel from './AmountPerLabel'
import IconButton from '../../../components/IconButton'
import Modal from 'react-modal'

import actions from '../../../actions'
import { faChartBar, faTimes } from '@fortawesome/free-solid-svg-icons'

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

    renderTableBody() {
        return (
            <tbody>
                {this.props.annoTasks.map((annoTask) => {
                    let progress = Math.floor((annoTask.finished / annoTask.size) * 100)
                    if (annoTask.lastActivity) {
                        const twoWeeksAgo = new Date()
                        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
                        const lastActivityDate = new Date(annoTask.lastActivity)
                        if (
                            annoTask.status === 'finished' &&
                            lastActivityDate < twoWeeksAgo
                        ) {
                            return undefined
                        }
                    }
                    return (
                        <tr
                            key={annoTask.id}
                            style={
                                annoTask.status === 'inProgress'
                                    ? { cursor: 'pointer' }
                                    : { backgroundColor: '#CCCCCC' }
                            }
                        >
                            <td
                                className="text-center"
                                onClick={() => this.handleRowClick(annoTask)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div>{annoTask.name}</div>
                                <div className="small text-muted">ID: {annoTask.id}</div>
                            </td>
                            <td
                                onClick={() => this.handleRowClick(annoTask)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div>{annoTask.pipelineName}</div>
                                <div className="small text-muted">
                                    Created by: {annoTask.pipelineCreator}
                                </div>
                            </td>
                            <td
                                className="text-center"
                                onClick={() => this.handleRowClick(annoTask)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div>{annoTask.group}</div>
                            </td>
                            <td
                                onClick={() => this.handleRowClick(annoTask)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="clearfix">
                                    <div className="float-left">
                                        <strong>{progress}%</strong>
                                    </div>
                                    <div className="float-right">
                                        <small className="text-muted">
                                            Started at: {annoTask.createdAt}
                                        </small>
                                    </div>
                                </div>
                                <Progress
                                    className="progress-xs"
                                    color={getColor(progress)}
                                    value={progress}
                                />
                                <div className="small text-muted">
                                    {annoTask.finished}/{annoTask.size}
                                </div>
                            </td>
                            <td
                                className="text-center"
                                onClick={() => this.handleRowClick(annoTask)}
                                style={{ cursor: 'pointer' }}
                            >
                                <strong>{annoTask.type}</strong>
                            </td>
                            <td
                                onClick={() => this.handleRowClick(annoTask)}
                                style={{ cursor: 'pointer' }}
                            >
                                <strong>{annoTask.lastActivity}</strong>
                                <div className="small text-muted">
                                    by {annoTask.lastAnnotator}
                                </div>
                            </td>
                            <td>
                                <IconButton
                                    onClick={() => this.handleStatisticsClick(annoTask)}
                                    color="primary"
                                    isOutline={false}
                                    disabled={progress > 0 ? false : true}
                                    text="Statistic"
                                    icon={faChartBar}
                                />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        )
    }
    render() {
        return (
            <React.Fragment>
                {this.renderStatisticModal()}
                <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
                    <thead className="thead-light">
                        <tr>
                            <th className="text-center">Name</th>
                            <th className="text-center">Pipeline</th>
                            <th className="text-center">Group/User</th>
                            <th>Progress</th>
                            <th className="text-center">Annotation Type</th>
                            <th className="text-center">Activity</th>
                            <th className="text-center">Statistics</th>
                        </tr>
                    </thead>
                    {this.renderTableBody()}
                </Table>
            </React.Fragment>
        )
    }
}

function mapStateToProps(state) {
    return { specificAnnoTaskStatistic: state.annoTask.annoTaskStatistic }
}

export default connect(mapStateToProps, { getAnnoTaskStatistic })(MyAnnoTasks)
