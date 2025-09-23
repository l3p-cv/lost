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
            if (instruction) setViewingInstruction(instruction)
        } else {
            const defaultInstruction = instructions?.find(
                (inst) => inst.option === 'Bounding Box',
            )
            if (defaultInstruction) setViewingInstruction(defaultInstruction)
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
            const defaultInstruction = instructions?.find(
                (inst) => inst.option === 'Bounding Box',
            )
            if (defaultInstruction) {
                setViewingInstruction(defaultInstruction)
            } else {
                setViewingInstruction({
                    id: 'default',
                    option: 'Bounding Box',
                    description: 'Default task instruction',
                    instruction: `

        Please draw bounding boxes for all objects in the image.`,
                })
            }
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
                        title="Seconds/Annotation"
                        value={annoTask.statistic.seconds_per_anno}
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
                <div>
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
