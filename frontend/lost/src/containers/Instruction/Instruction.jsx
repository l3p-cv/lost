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

import { faUserPlus, faPen, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

const canEdit = (visLevel, instruction) => {
  if (visLevel === 'global') return true; // Admins can edit all
  return visLevel === 'all' && instruction.group_id; // Users can edit their own
};

const canView = (visLevel, instruction) => {
  return visLevel === 'all' && !instruction.group_id; // Users can view global
};

const canDelete = (visLevel, instruction) => {
  return !(visLevel === 'all' && !instruction.group_id); // Users can't delete global
};

const Instruction = ({ visLevel }) => {
  const [editingInstruction, setEditingInstruction] = useState(null);
  const [viewingInstruction, setViewingInstruction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: instructions, isLoading, error } = useGetInstructions(visLevel);
  const deleteInstructionMutation = useDeleteInstruction();
  const addInstructionMutation = useAddInstruction();
  const editInstructionMutation = useEditInstruction();

  const handleDelete = (id) => {
    deleteInstructionMutation.mutate(id, {
      onSuccess: () => Notification.showSuccess('Instruction deleted successfully'),
      onError: (error) => {
        console.error('Delete Error:', error);
        Notification.showError('Failed to delete instruction');
      },
    });
  };

  const handleAddInstruction = () => {
    setEditingInstruction({ id: null, option: '', description: '', instruction: '' });
    setViewingInstruction(null);
    setModalOpen(true);
  };

  const handleEditClick = (instruction) => {
    setEditingInstruction(instruction);
    setViewingInstruction(null);
    setModalOpen(true);
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
        const message = updatedInstruction.id
          ? 'Instruction updated successfully'
          : 'Instruction added successfully';
        Notification.showSuccess(message);
        setModalOpen(false);
      },
      onError: (error) => {
        console.error('Save Error:', error);
        Notification.showError('Failed to save instruction');
      },
    });
  };

  const filteredInstructions = instructions
    ? visLevel === 'global'
      ? instructions.filter((i) => !i.group_id)
      : instructions
    : [];

  const columns = [
    { Header: 'Annotation Option', accessor: 'option' },
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
            <IconButton
              icon={faPen}
              color="warning"
              text="Edit"
              onClick={() => handleEditClick(original)}
            />
          );
        }

        if (canView(visLevel, original)) {
          return (
            <IconButton
              icon={faEye}
              color="primary"
              text="Show"
              onClick={() => handleViewClick(original)}
            />
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
              <CTooltip content="Deletion is restricted to admins only." placement="top">
                <span>
                  <IconButton icon={faTrash} color="secondary" disabled />
                </span>
              </CTooltip>
            ) : (
              <IconButton
                icon={faTrash}
                color="danger"
                onClick={() => handleDelete(original.id)}
              />
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
            {/* Empty state handling */}
            {filteredInstructions.length === 0 && !isLoading && (
              <CRow>
                <CCol>
                  <p>No instructions available.</p>
                </CCol>
              </CRow>
            )}
            <Datatable
              key="instructionsTable"
              data={filteredInstructions}
              columns={columns}
              pageSize={10}
              isLoading={isLoading}
            />
          </BaseContainer>
        </CCol>
      </CRow>

      <BaseModal
        isOpen={modalOpen}
        title={
          viewingInstruction
            ? 'View Instruction'
            : editingInstruction
            ? 'Edit Instruction'
            : 'Add Instruction'
        }
        toggle={() => setModalOpen(false)}
        footer={null}
      >
        {viewingInstruction ? (
          <ViewInstruction
            instructionData={viewingInstruction}
            onClose={() => setModalOpen(false)}
            onEdit={handleEditClick}
          />
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
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1050,
          }}
        >
          <CSpinner color="primary" size="lg" />
        </div>
      )}
    </CContainer>
  );
};

export default Instruction;