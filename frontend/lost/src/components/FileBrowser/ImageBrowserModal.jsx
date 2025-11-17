import React from 'react'
import { CModal, CModalBody, CModalHeader, CModalTitle, CSpinner } from '@coreui/react'
import LostFileBrowser from './LostFileBrowser'

const ImageBrowserModal = ({
  visible,
  onClose,
  fs,
  fsLoading,
  fullFs,
  initPath,
  onPathSelected,
}) => {
  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <div className="file-browser-modal">
        <CModalHeader>
          <CModalTitle>Select an Image</CModalTitle>
        </CModalHeader>
        <CModalBody>
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
      </div>
    </CModal>
  )
}

export default ImageBrowserModal
