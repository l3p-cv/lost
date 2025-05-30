import { CCol, CRow, CBadge } from '@coreui/react';
import { useNodesData, useReactFlow } from '@xyflow/react';
import { Input, Label } from 'reactstrap';
import HelpButton from '../../../../../../components/HelpButton';
import { AnnoTaskNodeData } from '../../../nodes';
import Select from 'react-select';
import { useGetInstructions } from '../../../../../../containers/Instruction/instruction_api';

interface UserInfoProps {
    nodeId: string;
}

export const AnnoTaskInfo = ({ nodeId }: UserInfoProps) => {
    const nodeData = useNodesData(nodeId);
    const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData;

    const { updateNodeData } = useReactFlow();

    const { data: instructions, isLoading, error } = useGetInstructions('all'); 

    const handleInstructionChange = (selectedOption: any) => {
        if (!selectedOption || selectedOption.value === '-1') {
            updateNodeData(nodeId, { instructionId: null });
            return;
        }

        updateNodeData(nodeId, { instructionId: selectedOption.value });

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
                    <Label for="name" className="text-start">
                        Name
                    </Label>
                    <HelpButton
                        id="anno-start-name"
                        text="Give your AnnotationTask a name. The name can also be seen by your annotators."
                    />
                    <Input
                        defaultValue={annoTaskNodeData.name}
                        onChange={(e) => updateNodeData(nodeId, { name: e.target.value })}
                        type="text"
                        name="name"
                        id="name"
                    />
                    <br />
                    <Label for="instruction" className="text-start">
                        Instructions
                    </Label>
                    <HelpButton
                        id="anno-start-desc"
                        text="Give instructions / hints to your annotators so they know what to do."
                    />
                    {isLoading ? (
                        <div>Loading instructions...</div>
                    ) : error ? (
                        <div>Error loading instructions</div>
                    ) : (
                        <Select
                            options={instructionOptions}
                            onChange={handleInstructionChange}
                            placeholder="Select an instruction..."
                            id="instruction"
                            defaultValue={
                                annoTaskNodeData.instructionId == null
                                    ? instructionOptions[0]
                                    : instructionOptions.find(
                                          (option) => option.value === annoTaskNodeData.instructionId
                                      )
                            }
                            formatOptionLabel={(option) => {
                                if (option.value === '-1') return option.label;

                                const group = option.group_id === null ? 'Global' : 'User';

                                return (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{option.label}</span>
                                        <CBadge color={group === 'Global' ? 'success' : 'primary'}>
                                            {group}
                                        </CBadge>
                                    </div>
                                );
                            }}
                        />
                    )}
                </CCol>
            </CRow>
        </div>
    );
};