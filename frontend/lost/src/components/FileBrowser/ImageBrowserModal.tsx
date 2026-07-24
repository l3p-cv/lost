import React from 'react'
import { CSpinner } from '@coreui/react'
import LostFileBrowser from './LostFileBrowser'
import BaseModal from '../BaseModal'

type ImageBrowserModalProps = {
  visible: boolean
  onClose: () => void
  fsLoading: boolean
  initPath: string
  onPathSelected?: (path: string) => void
  onPathsSelected?: (paths: string[]) => void
  restrictToPath?: string
  allowedExtensions?: string[]
}

const ImageBrowserModal = ({
  visible,
  onClose,
  fs,
  fsLoading,
  fullFs,
  initPath,
  onPathSelected,
  onPathsSelected,
  restrictToPath,
  allowedExtensions,
}: ImageBrowserModalProps) => {
  const hasMultiselect = !!onPathsSelected
  
  return (
    <BaseModal
      isOpen={visible}
      title={hasMultiselect ? "Select Images" : "Select an Image"}
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
              multiselect={hasMultiselect}
              onPathSelected={onPathSelected}
              onPathsSelected={onPathsSelected}
              restrictToPath={restrictToPath}
              allowedExtensions={allowedExtensions}
            />
          )
        )}
      </div>
    </BaseModal>
  )
}

export default ImageBrowserModal
