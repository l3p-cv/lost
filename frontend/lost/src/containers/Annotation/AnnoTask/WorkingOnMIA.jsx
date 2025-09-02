import React, { useState, useEffect } from 'react';
import { getColor } from './utils';
import { showDecision } from '../../../components/Notification'; // Import showDecision function
import { useGetInstructions } from '../../../containers/Instruction/instruction_api'; // API hook for instructions
import { useGetCurrentInstruction } from '../../../actions/annoTask/anno_task_api'; // Fetch current instruction
import ViewInstruction from '../../../containers/Instruction/ViewInstruction'; // Import ViewInstruction component
import CoreIconButton from '../../../components/CoreIconButton';
import { CCol, CProgress, CRow } from '@coreui/react';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const WorkingOnMIA = ({ annoTask }) => {
    const [viewingInstruction, setViewingInstruction] = useState(null); // State to hold the current instruction data
    const { data: instructions, isLoading, error } = useGetInstructions('all'); // API hook to fetch instructions
    const { data: currentInstruction } = useGetCurrentInstruction(annoTask?.id); // Fetch current instruction based on annoTask.id

    useEffect(() => {
        if (currentInstruction?.instruction_id) {
            const instruction = instructions?.find(
                (inst) => inst.id === currentInstruction.instruction_id
            );
            setViewingInstruction(instruction || null);
        }
    }, [currentInstruction?.instruction_id, instructions]);

    const handleViewInstruction = () => {
        if (currentInstruction?.instruction_id) {
            const instruction = instructions?.find(
                (inst) => inst.id === currentInstruction.instruction_id
            );
            setViewingInstruction(instruction || null);
        } else {
            const defaultInstruction = instructions?.[0];
            if (defaultInstruction) {
                setViewingInstruction(defaultInstruction);
            } else {
                setViewingInstruction({
                    id: 'default',
                    option: 'Bounding Box',
                    description: 'Default task instruction',
                    instruction: `

        Please draw bounding boxes for all objects in the image.`,
                });
            }
        }
    };

    if (!annoTask) {
        return <div>Loading...</div>;
    }

    const progress = Math.floor((annoTask.finished / annoTask.size) * 100);

    return (
        <div>
            <CRow>
                <CCol xs="2" md="2" xl="2">
                    <div className="callout callout-danger">
                        <small className="text-muted">Working on</small>
                        <br />
                        <strong>{annoTask.name}</strong>
                    </div>
                </CCol>
                <CCol xs="2" md="2" xl="2">
                    <div className="callout callout-info">
                        <small className="text-muted">Pipeline</small>
                        <br />
                        <strong>{annoTask.pipeline_name}</strong>
                    </div>
                </CCol>
                <CCol xs="2" md="2" xl="2">
                    <div className="callout callout-warning">
                        <small className="text-muted">Annotations</small>
                        <br />
                        <strong className="h4">
                            {annoTask.finished}/{annoTask.size}
                        </strong>
                    </div>
                </CCol>
                <CCol xs="2" md="2" xl="2">
                    <div className="callout callout-success">
                        <small className="text-muted">Seconds/Annotation</small>
                        <br />
                        <strong className="h4">
                            &#8709; {annoTask.statistic.seconds_per_anno}
                        </strong>
                    </div>
                </CCol>
                <CCol xs="2" md="2" xl="2">
                    <CoreIconButton
                        color="primary"
                        style={{ marginTop: '25px' }}
                        onClick={handleViewInstruction}
                        text={"Show Instructions"}
                        icon={faEye}
                    />
                </CCol>
            </CRow>
            <div className="clearfix">
                <div className="float-left">
                    <strong>{progress}%</strong>
                </div>
                <div className="float-right">
                    <small className="text-muted">
                        Started at: {' '}
                        {new Date(annoTask.createdAt).toLocaleString()}
                    </small>
                </div>
            </div>
            <CProgress
                className="progress-xs"
                color={getColor(progress)}
                value={progress}
            />
            <br />
            {viewingInstruction && (
                <div>
                    <ViewInstruction
                        instructionData={viewingInstruction}
                        onClose={() => setViewingInstruction(null)}
                        onEdit={(instruction) => alert('Edit functionality is not implemented yet')}
                    />
                </div>
            )}
        </div>
    );
};

export default WorkingOnMIA