import { CCol, CRow, CButton, CSpinner, CBadge } from '@coreui/react';
import HelpButton from '../../../../../../components/HelpButton';
import { showSuccess, showError } from '../../../../../../components/Notification';
import { useGetInstructions } from '../../../../../../containers/Instruction/instruction_api';
import { useUpdateInstruction, useGetCurrentInstruction } from '../../../../../../actions/annoTask/anno_task_api';
import Select from 'react-select';
import { useEffect, useState } from 'react';
import IconButton from '../../../../../../components/IconButton';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import ViewInstruction from '../../../../../../containers/Instruction/ViewInstruction';

const TabInstructions = ({ annotask, updateAnnotask }) => {
    const { instructionId } = annotask;

    const { data: instructions, isLoading, error, refetch: refetchInstructions } = useGetInstructions('all');
    const { data: currentInstruction } = useGetCurrentInstruction(annotask.id);
    const { mutate: updateInstruction, isLoading: isSaving } = useUpdateInstruction();

    const [viewingInstruction, setViewingInstruction] = useState(null);
    const [isSelectLoading, setSelectLoading] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    useEffect(() => {
        const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true' ;
        const currentStep = parseInt(localStorage.getItem('currentStep') || '0');
        if (joyrideRunning && (currentStep === 45 || currentStep === 16)) {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('joyride-next-step', { detail: { step: 'after-instruction-select' } }));
            }, 1000);
        }
    });

    const handleInstructionChange = async (selectedOption) => {
        const selectedValue = selectedOption?.value ?? null;
        const isNoOption = selectedValue === '-1' || selectedValue === null;
        const isSameInstruction = selectedValue === currentInstruction?.instruction_id;

        setSelectLoading(true);
        await refetchInstructions();

        if (isSameInstruction) {
            updateAnnotask({ instructionId: selectedValue });
            setUnsavedChanges(false);
        } else if (isNoOption) {
            updateAnnotask({ instructionId: null });
            setUnsavedChanges(currentInstruction?.instruction_id !== null);
        } else {
            updateAnnotask({ instructionId: selectedValue });
            setUnsavedChanges(true);
        }

        setSelectLoading(false);
    };

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
        const currentViewedId = viewingInstruction?.id;
        if (currentViewedId === instructionId) {
            // If already viewing current instruction, toggle it off
            setViewingInstruction(null);
        } else {
            const instruction = instructions.find((inst) => inst.id === instructionId);
            if (instruction) {
                setViewingInstruction(instruction);
            } else {
                alert('No instruction selected');
            }
        }
    };

    const instructionOptions = [
        { value: '-1', label: 'No Option' },
        ...(instructions
            ? instructions.map((instruction) => ({
                  value: instruction.id,
                  label: instruction.option,
                  group_id: instruction.group_id,
              }))
            : []),
    ];

    const getOptionLabel = (option) => {
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
    };

    return (
        <CRow className="justify-content-center">
            <CCol sm="6" style={{ position: 'relative' }}>
                <span className="py-1 fs-6 text-muted fw-bold">
                            Instructions
                            &nbsp;
                </span>
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
                        value={
                            instructionId == null || instructionId === '-1'
                                ? instructionOptions[0]
                                : instructionOptions.find((option) => option.value === instructionId)
                        }
                        getOptionLabel={getOptionLabel}
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
                        text={viewingInstruction?.id === instructionId ? 'Close Instruction' : 'View Instruction'}
                        style={{ flex: 1 }}
                        size="sm"
                        disabled={instructionId == null || isSelectLoading}
                    />
                </div>

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
                    onEdit={undefined}
                />
            )}
        </CRow>
    );
};

export default TabInstructions;