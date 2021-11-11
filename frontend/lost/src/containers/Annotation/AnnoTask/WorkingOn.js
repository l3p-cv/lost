import React, { Component } from 'react'
import { Progress } from 'reactstrap'
import { getColor } from './utils'
import { Button, Col, Row } from 'reactstrap'
import IconButton from '../../../components/IconButton'

import { createHashHistory } from 'history'
import { faFastForward } from '@fortawesome/free-solid-svg-icons'
const history = createHashHistory()

class WorkingOn extends Component {
    handleContinue(type) {
        history.push(`/${type.toLowerCase()}`)
    }
    render() {
        let progress = Math.floor(
            (this.props.annoTask.finished / this.props.annoTask.size) * 100,
        )
        return (
            <div>
                <Row>
                    <Col xs="3" md="3" xl="3">
                        <div className="callout callout-danger">
                            <small className="text-muted">Working on</small>
                            <br />
                            <strong>{this.props.annoTask.name}</strong>
                        </div>
                    </Col>
                    <Col xs="3" md="3" xl="3">
                        <div className="callout callout-info">
                            <small className="text-muted">Pipeline</small>
                            <br />
                            <strong>{this.props.annoTask.pipelineName}</strong>
                        </div>
                    </Col>
                    <Col xs="3" md="3" xl="3">
                        <div className="callout callout-warning">
                            <small className="text-muted">Annotations</small>
                            <br />
                            <strong className="h4">
                                {this.props.annoTask.finished}/{this.props.annoTask.size}
                            </strong>
                        </div>
                    </Col>
                    <Col xs="3" md="3" xl="3">
                        <div className="callout callout-success">
                            <small className="text-muted">Seconds/Annotation</small>
                            <br />
                            <strong className="h4">
                                &#8709; {this.props.annoTask.statistic.secondsPerAnno}
                            </strong>
                        </div>
                    </Col>
                </Row>
                <div className="clearfix">
                    <div className="float-left">
                        <strong>{progress}%</strong>
                    </div>
                    <div className="float-right">
                        <small className="text-muted">
                            Started at: {this.props.annoTask.createdAt}
                        </small>
                    </div>
                </div>
                <Progress
                    className="progress-xs"
                    color={getColor(progress)}
                    value={progress}
                />
                <br />
                <br />
                <IconButton
                    onClick={() => this.handleContinue(this.props.annoTask.type)}
                    color="primary"
                    isOutline={false}
                    icon={faFastForward}
                    text="Continue"
                />
            </div>
        )
    }
}

export default WorkingOn
