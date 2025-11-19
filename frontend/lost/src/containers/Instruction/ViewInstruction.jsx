import React, { useState, useEffect } from 'react'
import MarkdownIt from 'markdown-it'
import { CModal, CModalBody, CModalHeader, CButton } from '@coreui/react'
import { FaExpand, FaCompress } from 'react-icons/fa'

const mdParser = new MarkdownIt()

const ViewInstruction = ({ instructionData, onClose, onEdit }) => {
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const modifyInstructionHTML = (htmlContent) =>
    htmlContent.replace(/<img([^>]+)>/g, (match, p1) => {
      return `<img${p1} style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />`
    })

  const renderContent = () => (
    <div
      className="p-4"
      style={{
        width: isFullScreen ? '100%' : '700px',
        margin: isFullScreen ? '0' : '0 auto',
        textAlign: 'left',
      }}
    >
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
            maxHeight: isFullScreen ? 'calc(100vh - 150px)' : '400px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            fontFamily: 'Arial, sans-serif',
            overflow: 'auto',
            width: '100%',
            textAlign: 'left',
          }}
          dangerouslySetInnerHTML={{
            __html: modifyInstructionHTML(mdParser.render(instructionData.instruction)),
          }}
        />
      </div>
    </div>
  )

  return (
    <CModal
      size={isFullScreen ? 'xl' : 'lg'}
      visible={true}
      onClose={onClose}
      fullscreen={isFullScreen}
      backdrop="static"
    >
      <CModalHeader closeButton>
        <div className="d-flex justify-content-between align-items-center w-100">
          <h5 className="mb-0">Instruction Details</h5>
          <div>
            <CButton color="info" size="sm" onClick={toggleFullScreen} className="me-2">
              {isFullScreen ? <FaCompress /> : <FaExpand />}
            </CButton>
          </div>
        </div>
      </CModalHeader>
      <CModalBody
        className="overflow-auto"
        style={{
          maxHeight: '100vh',
          display: 'flex',
          justifyContent: isFullScreen ? 'flex-start' : 'center',
        }}
      >
        {renderContent()}
      </CModalBody>
    </CModal>
  )
}

export default ViewInstruction
