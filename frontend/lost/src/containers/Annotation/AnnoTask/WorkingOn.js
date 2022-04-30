import React, { Component, useEffect } from 'react'
import { Progress } from 'reactstrap'
import { getColor } from './utils'
import { Col, Row } from 'reactstrap'
import IconButton from '../../../components/IconButton'

import { useHistory } from 'react-router-dom'
import { faFastForward } from '@fortawesome/free-solid-svg-icons'

// class WorkingOn extends Component {
const WorkingOn = ({ annoTask }) => {
    const history = useHistory()

    const handleContinue = (type) => {
        history.push(`/${type.toLowerCase()}`)
        // history.push('')
    }

    const progress = Math.floor((annoTask.finished / annoTask.size) * 100)

    return (
        <div>
            <Row>
                <Col xs="3" md="3" xl="3">
                    <div className="callout callout-danger">
                        <small className="text-muted">Working on</small>
                        <br />
                        <strong>{annoTask.name}</strong>
                    </div>
                </Col>
                <Col xs="3" md="3" xl="3">
                    <div className="callout callout-info">
                        <small className="text-muted">Pipeline</small>
                        <br />
                        <strong>{annoTask.pipelineName}</strong>
                    </div>
                </Col>
                <Col xs="3" md="3" xl="3">
                    <div className="callout callout-warning">
                        <small className="text-muted">Annotations</small>
                        <br />
                        <strong className="h4">
                            {annoTask.finished}/{annoTask.size}
                        </strong>
                    </div>
                </Col>
                <Col xs="3" md="3" xl="3">
                    <div className="callout callout-success">
                        <small className="text-muted">Seconds/Annotation</small>
                        <br />
                        <strong className="h4">
                            &#8709; {annoTask.statistic.secondsPerAnno}
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
                        Started at: {new Date(annoTask.createdAt).toLocaleString()}
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
                onClick={() => handleContinue(annoTask.type)}
                color="primary"
                isOutline={false}
                icon={faFastForward}
                text="Continue"
            />
        </div>
    )
}

export default WorkingOn
