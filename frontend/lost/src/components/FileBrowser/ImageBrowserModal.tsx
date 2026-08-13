import React, { useState } from 'react'
import { CSpinner } from '@coreui/react'
import { faImages } from '@fortawesome/free-solid-svg-icons'
import LostFileBrowser from './LostFileBrowser'
import BaseModal from '../BaseModal'
import CoreIconButton from '../CoreIconButton'

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
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])

  const handleSelectionChange = (files: any[]) => {
    setSelectedFiles(files)
  }

  const imageCount = selectedFiles.filter(f => !f.isDir).length

  const handleInsert = () => {
    const paths = selectedFiles.filter(f => !f.isDir).map(f => f.id)
    setSelectedFiles([])
    onPathsSelected?.(paths)
  }

  const handleClose = () => {
    setSelectedFiles([])
    onClose()
  }

  const footer = hasMultiselect ? (
    <CoreIconButton
      className="insert-images-button"
      icon={faImages}
      color="info"
      isOutline={true}
      disabled={imageCount === 0}
      text={`Insert${imageCount > 0 ? ` (${imageCount})` : ''}`}
      onClick={handleInsert}
    />
  ) : null

  return (
    <BaseModal
      isOpen={visible}
      title={hasMultiselect ? "Select Images" : "Select an Image"}
      onClosed={handleClose}
      size="lg"
      isShowCancelButton
      toggle={handleClose}
      footer={footer}
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
              onSelectionChange={handleSelectionChange}
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
