import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import actions from '../../../actions'
import { getColor } from './utils'
import { useGetInstructions } from '../../../containers/Instruction/instruction_api' // Import API hook
import ViewInstruction from '../../../containers/Instruction/ViewInstruction' // Import ViewInstruction component
import { showDecision } from '../../../components/Notification' // Import showDecision function
import { useGetCurrentInstruction } from '../../../actions/annoTask/anno_task_api'
import { CRow, CCol, CWidgetStatsF, CWidgetStatsB } from '@coreui/react'
import CoreIconButton from '../../../components/CoreIconButton'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { FaBriefcase, FaClock, FaPen, FaTasks } from 'react-icons/fa'

const { siaLayoutUpdate } = actions

const WorkingOnSIA = ({ annoTask, siaLayoutUpdate }) => {
    const [height, setHeight] = useState(undefined)
    const myRef = useRef(null)

    const [viewingInstruction, setViewingInstruction] = useState(null) // State to hold the current instruction data
    const { data: instructions } = useGetInstructions('all') // API hook to fetch instructions
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
                (inst) => inst.id === currentInstruction.instruction_id,
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
                (inst) => inst.id === currentInstruction.instruction_id,
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
        <div ref={myRef} style={{ position: 'relative', marginTop: 10 }}>
            <CRow>
                <CCol xs="3" md="3" xl="3">
                    <CWidgetStatsF
                        color="primary"
                        icon={<FaBriefcase />}
                        value={annoTask.name}
                        title="Working on"
                        style={{ height: '100%' }}
                    />
                </CCol>

                <CCol xs="3" md="3" xl="3">
                    <CWidgetStatsF
                        color="primary"
                        icon={<FaTasks />}
                        title="Pipeline"
                        value={annoTask.pipeline_name}
                        style={{ height: '100%' }}
                    />
                </CCol>

                <CCol xs="3" md="3" xl="3">
                    <CWidgetStatsF
                        color="primary"
                        icon={<FaPen />}
                        title="Annotations"
                        value={`${annoTask.finished}/${annoTask.size}`}
                        style={{ height: '100%' }}
                    />
                </CCol>
                <CCol xs="3" md="3" xl="3">
                    <CWidgetStatsF
                        color="primary"
                        icon={<FaClock />}
                        title={annoTask.statistic.seconds_per_anno}
                        value="Seconds/Annotation"
                        style={{ height: '100%' }}
                    />
                </CCol>
            </CRow>

            <CRow style={{ marginTop: 10 }}>
                <CCol xs="10">
                    <CWidgetStatsB
                        progress={{ color: getColor(progress), value: progress }}
                        title={`Started at: ${new Date(annoTask.createdAt).toLocaleString()}`}
                        value={`${progress}%`}
                    />
                </CCol>
                <CCol xs="2" md="2" xl="2">
                    <CoreIconButton
                        color="primary"
                        // style={{ marginTop: '25px' }}
                        onClick={handleViewInstruction}
                        text={'Show Instructions'}
                        icon={faEye}
                    />
                </CCol>
            </CRow>

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
                        onEdit={(instruction) =>
                            alert('Edit functionality is not implemented yet')
                        }
                    />
                </div>
            )}
        </div>
    )
}

export default connect(null, { siaLayoutUpdate })(WorkingOnSIA)
