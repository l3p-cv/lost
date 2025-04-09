import React, { useState } from 'react';
import MarkdownIt from 'markdown-it';
import { CCard, CCardBody, CCardHeader, CButton, CModal, CModalBody, CModalHeader } from '@coreui/react';
import { FaExpand, FaCompress } from 'react-icons/fa';

const mdParser = new MarkdownIt();

const ViewInstruction = ({ instructionData, onClose, onEdit }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const modifyInstructionHTML = (htmlContent) => {
    return htmlContent.replace(/<img([^>]+)>/g, (match, p1) => {
      return `<img${p1} style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />`;
    });
  };

  const renderContent = () => (
    <div className="p-4">
      <div className="mb-4">
        <strong className="text-primary">Annotation Option:</strong>
        <p>{instructionData.option}</p>
      </div>

      <div className="mb-4">
        <strong className="text-primary">Description:</strong>
        <p>{instructionData.description}</p>
      </div>

      <div className="mb-4">
        <strong className="text-primary">Instruction:</strong>
        <div
          className="p-4 border rounded-lg shadow-sm overflow-auto"
          style={{
            backgroundColor: '#f9f9f9',
            maxHeight: '400px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
          }}
          dangerouslySetInnerHTML={{
            __html: modifyInstructionHTML(mdParser.render(instructionData.instruction)),
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Regular View (Card) */}
      {!isFullScreen && (
        <CCard className="mx-auto" style={{ maxWidth: '700px' }}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Instruction Details</h5>
            <div>
              <CButton color="info" size="sm" onClick={toggleFullScreen} className="me-2">
                <FaExpand />
              </CButton>
              <CButton color="secondary" size="sm" onClick={onClose}>
                Close
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody className="overflow-auto" style={{ maxHeight: '500px' }}>
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
          <CModalBody
            className="overflow-auto"
            style={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <CButton color="info" size="sm" onClick={toggleFullScreen}>
                <FaCompress />
              </CButton>
              <CButton color="secondary" size="sm" onClick={onClose}>
                Close
              </CButton>
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', 
                height: 'calc(100vh - 90px)',
                overflowY: 'auto',
              }}
            >
              <div
                className="p-4 border rounded-lg shadow-sm overflow-auto"
                style={{
                  backgroundColor: '#f9f9f9',
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  fontFamily: 'Arial, sans-serif',
                }}
                dangerouslySetInnerHTML={{
                  __html: modifyInstructionHTML(mdParser.render(instructionData.instruction)),
                }}
              />
            </div>
          </CModalBody>
        </CModal>
      )}
    </>
  );
};

export default ViewInstruction;