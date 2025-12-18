import React from 'react'
import { CSpinner } from '@coreui/react'
import LostFileBrowser from './LostFileBrowser'
import BaseModal from '../BaseModal'

type ImageBrowserModalProps = {
  visible: boolean
  onClose: () => void
  fsLoading: boolean
  initPath: string
  onPathSelected: () => void
}

const ImageBrowserModal = ({
  visible,
  onClose,
  fs,
  fsLoading,
  fullFs,
  initPath,
  onPathSelected,
}: ImageBrowserModalProps) => {
  return (
    <BaseModal
      isOpen={visible}
      title="Select an Image"
      onClosed={onClose}
      size="lg"
      isShowCancelButton
      toggle={onClose}
    >
      <div className="file-browser-modal">
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
      </div>
    </BaseModal>
  )
}

export default ImageBrowserModal
