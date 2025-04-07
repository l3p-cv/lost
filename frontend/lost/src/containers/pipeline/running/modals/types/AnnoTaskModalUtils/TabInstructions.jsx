import { CCol, CRow, CButton } from '@coreui/react';
import { Label } from 'reactstrap';
import Select from 'react-select';
import HelpButton from '../../../../../../components/HelpButton';
import { showSuccess, showError } from '../../../../../../components/Notification';
import { useGetInstructions } from '../../../../../../containers/Instruction/instruction_api';
import { useUpdateInstruction } from '../../../../../../actions/annoTask/anno_task_api';
import IconButton from '../../../../../../components/IconButton'; 
import { faEye } from '@fortawesome/free-solid-svg-icons';
import ViewInstruction from '../../../../../../containers/Instruction/ViewInstruction';
import { useState } from 'react';

const TabInstructions = ({ annotask, updateAnnotask: updateAnnoTask }) => {
    const { instructionId } = annotask;
    const { data: instructions, isLoading, error } = useGetInstructions();
    
    const { mutate: updateInstruction, isLoading: isSaving } = useUpdateInstruction();
    const [viewingInstruction, setViewingInstruction] = useState(null);

    const handleInstructionChange = (selectedOption) => {
        if (!selectedOption || selectedOption.value === '-1') {
            updateAnnoTask({ instructionId: null });
        } else {
            updateAnnoTask({ instructionId: selectedOption.value });
        }
    };

    const instructionOptions = [
        { value: '-1', label: 'No Option' },
        ...(instructions
            ? instructions.map((instruction) => ({
                  value: instruction.id,
                  label: instruction.option,
              }))
            : []),
    ];

    const handleSave = async () => {
        try {
            await updateInstruction({
                annotaskId: annotask.id,
                instructionId: annotask.instructionId,
            });
            showSuccess('Instruction saved successfully');
        } catch (error) {
            console.error('Error while saving instruction:', error);
            showError('Error saving instruction');
        }
    };

    const handleViewInstruction = () => {
        if (viewingInstruction) {
            setViewingInstruction(null);
        } else {
            const instruction = instructions.find(
                (inst) => inst.id === annotask.instructionId
            );
            if (instruction) {
                setViewingInstruction(instruction);
            } else {
                alert('No instruction selected');
            }
        }
    };

    return (
        <CRow className="justify-content-center">
            <CCol sm="6">
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
                    <div className="text-danger">Error loading instructions. Please try again later.</div>
                ) : (
                    <Select
                        options={instructionOptions}
                        onChange={handleInstructionChange}
                        placeholder="Select an instruction..."
                        id="instruction"
                        value={
                            instructionId == null
                                ? instructionOptions[0]
                                : instructionOptions.find(
                                      (option) => option.value === instructionId
                                  )
                        }
                    />
                )}

                <br />
                <CButton color="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Instruction'}
                </CButton>

                <IconButton
                    icon={faEye}
                    color="info"
                    onClick={handleViewInstruction}
                    text={viewingInstruction ? 'View Instruction' : 'View Instruction'}
                    style={{ marginLeft: '10px' }}
                    disabled={instructionId == null}
                />
            </CCol>

            {/* Conditionally render the ViewInstruction modal */}
            {viewingInstruction && (
                <ViewInstruction
                    instructionData={viewingInstruction}
                    onClose={() => setViewingInstruction(null)}
                    onEdit={(instruction) => alert('Edit functionality is not implemented yet')} 
                />
            )}
        </CRow>
    );
};

export default TabInstructions;
