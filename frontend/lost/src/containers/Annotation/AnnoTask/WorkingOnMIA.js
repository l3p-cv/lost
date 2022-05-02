import React, { Component } from 'react'
import { Progress } from 'reactstrap'
import { getColor } from './utils'
import { Alert, Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import Modal from 'react-modal'

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.75)',
    },
}

class WorkingOnMIA extends Component {
    constructor() {
        super()

        this.state = {
            modalIsOpen: true,
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

    render() {
        if (this.props.annoTask !== null) {
            let progress = Math.floor(
                (this.props.annoTask.finished / this.props.annoTask.size) * 100,
            )
            return (
                <div>
                    <Row>
                        <Col xs="2" md="2" xl="2">
                            <div className="callout callout-danger">
                                <small className="text-muted">Working on</small>
                                <br />
                                <strong>{this.props.annoTask.name}</strong>
                            </div>
                        </Col>
                        <Col xs="2" md="2" xl="2">
                            <div className="callout callout-info">
                                <small className="text-muted">Pipeline</small>
                                <br />
                                <strong>{this.props.annoTask.pipelineName}</strong>
                            </div>
                        </Col>
                        <Col xs="2" md="2" xl="2">
                            <div className="callout callout-warning">
                                <small className="text-muted">Annotations</small>
                                <br />
                                <strong className="h4">
                                    {this.props.annoTask.finished}/
                                    {this.props.annoTask.size}
                                </strong>
                            </div>
                        </Col>
                        <Col xs="2" md="2" xl="2">
                            <div className="callout callout-success">
                                <small className="text-muted">Seconds/Annotation</small>
                                <br />
                                <strong className="h4">
                                    &#8709; {this.props.annoTask.statistic.secondsPerAnno}
                                </strong>
                            </div>
                        </Col>
                        <Col xs="2" md="2" xl="2">
                            <Button
                                color="primary"
                                style={{ marginTop: '25px' }}
                                onClick={this.openModal}
                            >
                                <i className="fa fa-question-circle"></i> Show
                                Instructions
                            </Button>
                        </Col>
                    </Row>
                    <div className="clearfix">
                        <div className="float-left">
                            <strong>{progress}%</strong>
                        </div>
                        <div className="float-right">
                            <small className="text-muted">
                                Started at:{' '}
                                {new Date(this.props.annoTask.createdAt).toLocaleString()}
                            </small>
                        </div>
                    </div>
                    <Progress
                        className="progress-xs"
                        color={getColor(progress)}
                        value={progress}
                    />
                    <br />
                    <Modal
                        isOpen={this.state.modalIsOpen}
                        onAfterOpen={this.afterOpenModal}
                        onRequestClose={this.closeModal}
                        style={customStyles}
                        ariaHideApp={false}
                        contentLabel="Instructions"
                    >
                        <Card>
                            <CardHeader>
                                <i className="fa fa-question-circle"></i> Instructions
                            </CardHeader>
                            <CardBody>
                                <Alert color="info">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: this.props.annoTask.instructions,
                                        }}
                                    />
                                </Alert>
                                <Button color="success" onClick={this.closeModal}>
                                    <i className="fa fa-times"></i> Close
                                </Button>
                            </CardBody>
                        </Card>
                    </Modal>
                </div>
            )
        } else
            return (
                <React.Fragment>
                    <div>Loading...</div>
                </React.Fragment>
            )
    }
}

export default WorkingOnMIA
