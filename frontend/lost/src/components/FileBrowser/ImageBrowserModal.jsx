import React from 'react';
import { CModal, CModalBody, CModalHeader, CModalTitle, CSpinner } from '@coreui/react';
import LostFileBrowser from './LostFileBrowser';

const ImageBrowserModal = ({ visible, onClose, fs, fsLoading, fullFs, initPath, onPathSelected }) => {
  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>Select an Image</CModalTitle>
      </CModalHeader>
      <CModalBody  className="file-browser-modal">
        {fsLoading ? (
          <CSpinner color="primary" />
        ) : (
          fullFs && (
            <LostFileBrowser
              fs={fullFs}
              initPath={initPath}
              onPathSelected={onPathSelected}
            />
          )
        )}
      </CModalBody>
    </CModal>
  );
};

export default ImageBrowserModal;
