import { CCol, CRow, CTable, CTableHead, CTableBody, CTooltip } from '@coreui/react'
import { faTimes, faUpload, faTrash} from '@fortawesome/free-solid-svg-icons'
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

const LostFileBrowser = ({ fs, onPathSelected, mode = undefined, initPath }) => {
  const [files, setFiles] = useState([])
  const [folderChain, setFolderChain] = useState([])
  const [size, setSize] = useState(0)
  const [selectedPath, setSelectedPath] = useState('/')
  const [selectedDir, setSelectedDir] = useState('/')
  const [copiedAccecptedFiles, setCopiedAcceptedFiles] = useState([])
  const [shakingFiles, setShakingFiles] = useState(new Set())
  const rowRefs = useRef({})
  const { acceptedFiles, getRootProps, getInputProps, isDragReject, isFocused } =
    useDropzone({})
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
    
    const duplicateNames = new Set(
      acceptedFiles
        .filter((newFile) =>
          copiedAccecptedFiles.some(
            (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
          )
        )
        .map((f) => f.name)
    )
    
    if (duplicateNames.size > 0) {
      setShakingFiles(duplicateNames)
      
      setTimeout(() => {
        const firstDuplicateName = Array.from(duplicateNames)[0]
        const rowElement = rowRefs.current[firstDuplicateName]
        if (rowElement) {
          rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
      
      Notification.showInfo(
        `${duplicateNames.size} file${duplicateNames.size > 1 ? 's' : ''} already selected to upload.`
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
    setFiles(res_data['files'])
    setFolderChain(res_data['folderChain'])
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
      case ChonkyActions.OpenFiles.id:
        if (data) {
          ls(fs, data.payload.targetFile.id)
          setSelectedPath(data.payload.targetFile.id)
          setSelectedDir(data.payload.targetFile.id)
          if (onPathSelected) {
            onPathSelected(data.payload.targetFile.id)
          }
        }
        break
      case ChonkyActions.MouseClickFile.id:
        if (data) {
          if (onPathSelected) {
            onPathSelected(data.payload.file.id)
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
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '30px',
                  // marginTop: '10px',
                  borderWidth: '2px',
                  borderRadius: '2px',
                  borderColor: '#cccccc',
                  borderStyle: 'dashed',
                  backgroundColor: '#fafafa',
                  color: '#bdbdbd',
                  outline: 'none',
                  transition: 'border 0.24s ease-in-out',
                  minHeight: '100px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                <div {...getRootProps({ className: 'dropzone' })}>
                  <input {...getInputProps()} />
                  <p>Upload files to this folder by drag 'n' drop or clicking.</p>
                </div>
                {copiedAccecptedFiles.length > 0 && (
                  <aside style={{ width: '100%', marginTop: 8 }}>
                    <CTable striped hover small style={{ fontSize: 12, marginBottom: 0, color: '#555' }}>
                      <CTableHead>
                        <tr style={{ color: '#888' }}>
                          <th style={{ textAlign: 'left', padding: '2px 4px' }}>Name</th>
                          <th style={{ textAlign: 'left', padding: '2px 4px' }}>Size</th>
                          <th style={{ textAlign: 'left', padding: '2px 4px' }}>Type</th>
                          <th style={{ padding: '2px 4px', textAlign: 'center' }}>
                            <CTooltip content="Clear all" placement="top">
                              <FontAwesomeIcon
                                icon={faTrash}
                                style={{ cursor: 'pointer', color: '#c00' }}
                                onClick={clearAllFiles}
                                title="Clear all"
                              />
                            </CTooltip>
                          </th>
                        </tr>
                      </CTableHead>
                      <CTableBody>
                        {copiedAccecptedFiles.map((file, idx) => (
                          <tr 
                            ref={(el) => rowRefs.current[file.name] = el}
                            key={`${file.name}-${idx}`}
                            className={shakingFiles.has(file.name) ? 'shake-row' : ''}
                          >
                            <td style={{ padding: '2px 4px', wordBreak: 'break-all' }}>{file.name}</td>
                            <td style={{ padding: '2px 4px', whiteSpace: 'nowrap' }}>{formatSize(file.size)}</td>
                            <td style={{ padding: '2px 4px', whiteSpace: 'nowrap' }}>{getFileType(file)}</td>
                            <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                              <CTooltip content="Remove file" placement="top">
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  style={{ cursor: 'pointer', color: '#c00' }}
                                  onClick={() => removeFile(file)}
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
