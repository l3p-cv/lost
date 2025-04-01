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

const Instruction = ({ visLevel }) => {
  const [editingInstruction, setEditingInstruction] = useState(null);
  const [viewingInstruction, setViewingInstruction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: instructions, isLoading, error } = useGetInstructions();
  const deleteInstructionMutation = useDeleteInstruction();
  const addInstructionMutation = useAddInstruction();
  const editInstructionMutation = useEditInstruction();

  const handleDelete = (id) => {
    deleteInstructionMutation.mutate(id, {
      onSuccess: () => {
        Notification.showSuccess('Instruction deleted successfully');
      },
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
    const mutation = updatedInstruction.id
      ? editInstructionMutation
      : addInstructionMutation;

      if (visLevel === 'global' && !updatedInstruction.group_id) {
        updatedInstruction.group_id = 1;
      }
  
    mutation.mutate(updatedInstruction, {
      onSuccess: () => {
        const successMessage = updatedInstruction.id
          ? 'Instruction updated successfully'
          : 'Instruction added successfully';
        Notification.showSuccess(successMessage);
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
    ? instructions.filter(instruction => instruction.group_id === 1)
    : instructions
  : [];

  const columns = [
    { Header: 'Annotation Option', accessor: 'option' },
    { Header: 'Description', accessor: 'description' },
    {
      Header: 'Global',
      id: 'group_id',
      Cell: ({ original }) => (
        <CBadge color={original.group_id === 1 ? 'success' : 'primary'}>
          {original.group_id === 1 ? 'Global' : 'User'}
        </CBadge>
      ),
    },
    {
      Header: 'Edit',
      Cell: ({ original }) => {
        const { group_id } = original;
  
        if (
          (visLevel === 'global' && group_id === 1) || 
          (visLevel === 'all' && group_id !== 1)
        ) {
          return (
            <IconButton
              icon={faPen}
              color="warning"
              text="Edit"
              onClick={() => handleEditClick(original)}
            />
          );
        }
  
        if (visLevel === 'all' && group_id === 1) {
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
        const isDisabled = visLevel === 'all' && original.group_id === 1;
        return (
          <div>
            {isDisabled ? (
              <CTooltip content="Deletion is restricted to admins only." placement="top">
                <span>
                  <IconButton
                    icon={faTrash}
                    color="secondary"
                    disabled
                  />
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
        title={viewingInstruction ? 'View Instruction' : editingInstruction ? 'Edit Instruction' : 'Add Instruction'}
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