import React, { useState } from 'react';
import { useGetInstructions, useDeleteInstruction, useAddInstruction, useEditInstruction } from './instruction_api';
import { CContainer, CRow, CCol, CSpinner, CBadge, CTooltip } from '@coreui/react';
import Datatable from '../../components/Datatable';
import BaseModal from '../../components/BaseModal';
import IconButton from '../../components/IconButton';
import EditInstruction from './EditInstruction';
import ViewInstruction from './ViewInstruction';
import BaseContainer from '../../components/BaseContainer';
import * as Notification from '../../components/Notification';
import { useOwnUser } from '../../actions/user/user_api';
import { faUserPlus, faPen, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

const canEdit = (visLevel, instruction) => visLevel === 'global' || (visLevel === 'all' && instruction.group_id);
const canView = (visLevel, instruction) => visLevel === 'all' && !instruction.group_id;
const canDelete = (visLevel, instruction) => !(visLevel === 'all' && !instruction.group_id);

const Instruction = ({ visLevel }) => {
  const [editingInstruction, setEditingInstruction] = useState(null);
  const [viewingInstruction, setViewingInstruction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: instructions, isLoading } = useGetInstructions(visLevel);
  const deleteInstructionMutation = useDeleteInstruction();
  const addInstructionMutation = useAddInstruction();
  const editInstructionMutation = useEditInstruction();
  const { data: ownUser } = useOwnUser();

  const handleDelete = (id) => {
    deleteInstructionMutation.mutate(id, {
      onSuccess: () => Notification.showSuccess('Instruction deleted successfully'),
      onError: () => Notification.showError('Failed to delete instruction'),
    });
  };

  const handleAddInstruction = () => {
    setEditingInstruction({ id: null, option: '', description: '', instruction: '', group_id: ownUser?.group_id });
    setViewingInstruction(null);
    setModalOpen(true);
  };

  const handleEditClick = (instruction) => {
    setEditingInstruction(instruction);
    setViewingInstruction(null);
    setModalOpen(true);
    if (instruction.isLastRow) {
      window.dispatchEvent(
        new CustomEvent('joyride-next-step', {
          detail: { step: 'edit-step' },
        })
      );
    }
  };

  const handleViewClick = (instruction) => {
    setViewingInstruction(instruction);
    setEditingInstruction(null);
    setModalOpen(true);
  };

  const handleSave = (updatedInstruction) => {
    const mutation = updatedInstruction.id ? editInstructionMutation : addInstructionMutation;
    const payload = {
      ...updatedInstruction,
      visibility: visLevel === 'global' ? 'global' : 'user',
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        Notification.showSuccess(updatedInstruction.id ? 'Instruction updated successfully' : 'Instruction added successfully');
        setModalOpen(false);
      },
      onError: () => Notification.showError('Failed to save instruction'),
    });
  };

  const filteredInstructions = instructions
    ? visLevel === 'global'
      ? instructions.filter((i) => !i.group_id)
      : instructions
    : [];

  const enhancedInstructions = filteredInstructions.map((item, idx) => ({
    ...item,
    isLastRow: idx === filteredInstructions.length - 1,
  }));

  const columns = [
    { Header: 'Annotation Option', accessor: 'option' }, // Simplified, no Cell renderer needed
    { Header: 'Description', accessor: 'description' },
    {
      Header: 'Global',
      id: 'group_id',
      Cell: ({ original }) => (
        <CBadge color={original.group_id ? 'primary' : 'success'}>
          {original.group_id ? 'User' : 'Global'}
        </CBadge>
      ),
    },
    {
      Header: 'Edit',
      Cell: ({ original }) => {
        if (canEdit(visLevel, original)) {
          return (
            <IconButton icon={faPen} color="warning" text="Edit"
              onClick={() => handleEditClick(original)}
              className={original.isLastRow ? 'edit-instruction-button' : ''}
            />
          );
        }
        if (canView(visLevel, original)) {
          return (
            <IconButton icon={faEye} color="primary" text="Show" onClick={() => handleViewClick(original)} />
          );
        }
        return null;
      },
    },
    {
      Header: 'Delete',
      Cell: ({ original }) => {
        const disabled = !canDelete(visLevel, original);
        return (
          <div>
            {disabled ? (
              <CTooltip content="Deletion is restricted to admins only.">
                <span>
                  <IconButton icon={faTrash} color="secondary" disabled />
                </span>
              </CTooltip>
            ) : (
              <IconButton icon={faTrash} color="danger" onClick={() => handleDelete(original.id)} />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <CContainer>
      <CRow>
        <CCol sm="auto">
          <IconButton
            className="add-instruction-button"
            icon={faUserPlus}
            color="primary"
            text="Add Instruction"
            onClick={handleAddInstruction}
            style={{ marginTop: '15px', marginBottom: '20px' }}
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol>
          <BaseContainer>
            {filteredInstructions.length === 0 && !isLoading && (
              <p>No instructions available.</p>
            )}
            <div className="instruction-list">
              <Datatable
                key="instructionsTable"
                data={enhancedInstructions}
                columns={columns}
                pageSize={10}
                isLoading={isLoading}
                getTrProps={(state, rowInfo) => {
                  if (rowInfo && rowInfo.original.isLastRow) {
                    return { className: 'last-row-highlight' };
                  }
                  return {};
                }}
              />
            </div>
          </BaseContainer>
        </CCol>
      </CRow>

      <BaseModal
        isOpen={modalOpen}
        title={viewingInstruction ? 'View Instruction' : editingInstruction ? 'Edit Instruction' : 'Add Instruction'}
        toggle={() => setModalOpen(false)}
        footer={null}
      >
        {viewingInstruction ? (
          <ViewInstruction instructionData={viewingInstruction} onClose={() => setModalOpen(false)} onEdit={handleEditClick} />
        ) : editingInstruction ? (
          <EditInstruction
            instructionData={editingInstruction}
            onSave={handleSave}
            visLevel={visLevel}
            onClose={() => setModalOpen(false)}
          />
        ) : null}
      </BaseModal>

      {isLoading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1050 }}>
          <CSpinner color="primary" size="lg" />
        </div>
      )}
    </CContainer>
  );
};

export default Instruction;