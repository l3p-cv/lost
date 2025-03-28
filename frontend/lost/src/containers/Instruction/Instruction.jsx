import React, { useState } from 'react';
import { useGetInstructions, useDeleteInstruction, useAddInstruction, useEditInstruction } from './instruction_api';
import { CContainer, CRow, CCol, CSpinner } from '@coreui/react';
import Datatable from '../../components/Datatable';
import BaseModal from '../../components/BaseModal';
import IconButton from '../../components/IconButton';
import EditInstruction from './EditInstruction';
import ViewInstruction from './ViewInstruction';
import BaseContainer from '../../components/BaseContainer';
import * as Notification from '../../components/Notification';
import { faUserPlus, faPen, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

const Instruction = () => {
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
    if (updatedInstruction.id) {
      editInstructionMutation.mutate(updatedInstruction);
    } else {
      addInstructionMutation.mutate(updatedInstruction);
    }
    setModalOpen(false);
  };

  const columns = [
    { Header: 'Annotation Option', accessor: 'option' },
    { Header: 'Description', accessor: 'description' },
    {
      Header: 'View',
      Cell: ({ original }) => (
        <IconButton icon={faEye} color="primary" onClick={() => handleViewClick(original)} />
      ),
    },
    {
      Header: 'Edit',
      Cell: ({ original }) => (
        <IconButton icon={faPen} color="warning" onClick={() => handleEditClick(original)} />
      ),
    },
    {
      Header: 'Delete',
      Cell: ({ original }) => (
        <IconButton icon={faTrash} color="danger" onClick={() => handleDelete(original.id)} />
      ),
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
            <Datatable
              key="instructionsTable"
              data={instructions}
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