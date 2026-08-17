import { CCol, CRow, CTable, CTableHead, CTableBody, CTooltip } from '@coreui/react'
import { faTimes, faUpload, faTrash, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  ChonkyActions,
  FileBrowser,
  FileContextMenu,
  FileList,
  FileNavbar,
  FileToolbar,
  setChonkyDefaults,
} from 'chonky2'
import { ChonkyIconFA } from 'chonky-icon-fontawesome'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import * as Notification from '../Notification'
import * as fb_api from '../../api/file_browser'
import CoreIconButton from '../CoreIconButton'

const LostFileBrowser = ({ fs, onPathSelected, onPathsSelected, onSelectionChange, multiselect = false, mode = undefined, initPath, restrictToPath, allowedExtensions }) => {
  const [files, setFiles] = useState([])
  const [folderChain, setFolderChain] = useState([])
  const [size, setSize] = useState(0)
  const [selectedPath, setSelectedPath] = useState('/')
  const [selectedDir, setSelectedDir] = useState('/')
  const [copiedAccecptedFiles, setCopiedAcceptedFiles] = useState([])
  const [shakingFiles, setShakingFiles] = useState(new Set())
  const [rejectFlash, setRejectFlash] = useState(false)
  const rowRefs = useRef({})
  const accept = allowedExtensions && allowedExtensions.length > 0
    ? Object.fromEntries(allowedExtensions.map(e => [`.${e}`, []]))
    : undefined
  const MAX_FILES = 200
  const { acceptedFiles, fileRejections, getRootProps, getInputProps, isDragActive, isDragReject, isFocused } =
    useDropzone({
      accept,
      maxFiles: MAX_FILES,
      onDrop: (accepted, rejections) => {
        if (rejections.some(r => r.errors.some(e => e.code === 'too-many-files'))) {
          Notification.showError(
            `Too many files selected. Maximum is ${MAX_FILES} per batch.`
          )
        }
      },
    })
  const [uploadFilesData, uploadFiles, breakUpload] = fb_api.useUploadFiles()
  const [isUploading, setIsUploading] = useState(false)
  const {
    mutate: deleteFiles,
    status: deleteFilesStatus,
    error: deleteFilesErrorData,
  } = fb_api.useDeleteFiles()

  const { mutate: mkDir, status: mkDirStatus, error: mkDirErrorData } = fb_api.useMkDir()

  useEffect(() => {
    setChonkyDefaults({ iconComponent: ChonkyIconFA })
  }, [])
  useEffect(() => {
    if (fs) {
      if (initPath !== undefined) {
        ls(fs, initPath)
        setSelectedDir(initPath)
        setSelectedPath(initPath)
        return
      }
      ls(fs, fs.rootPath)
      setSelectedDir(fs.rootPath)
      setSelectedPath(fs.rootPath)
    }
  }, [fs])

  useEffect(() => {
    if (acceptedFiles.length === 0) return
    
    const duplicateKeys = new Set(
      acceptedFiles
        .filter((newFile) =>
          copiedAccecptedFiles.some(
            (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
          )
        )
        .map((f) => `${f.name}-${f.size}`)
    )
    
    if (duplicateKeys.size > 0) {
      setShakingFiles(duplicateKeys)
      
      setTimeout(() => {
        const firstDuplicateKey = Array.from(duplicateKeys)[0]
        const rowElement = rowRefs.current[firstDuplicateKey]
        if (rowElement) {
          rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
      
      Notification.showInfo(
        `${duplicateKeys.size} file${duplicateKeys.size > 1 ? 's' : ''} already selected to upload.`
      )
      
      setTimeout(() => setShakingFiles(new Set()), 1000)
    }
    
    const newFiles = acceptedFiles.filter(
      (newFile) =>
        !copiedAccecptedFiles.some(
          (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
        )
    )
    
    if (newFiles.length > 0) {
      setCopiedAcceptedFiles([...copiedAccecptedFiles, ...newFiles])
    }
  }, [acceptedFiles])

  useEffect(() => {
    if (fileRejections && fileRejections.length > 0) {
      setRejectFlash(true)
      setTimeout(() => setRejectFlash(false), 1500)
      const hasTooMany = fileRejections.some(r => r.errors.some(e => e.code === 'too-many-files'))
      if (!hasTooMany) {
        Notification.showError(
          `${fileRejections.length} file${fileRejections.length > 1 ? 's' : ''} rejected.<br>Accepted types: ${(allowedExtensions || []).map(e => `.${e}`).join(', ')}`
        )
      }
    }
  }, [fileRejections])

  useEffect(() => {
    setSize(copiedAccecptedFiles.reduce((acc, f) => acc + f.size, 0))
  }, [copiedAccecptedFiles])

  const removeFile = (fileToRemove) => {
    setCopiedAcceptedFiles(copiedAccecptedFiles.filter((f) => f !== fileToRemove))
  }

  const clearAllFiles = () => {
    setCopiedAcceptedFiles([])
  }

  const formatSize = (bytes) => {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${bytes} B`
  }

  const getFileType = (file) => {
    if (file.type) return file.type
    if (!file.name.includes('.')) return 'unknown'
    const ext = file.name.split('.').pop()
    return ext ? `.${ext}` : 'unknown'
  }

  const getAllowedFileActions = () => {
    if (fs) {
      if (fs.permission === 'rw') {
        return [ChonkyActions.CreateFolder, ChonkyActions.DeleteFiles]
      }
    }
    return []
  }
  const fileActions = useMemo(() => getAllowedFileActions(), [fs])

  const ls = async (fs, path) => {
    let res_data
    if (mode) {
      if (mode === 'lsTest') {
        res_data = await fb_api.lsTest(fs, path)
      } else {
        res_data = await fb_api.ls(fs, path)
      }
    } else {
      res_data = await fb_api.ls(fs, path)
    }
    
    let files = res_data['files']
    
    // Hide non-allowed files when allowedExtensions is specified (folders always shown)
    if (allowedExtensions && files) {
      files = files.filter(file => {
        if (file.isDir) return true
        const ext = file.name.split('.').pop()?.toLowerCase()
        return allowedExtensions.includes(ext)
      })
    }
    
    setFiles(files)
    const normalizedChain = (res_data['folderChain'] || []).map(f => ({ ...f, isDir: true }))
    setFolderChain(normalizedChain)
  }

  useEffect(() => {
    if (uploadFilesData.idle === false) {
      setIsUploading(true)
    } else if (uploadFilesData.isSuccess) {
      setIsUploading(false)
      Notification.showSuccess('Upload succeeded.')
      ls(fs, selectedDir)

      setCopiedAcceptedFiles([])
      setSize(0)

      uploadFilesData.progress = null
    } else if (uploadFilesData.error) {
      setIsUploading(false)
      Notification.showError('Upload failed.')
    }
  }, [uploadFilesData])

  useEffect(() => {
    if (deleteFilesStatus === 'success') {
      ls(fs, selectedDir)
      Notification.showSuccess('Deletion succeeded.')
    }
  }, [deleteFilesStatus])

  useEffect(() => {
    if (mkDirStatus === 'success') {
      Notification.showSuccess('Create directory succeeded.')
      ls(fs, selectedDir)
    }
  }, [mkDirStatus])

  const handleFileAction = (data) => {
    switch (data.id) {
      case ChonkyActions.ChangeSelection.id:
        if (multiselect && data.state && data.state.selectedFiles) {
          onSelectionChange?.(data.state.selectedFiles)
        }
        break
      case ChonkyActions.OpenFiles.id:
        if (data) {
          const targetFile = data.payload.targetFile
          const targetPath = targetFile.id
          
          // Check if navigation is allowed when restrictToPath is set
          if (restrictToPath && targetPath !== restrictToPath && !targetPath.startsWith(restrictToPath + '/')) {
            Notification.showError('Navigation outside instruction_media is not allowed.')
            return
          }
          
          // Only navigate if it's a directory
          if (targetFile.isDir) {
            ls(fs, targetPath)
            setSelectedPath(targetPath)
            setSelectedDir(targetPath)
            if (onPathSelected) {
              onPathSelected(targetPath)
            }
          }
        }
        break
      case ChonkyActions.MouseClickFile.id:
        if (data) {
          const { file, clickType } = data.payload
          
          if (multiselect) {
            const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true'
            const currentStep = parseInt(localStorage.getItem('currentStep') || '0')
            if (clickType === 'double' && onPathSelected && !(joyrideRunning && currentStep === 5)) {
              onPathSelected(file.id)
            }
          } else {
            if (onPathSelected) {
              onPathSelected(file.id)
            }
          }
        }
        break
      case ChonkyActions.CreateFolder.id:
        const folderName = prompt('Provide the name for your new folder:')
        mkDir({ fs, path: selectedDir, name: folderName })
        break
      case ChonkyActions.DeleteFiles.id:
        Notification.showDecision({
          title: 'Do you really want to delete the selected files ?',
          option1: {
            text: 'YES',
            callback: () => {
              deleteFiles({ fs, files: data.state.selectedFiles })
            },
          },
          option2: {
            text: 'NO!',
            callback: () => {},
          },
        })

        break

      default:
        break
    }
  }

  const renderFileUpload = () => {
    if (fs) {
      if (fs.permission === 'rw') {
        return (
          <CRow
            style={{
              marginTop: 10,
            }}
          >
            <CCol sm="10">
              <section
                {...getRootProps({ className: 'dropzone' })}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '30px',
                  // marginTop: '10px',
                  borderWidth: '2px',
                  borderRadius: '2px',
                  borderColor: rejectFlash ? '#f44336' : (isDragActive ? '#2196f3' : '#cccccc'),
                  borderStyle: 'dashed',
                  backgroundColor: rejectFlash ? '#ffebee' : (isDragActive ? '#e3f2fd' : '#fafafa'),
                  color: '#bdbdbd',
                  outline: 'none',
                  transition: 'border 0.24s ease-in-out, background-color 0.24s ease-in-out',
                  minHeight: '100px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  cursor: isDragActive ? 'copy' : 'pointer',
                }}
              >
                <input {...getInputProps()} />
                <p style={{
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  color: isDragActive ? '#1976d2' : '#9e9e9e',
                  cursor: isDragActive ? 'copy' : 'pointer',
                  transition: 'color 0.2s ease',
                }}>
                  <FontAwesomeIcon icon={faCloudArrowUp} style={{ fontSize: 26 }} />
                  <span style={{ fontSize: 14 }}>
                    Drag files here or{' '}
                    <span style={{ color: '#1976d2', textDecoration: 'underline' }}>browse</span>
                    {' '}to upload.
                  </span>
                  <span style={{ fontSize: 11, color: isDragActive ? '#1976d2' : '#757575' }}>
                    Max {MAX_FILES} files per selection.
                  </span>
                  {allowedExtensions && allowedExtensions.length > 0 && (
                    <span style={{ fontSize: 11, color: isDragActive ? '#1976d2' : '#757575' }}>
                      Accepted file types: {allowedExtensions.map(e => `.${e}`).join(', ')}
                    </span>
                  )}
                </p>
                {copiedAccecptedFiles.length > 0 && (
                  <aside style={{ width: '100%', marginTop: 8, pointerEvents: 'none' }}>
                    <CTable striped small style={{ fontSize: 12, marginBottom: 0, color: '#555' }}>
                      <CTableHead>
                        <tr style={{ color: '#888' }}>
                          <th style={{ textAlign: 'left', padding: '2px 4px' }}>Name</th>
                          <th style={{ textAlign: 'left', padding: '2px 4px' }}>Size</th>
                          <th style={{ textAlign: 'left', padding: '2px 4px' }}>Type</th>
                          <th style={{ padding: '2px 4px', textAlign: 'center' }}>
                            <CTooltip content="Clear all" placement="top">
                              <FontAwesomeIcon
                                icon={faTrash}
                                style={{ cursor: 'pointer', color: '#c00', pointerEvents: 'auto' }}
                                onClick={(e) => { e.stopPropagation(); clearAllFiles() }}
                                title="Clear all"
                              />
                            </CTooltip>
                          </th>
                        </tr>
                      </CTableHead>
                      <CTableBody>
                        {copiedAccecptedFiles.map((file, idx) => (
                          <tr 
                            ref={(el) => rowRefs.current[`${file.name}-${file.size}`] = el}
                            key={`${file.name}-${idx}`}
                            className={shakingFiles.has(`${file.name}-${file.size}`) ? 'shake-row' : ''}
                          >
                            <td style={{ padding: '2px 4px', wordBreak: 'break-all' }}>{file.name}</td>
                            <td style={{ padding: '2px 4px', whiteSpace: 'nowrap' }}>{formatSize(file.size)}</td>
                            <td style={{ padding: '2px 4px', whiteSpace: 'nowrap' }}>{getFileType(file)}</td>
                            <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                              <CTooltip content="Remove file" placement="top">
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  style={{ cursor: 'pointer', color: '#c00', pointerEvents: 'auto' }}
                                  onClick={(e) => { e.stopPropagation(); removeFile(file) }}
                                  title="Remove file"
                                />
                              </CTooltip>
                            </td>
                          </tr>
                        ))}
                      </CTableBody>
                    </CTable>
                  </aside>
                )}
              </section>
            </CCol>
            <CCol sm="2">
              <CoreIconButton
                icon={faUpload}
                color={'primary'}
                text={'Upload'}
                disabled={copiedAccecptedFiles.length === 0 || fs === undefined}
                onClick={
                  fs
                    ? () =>
                        uploadFiles({
                          files: copiedAccecptedFiles,
                          fsId: fs.id,
                          path: selectedPath,
                        })
                    : ''
                }
              />
              <div style={{ marginTop: 10 }}>
                {uploadFilesData.progress !== null &&
                uploadFilesData.progress !== undefined
                  ? `Progress: ${Number(uploadFilesData.progress * 100).toFixed(2)}%`
                  : ''}
              </div>
            </CCol>
          </CRow>
        )
      }
    }
    return (
      <CRow
        style={{
          marginTop: 10,
        }}
      >
        <CCol>
          <b>Read-only datasource.</b>
        </CCol>
      </CRow>
    )
  }

  return (
    <>
      <div style={{ height: 400, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <FileBrowser
          defaultFileViewActionId={ChonkyActions.EnableListView.id}
          files={files}
          folderChain={folderChain}
          fileActions={fileActions}
          onFileAction={(e) => {
            handleFileAction(e)
          }}
        >
          <FileNavbar />
          <FileToolbar />
          <FileList />
          <FileContextMenu />
        </FileBrowser>
      </div>
      {renderFileUpload()}
    </>
  )
}

export default LostFileBrowser
