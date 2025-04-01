import React, { useState, useEffect } from 'react';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { CButton, CFormInput } from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const mdParser = new MarkdownIt();

const EditInstruction = ({ instructionData, onSave, visLevel, onClose}) => {
  const [option, setOption] = useState(instructionData?.option || '');
  const [description, setDescription] = useState(instructionData?.description || '');
  const [content, setContent] = useState(instructionData?.instruction || '');
  const navigate = useNavigate();

  useEffect(() => {
    setOption(instructionData?.option || '');
    setDescription(instructionData?.description || ''); 
    setContent(instructionData?.instruction || '');
  }, [instructionData]);

  const handleEditorChange = ({ text }) => {
    setContent(text);
  };

  const handleSave = () => {
    if (!option.trim()) {
      alert('Annotation option cannot be empty.');
      return;
    }
    if (!description.trim()) { // Validate description
      alert('Description cannot be empty.');
      return;
    }
    onSave({ id: instructionData.id, option, description, instruction: content }); // Save description separately
    if (visLevel !== 'global') {
      navigate('/instruction');  // Redirect for non-admin users
    } else {
      onClose();  // Close modal for admins (global level)
    }
  };

  return (
    <div>
      <CFormInput
        label="Annotation Option"
        value={option}
        onChange={(e) => setOption(e.target.value)}
        placeholder="Enter annotation option"
        className="mb-3"
      />
      <CFormInput
        label="Description"
        value={description}
        onChange={(e) => {
          const wordCount = e.target.value.trim().split(/\s+/).length;
          if (wordCount <= 20) {
            setDescription(e.target.value);
          } else {
            alert('Description cannot exceed 20 words.');
          }
        }}
        placeholder="Enter description (max 20 words)"
        className="mb-3"
      />
      <MdEditor
        value={content}
        style={{ height: '400px' }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
      />
      <CButton color="primary" onClick={handleSave} className="mt-3">
        Save
      </CButton>
    </div>
  );
};

export default EditInstruction;