import React, { useState, useEffect } from 'react';
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
  const [data, setData] = useState([]);
  const [editingInstruction, setEditingInstruction] = useState(null);
  const [viewingInstruction, setViewingInstruction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('instructionsData');
    if (savedData) {
      const parsedData = JSON.parse(savedData).filter(
        item => item.id && item.option && typeof item.instruction === 'string'
      );
      setData(parsedData);
    }
  }, []);

  const handleEditClick = (instruction) => {
    setLoading(true);
    setViewingInstruction(null);
    setTimeout(() => {
      setEditingInstruction(instruction);
      setLoading(false);
      setModalOpen(true);
    }, 500);
  };
  
  const handleViewClick = (instruction) => {
    setLoading(true);
    setEditingInstruction(null);
    setTimeout(() => {
      setViewingInstruction(instruction);
      setLoading(false);
      setModalOpen(true);
    }, 500);
  };
  

  const handleAddInstruction = () => {
    setViewingInstruction(null);
    setEditingInstruction({ id: null, option: '', description: '', instruction: '' });
    setModalOpen(true);
  };

  const handleSave = (updatedInstruction) => {
    setData(prevData => {
      let updatedData;
      if (editingInstruction.id) {
        updatedData = prevData.map(item =>
          item.id === editingInstruction.id
            ? { ...item, ...updatedInstruction }
            : item
        );
      } else {
        const newId = prevData.length > 0
          ? Math.max(...prevData.map(item => item.id)) + 1
          : 1;
        updatedData = [...prevData, { id: newId, ...updatedInstruction }];
      }
      localStorage.setItem("instructionsData", JSON.stringify(updatedData));
      return updatedData;
    });

    setEditingInstruction(null);
    setModalOpen(false);
    Notification.showSuccess("Instruction saved successfully!");
  };

  const handleDelete = (id) => {
    Notification.showDecision({
      title: "Are you sure you want to delete this instruction?",
      option1: { text: "YES", callback: () => {
        setData(prevData => {
          const updatedData = prevData.filter(item => item.id !== id);
          localStorage.setItem("instructionsData", JSON.stringify(updatedData));
          Notification.showSuccess("Instruction deleted successfully!");
          return updatedData;
        });
      }},
      option2: { text: "NO", callback: () => {} }
    });
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
              data={data}
              columns={columns}
              pageSize={10}
              isLoading={loading}
              onRowClick={() => {}}
            />
          </BaseContainer>
        </CCol>
      </CRow>
      <BaseModal
        isOpen={modalOpen}
        title={editingInstruction ? "Edit Instruction" : viewingInstruction ? "View Instruction" : "Add Instruction" }
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
          mode={editingInstruction ? "edit" : "add"}
        />
      ) : null}
    </BaseModal>


    {loading && (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1050
      }}>
        <CSpinner color="primary" size="lg" />
      </div>
    )}



    </CContainer>
  );
};

export default Instruction;
