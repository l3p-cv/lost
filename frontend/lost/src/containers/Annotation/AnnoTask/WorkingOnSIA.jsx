import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Modal,
    Progress,
    Row,
} from 'reactstrap'
import actions from '../../../actions'
import IconButton from '../../../components/IconButton'
import { getColor } from './utils'

const { siaLayoutUpdate } = actions

const WorkingOnSIA = ({ annoTask, siaLayoutUpdate }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false) // do not show instructions by default to fix scrolling issue
    const [height, setHeight] = useState(undefined)
    const myRef = useRef(null)

    const openModal = useCallback(() => {
        setModalIsOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setModalIsOpen(false)
    }, [])

    useEffect(() => {
        if (myRef.current) {
            const checkHeight = myRef.current.getBoundingClientRect().height
            if (checkHeight !== height) {
                siaLayoutUpdate()
                setHeight(checkHeight)
            }
        }
    }, [height, siaLayoutUpdate])

    if (!annoTask) {
        return <div>Loading...</div>
    }

    const progress = Math.floor((annoTask.finished / annoTask.size) * 100)

    return (
        <div ref={myRef}>
            <Row>
                <Col xs="2" md="2" xl="2">
                    <div className="callout callout-danger">
                        <small className="text-muted">Working on</small>
                        <br />
                        <strong>{annoTask.name}</strong>
                    </div>
                </Col>
                <Col xs="2" md="2" xl="2">
                    <div className="callout callout-info">
                        <small className="text-muted">Pipeline</small>
                        <br />
                        <strong>{annoTask.pipelineName}</strong>
                    </div>
                </Col>
                <Col xs="2" md="2" xl="2">
                    <div className="callout callout-warning">
                        <small className="text-muted">Annotations</small>
                        <br />
                        <strong className="h4">
                            {annoTask.finished}/{annoTask.size}
                        </strong>
                    </div>
                </Col>
                <Col xs="2" md="2" xl="2">
                    <div className="callout callout-success">
                        <small className="text-muted">Seconds/Annotation</small>
                        <br />
                        <strong className="h4">
                            &#8709; {annoTask.statistic.secondsPerAnno}
                        </strong>
                    </div>
                </Col>
                <Col xs="2" md="2" xl="2">
                    <Button
                        color="primary"
                        style={{ marginTop: '25px' }}
                        onClick={openModal}
                    >
                        <i className="fa fa-question-circle"></i> Show Instructions
                    </Button>
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
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={() => {}}
                onRequestClose={closeModal}
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
                                    __html: annoTask.instructions,
                                }}
                            />
                        </Alert>
                        <IconButton
                            isOutline={false}
                            color="secondary"
                            icon={faTimes}
                            text="Close"
                            onClick={closeModal}
                        ></IconButton>
                    </CardBody>
                </Card>
            </Modal>
        </div>
    )
}

export default connect(null, { siaLayoutUpdate })(WorkingOnSIA)
