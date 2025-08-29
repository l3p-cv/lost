import { CCol, CRow, CFormSelect,
    CForm, CFormInput, CInputGroup, CFormLabel
 } from '@coreui/react'
import { useNodesData, useReactFlow } from '@xyflow/react';
import HelpButton from '../../../../../../components/HelpButton';
import { AnnoTaskNodeData } from '../../../nodes';
import { useGetInstructions } from '../../../../../../containers/Instruction/instruction_api';

interface UserInfoProps {
    nodeId: string;
}

export const AnnoTaskInfo = ({ nodeId }: UserInfoProps) => {
    const nodeData = useNodesData(nodeId);
    const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData;

    const { updateNodeData } = useReactFlow();

    const { data: instructions, isLoading, error } = useGetInstructions('all'); 

    const handleInstructionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '-1') {
            updateNodeData(nodeId, { instructionId: null });
            return;
        }

        updateNodeData(nodeId, { instructionId: value });

        const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true';
        if (joyrideRunning) {
            window.dispatchEvent(
                new CustomEvent('joyride-next-step', { detail: { step: 'anno-task-info-done' } })
            );
        }
    };

    const instructionOptions = [
        { value: '-1', label: 'No Option' }, // Default
        ...(instructions
            ? instructions.map((instruction) => ({
                  value: instruction.id,
                  label: instruction.option,
                  group_id: instruction.group_id,
              }))
            : []),
    ];

    if (annoTaskNodeData.instructionId === undefined) {
        updateNodeData(nodeId, { instructionId: null });
    }

    return (
        <div>
            <h4 className="mb-3 text-center">Task Information</h4>
            <CRow className="justify-content-center">
                <CCol sm="6">
                    <CForm
                        onSubmit={(e) => {
                            e.preventDefault()
                        }}
                    >
                        <div>
                            <CRow className="justify-content-center">
                                <CCol sm="10">
                                    <CFormLabel>
                                        Name
                                        &nbsp;
                                        <HelpButton
                                            id="anno-start-name"
                                            text="Give your AnnotationTask a name. The name can also be seen by your annotators."
                                        />
                                    </CFormLabel>
                                    <CInputGroup className="mb-3">
                                        <CFormInput
                                            required
                                            defaultValue={annoTaskNodeData.name}
                                            onChange={(e) => updateNodeData(nodeId, { name: e.target.value })}
                                            type="text"
                                            name="name"
                                            placeholder='Name your pipeline for identification'
                                            className='start-pipeline-modal'
                                            id="name"
                                        >
                                        </CFormInput>
                                    </CInputGroup>
                                    <CFormLabel>
                                        Description
                                        &nbsp;
                                        <HelpButton
                                            id="anno-start-desc"
                                            text="Give instructions / hints to your annotators so they know what to do."
                                        />
                                    </CFormLabel>
                                    {isLoading ? (
                                        <div>Loading instructions...</div>
                                    ) : error ? (
                                        <div>Error loading instructions</div>
                                    ) : (
                                    <CInputGroup className="mb-3">
                                        <CFormSelect
                                            required
                                            options={instructionOptions}
                                            onChange={handleInstructionChange}
                                            placeholder="Select an instruction..."
                                            id="instruction"
                                            defaultValue={annoTaskNodeData.instructionId ?? '-1'}
                                        />
                                    </CInputGroup>
                                    )}
                                </CCol>
                            </CRow>
                        </div>
                    </CForm>
                </CCol>
            </CRow>
        </div>
    );
};