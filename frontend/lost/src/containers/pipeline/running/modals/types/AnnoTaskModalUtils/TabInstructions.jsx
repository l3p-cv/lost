import { CCol, CRow, CButton, CSpinner } from '@coreui/react';
import { Label } from 'reactstrap';
import Select from 'react-select';
import HelpButton from '../../../../../../components/HelpButton';
import { showSuccess, showError } from '../../../../../../components/Notification';
import { useGetInstructions } from '../../../../../../containers/Instruction/instruction_api';
import { useUpdateInstruction, useGetCurrentInstruction } from '../../../../../../actions/annoTask/anno_task_api';
import IconButton from '../../../../../../components/IconButton';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import ViewInstruction from '../../../../../../containers/Instruction/ViewInstruction';
import { useState } from 'react';

const TabInstructions = ({ annotask, updateAnnotask: updateAnnoTask }) => {
    const { instructionId } = annotask;
    const { data: instructions, isLoading, error, refetch: refetchInstructions } = useGetInstructions();
    const { mutate: updateInstruction, isLoading: isSaving } = useUpdateInstruction();
    const [viewingInstruction, setViewingInstruction] = useState(null);
    const [isSelectLoading, setSelectLoading] = useState(false); 
    const [unsavedChanges, setUnsavedChanges] = useState(false); 
    const { data: currentInstruction } = useGetCurrentInstruction(annotask.id);

    const handleInstructionChange = async (selectedOption) => {
        const isNoOption = !selectedOption || selectedOption.value === '-1' || selectedOption.value === null;
        const isSameInstruction = selectedOption && selectedOption.value === currentInstruction?.instruction_id;

        setSelectLoading(true);

        if (!isSameInstruction || isNoOption) {
            await refetchInstructions();
        }else{
            await refetchInstructions();
        }

        if (isSameInstruction) {
            updateAnnoTask({ instructionId: selectedOption.value });
            setUnsavedChanges(false);
            const instruction = instructions.find((inst) => inst.id === selectedOption.value);
            setViewingInstruction(instruction || null);
            setSelectLoading(false);
        } else if (isNoOption) {
            const isCurrentInstructionNull = currentInstruction.instruction_id === null;
            updateAnnoTask({ instructionId: null });
            setUnsavedChanges(!isCurrentInstructionNull);
            setViewingInstruction(null);
            setSelectLoading(false);
        } else {
            updateAnnoTask({ instructionId: selectedOption.value });
            setUnsavedChanges(true);
            const instruction = instructions.find((inst) => inst.id === selectedOption.value);
            setViewingInstruction(instruction || null);
            setSelectLoading(false);
        }
    };

    const instructionOptions = [
        { value: null, label: 'No Option' },
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
            setUnsavedChanges(false);
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
            <CCol sm="6" style={{ position: 'relative' }}>
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

                {isSelectLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1050,
                        }}
                    >
                        <CSpinner color="primary" size="sm" />
                    </div>
                )}

                <br />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <CButton 
                        color="primary" 
                        onClick={handleSave} 
                        disabled={isSaving || isSelectLoading} 
                        size="sm" 
                        style={{ flex: 1 }}
                    >
                        {isSaving ? 'Saving...' : 'Save Instruction'}
                    </CButton>

                    <IconButton
                        icon={faEye}
                        color="info"
                        onClick={handleViewInstruction}
                        text={viewingInstruction ? 'View Instruction' : 'View Instruction'}
                        style={{ flex: 1 }} 
                        size="sm" 
                        disabled={instructionId == null || isSelectLoading} 
                    />
                </div>
                <div style={{ marginTop: '20px' }}></div> 

                {unsavedChanges && !isSelectLoading && (
                    <div
                        style={{
                            marginTop: '10px',
                            color: '#FF5733', 
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            backgroundColor: '#FFF3E3', 
                            padding: '5px 10px',
                            borderRadius: '5px',
                            border: '1px solid #FF5733', 
                        }}
                    >
                        <small>Unsaved changes. Please save to confirm.</small>
                    </div>
                )}
                <div style={{ marginTop: '10px' }}></div>
            </CCol>

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