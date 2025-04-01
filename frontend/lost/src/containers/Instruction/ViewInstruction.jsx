import React, { useState } from 'react';
import MarkdownIt from 'markdown-it';
import { CCard, CCardBody, CCardHeader, CButton, CModal, CModalBody, CModalHeader } from '@coreui/react';
import { FaExpand, FaCompress, FaEdit } from 'react-icons/fa';

const mdParser = new MarkdownIt();

const ViewInstruction = ({ instructionData, onClose, onEdit }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const renderContent = () => (
    <div className="p-3">
      <div className="mb-3">
        <strong>Annotation Option:</strong>
        <p>{instructionData.option}</p>
      </div>

      <div className="mb-3">
        <strong>Description:</strong>
        <p>{instructionData.description}</p>
      </div>

      <div className="mb-3">
        <strong>Instruction:</strong>
        <div
          className="p-3 border rounded overflow-auto"
          style={{ backgroundColor: '#f8f9fa', maxHeight: '300px' }}
          dangerouslySetInnerHTML={{ __html: mdParser.render(instructionData.instruction) }}
        />
      </div>

      <CButton color="secondary" onClick={onClose}>Close</CButton>
    </div>
  );

  return (
    <>
      {/* Regular View (Card) */}
      {!isFullScreen && (
        <CCard className="mx-auto" style={{ maxWidth: '600px' }}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Instruction Details</h5>
            <div>
              <CButton color="info" size="sm" onClick={toggleFullScreen} className="me-2">
                <FaExpand />
              </CButton>
              {/* <CButton color="warning" size="sm" onClick={() => onEdit(instructionData)}>
                <FaEdit className="me-1" />
                Edit
              </CButton> */}
            </div>
          </CCardHeader>
          <CCardBody className="overflow-auto" style={{ maxHeight: '400px' }}>
            {renderContent()}
          </CCardBody>
        </CCard>
      )}

      {/* Full-Screen View */}
      {isFullScreen && (
        <CModal size="xl" visible={isFullScreen} onClose={toggleFullScreen} fullscreen>
          <CModalHeader closeButton>
            <h5>Instruction Details (Full Screen)</h5>
          </CModalHeader>
          <CModalBody className="overflow-auto" style={{ height: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <CButton color="info" size="sm" onClick={toggleFullScreen}>
                <FaCompress />
              </CButton>
              {/* <CButton color="warning" size="sm" onClick={() => onEdit(instructionData)}>
                <FaEdit className="me-1" />
                Edit
              </CButton> */}
            </div>
            {renderContent()}
          </CModalBody>
        </CModal>
      )}
    </>
  );
};

export default ViewInstruction;