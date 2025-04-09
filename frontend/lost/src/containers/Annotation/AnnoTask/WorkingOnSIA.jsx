import { useCallback, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import {
    Button,
    Col,
    Progress,
    Row,
} from 'reactstrap'
import actions from '../../../actions'
import { getColor } from './utils'
import { useGetInstructions } from '../../../containers/Instruction/instruction_api' // Import API hook
import ViewInstruction from '../../../containers/Instruction/ViewInstruction' // Import ViewInstruction component
import { showDecision } from '../../../components/Notification' // Import showDecision function
import { useGetCurrentInstruction } from '../../../actions/annoTask/anno_task_api'

const { siaLayoutUpdate } = actions

const WorkingOnSIA = ({ annoTask, siaLayoutUpdate }) => {
    const [height, setHeight] = useState(undefined)
    const myRef = useRef(null)

    const [viewingInstruction, setViewingInstruction] = useState(null) // State to hold the current instruction data
    const { data: instructions, isLoading, error, refetch: refetchInstructions } = useGetInstructions() // API hook to fetch instructions
    const { data: currentInstruction } = useGetCurrentInstruction(annoTask?.id) // Fetch current instruction based on annoTask.id

    useEffect(() => {
        if (myRef.current) {
            const checkHeight = myRef.current.getBoundingClientRect().height
            if (checkHeight !== height) {
                siaLayoutUpdate()
                setHeight(checkHeight)
            }
        }
    }, [height, siaLayoutUpdate])

    useEffect(() => {
        if (currentInstruction?.instruction_id) {
            const instruction = instructions?.find(
                (inst) => inst.id === currentInstruction.instruction_id
            )
            setViewingInstruction(instruction || null)
        }
    }, [currentInstruction?.instruction_id, instructions])

    if (!annoTask) {
        return <div>Loading...</div> 
    }

    const progress = Math.floor((annoTask.finished / annoTask.size) * 100)

    const handleViewInstruction = () => {
        if (currentInstruction?.instruction_id) {
            const instruction = instructions?.find(
                (inst) => inst.id === currentInstruction.instruction_id
            )
            setViewingInstruction(instruction || null)
        } else {
            setViewingInstruction(null)

            showDecision({
                title: 'No Instructions Found',
                icon: 'info',
                html: 'There are no instructions available for this task.',
                option1: {
                    text: 'OK',
                    callback: () => {
                        console.log('User acknowledged the absence of instructions.')
                    },
                },
                option2: {
                    text: 'Dismiss',
                    callback: () => {
                        console.log('User dismissed the notification.')
                    },
                },
            })
        }
    }

    return (
        <div ref={myRef} style={{ position: 'relative' }}>
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
                        onClick={handleViewInstruction}
                    >
                        <i className="fa fa-eye"></i> Show Instructions
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
            {viewingInstruction && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 999,
                    }}
                />
            )}
            {viewingInstruction && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        width: '600px', 
                        height: '500px', 
                        overflow: 'auto', 
                       }}
                >
                    <ViewInstruction
                        instructionData={viewingInstruction}
                        onClose={() => setViewingInstruction(null)}
                        onEdit={(instruction) => alert('Edit functionality is not implemented yet')}
                    />
                </div>
            )}
        </div>
    )
}

export default connect(null, { siaLayoutUpdate })(WorkingOnSIA)
