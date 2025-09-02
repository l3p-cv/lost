import React, { useEffect, useState } from 'react';
import { useGetInstructions, useDeleteInstruction, useAddInstruction, useEditInstruction } from './instruction_api';
import { CContainer, CRow, CCol, CSpinner, CBadge, CTooltip } from '@coreui/react';
// import Datatable from '../../components/Datatable';
import BaseModal from '../../components/BaseModal';
import IconButton from '../../components/IconButton';
import EditInstruction from './EditInstruction';
import ViewInstruction from './ViewInstruction';
import BaseContainer from '../../components/BaseContainer';
import * as Notification from '../../components/Notification';
import { useOwnUser } from '../../actions/user/user_api';
import { faUserPlus, faPen, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import CoreDataTable from '../../components/CoreDataTable';
import { createColumnHelper } from '@tanstack/react-table';
import CoreIconButton from '../../components/CoreIconButton';
import TableHeader from '../../components/TableHeader';
import ErrorBoundary from '../../components/ErrorBoundary';

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

  const deleteSelectedInstruction = (id) => {
    deleteInstructionMutation.mutate(id, {
      onSuccess: () => Notification.showSuccess('Instruction deleted successfully'),
      onError: () => Notification.showError('Failed to delete instruction'),
    });
  }

  const handleDelete = (id) => {
    Notification.showDecision({
                title: 'Do you really want to delete datasource?',
                option1: {
                    text: 'YES',
                    callback: () => {
                        deleteSelectedInstruction(id)
                    },
                },
                option2: {
                    text: 'NO!',
                    callback: () => { },
                },
            })
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

  const getRowClassName = (original) => {
    return original.isLastRow ? 'last-row-highlight' : '';
  };

  const defineColumns = () => {
    const columnHelper = createColumnHelper();
    
    return [
      columnHelper.display({
        id: "option",
        header: 'Annotation Option',
        // cell: ({ getValue }) => getValue(),
        cell: ({row}) => (
          <>
            <CTooltip
                content={row.original.description}
                placement="top"
            >
                <b style={{ textDecoration: 'grey dotted underline'}}>{row.original.option}</b>
            </CTooltip>
            <div className="small text-muted">
                {`ID: ${row.original.id}`}
            </div>
          </>
        ),
      }),
      // columnHelper.accessor('description', {
      //   header: 'Description',
      //   cell: ({ getValue }) => getValue(),
      // }),
      columnHelper.accessor('group_id', {
        header: 'Global',
        cell: ({ row }) => (
          <CBadge color={row.original.group_id ? 'primary' : 'success'}>
            {row.original.group_id ? 'User' : 'Global'}
          </CBadge>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const original = row.original;
          const disabled = !canDelete(visLevel, original);
          return (
            <>
              {(canEdit(visLevel, original)) && (
                <CoreIconButton 
                  icon={faPen} 
                  style={{"margin-right": 5}} 
                  color="warning" 
                  onClick={() => handleEditClick(original)}
                  className={original.isLastRow ? 'edit-instruction-button' : ''}
                  toolTip='Edit Instruction'
                />
              )}
              {(canView(visLevel, original) && !canEdit(visLevel, original)) && (
                <CoreIconButton
                  style={{"margin-right": 5}}
                  icon={faEye}
                  color="info"
                  onClick={() => handleViewClick(original)}
                  toolTip='View Instruction'
                />
              )}
              {/* {disabled ? ( */}
                {/* <CoreIconButton 
                  icon={faTrash}
                  color="secondary"
                  disabled={true} 
                  toolTip='Deletion is restricted to admins only' 
                /> */}
              {/* ) : ( */}
                <CoreIconButton
                  style={{"margin-right": 5}} 
                  icon={faTrash}
                  disabled={disabled}
                  color="danger" 
                  onClick={() => handleDelete(original.id)}
                  toolTip='Delete Instruction'
                />
              {/* )} */}
            </>
          );
        },
      }),
    ];
  };

  return (
    <CContainer style={{ marginTop: '15px' }}>
      <CRow>
        <CCol>
          <TableHeader
              headline="Instructions"
              buttonStyle={{ marginTop: 15, marginBottom: 20 }}
              icon={faUserPlus}
              buttonText='Add Instruction'
              className="add-instruction-button"
              onClick={handleAddInstruction}
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <BaseContainer>
          <ErrorBoundary>
            {filteredInstructions.length === 0 && !isLoading && (
              <p>No instructions available.</p>
            )}
            <div className="instruction-list">
              <CoreDataTable
                key="instructionsTable"
                tableData={enhancedInstructions}
                columns={defineColumns()}
                pageSize={10}
                isLoading={isLoading}
                getRowClassName={getRowClassName}
                usePagination={true}
                wholeData={true}
              />
            </div>
          </ErrorBoundary>
          </BaseContainer>
        </CCol>
      </CRow>

      {/* Only use BaseModal for add/edit */}
          {(editingInstruction && modalOpen) && (
            <BaseModal
              isOpen={modalOpen}
              title={editingInstruction.id ? 'Edit Instruction' : 'Add Instruction'}
              toggle={() => setModalOpen(false)}
              footer={null}
            >
              <EditInstruction
                instructionData={editingInstruction}
                onSave={handleSave}
                visLevel={visLevel}
                onClose={() => setModalOpen(false)}
              />
            </BaseModal>
          )}

          {/* Directly render ViewInstruction for view */}
          {viewingInstruction && (
            <ViewInstruction
              instructionData={viewingInstruction}
              onClose={() => setViewingInstruction(null)}
              onEdit={handleEditClick}
            />
          )}


      {isLoading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1050 }}>
          <CSpinner color="primary" size="lg" />
        </div>
      )}
    </CContainer>
  );
};

export default Instruction;