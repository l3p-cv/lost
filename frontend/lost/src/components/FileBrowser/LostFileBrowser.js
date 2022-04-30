import React, { useEffect, useState, useMemo } from 'react'
import { CRow, CCol } from '@coreui/react'
import IconButton from '../../components/IconButton'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { setChonkyDefaults, ChonkyActions } from 'chonky'
import { ChonkyIconFA } from 'chonky-icon-fontawesome'
import { FileBrowser, FileContextMenu, FileList, FileNavbar, FileToolbar } from 'chonky'
import { useDropzone } from 'react-dropzone'
import * as Notification from '../../components/Notification'
// import axios from 'axios'
// import {API_URL} from '../../lost_settings'
import * as fbaccess from '../../access/fb'
import * as fb_api from '../../actions/fb/fb_api'

const LostFileBrowser = ({ fs, onPathSelected, mode, initPath = undefined }) => {
    const [files, setFiles] = useState([])
    const [folderChain, setFolderChain] = useState([])
    const [size, setSize] = useState(0)
    const [selectedPath, setSelectedPath] = useState('/')
    const [selectedDir, setSelectedDir] = useState('/')
    const [copiedAccecptedFiles, setCopiedAcceptedFiles] = useState([])
    const { acceptedFiles, getRootProps, getInputProps, isDragReject, isFocused } =
        useDropzone({})
    const [uploadFilesData, uploadFiles, breakUpload] = fb_api.useUploadFiles()

    const {
        mutate: deleteFiles,
        status: deleteFilesStatus,
        error: deleteFilesErrorData,
    } = fb_api.useDeleteFiles()

    const {
        mutate: mkDir,
        status: mkDirStatus,
        error: mkDirErrorData,
    } = fb_api.useMkDir()

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
        let newSize = 0
        acceptedFiles.map((a) => {
            newSize += a.size
        })
        setCopiedAcceptedFiles(acceptedFiles)
        setSize(newSize)
    }, [acceptedFiles])

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
                res_data = await fbaccess.lsTest(fs, path)
            } else {
                res_data = await fbaccess.ls(fs, path)
            }
        } else {
            res_data = await fbaccess.ls(fs, path)
        }
        setFiles(res_data['files'])
        setFolderChain(res_data['folderChain'])
    }

    useEffect(() => {
        if (uploadFilesData.isSuccess) {
            setCopiedAcceptedFiles([])
            Notification.showSuccess('Upload succeeded.')
            ls(fs, selectedDir)
        }
        if (uploadFilesData.isSuccess === false) {
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
                                    height: '100px',
                                }}
                            >
                                <div {...getRootProps({ className: 'dropzone' })}>
                                    <input {...getInputProps()} />
                                    <p>
                                        Upload files to this folder by drag 'n' drop or
                                        clicking.
                                    </p>
                                </div>
                                <aside>
                                    <b style={{ color: '#898989' }}>
                                        <ul>
                                            {' '}
                                            {copiedAccecptedFiles.length > 0 ? (
                                                <li key={copiedAccecptedFiles[0].path}>
                                                    {copiedAccecptedFiles.length} File
                                                    {copiedAccecptedFiles.length > 1
                                                        ? 's'
                                                        : ''}
                                                    {' - '}
                                                    {Number(
                                                        (size / 1024 / 1024).toFixed(2),
                                                    )}{' '}
                                                    MBytes
                                                </li>
                                            ) : (
                                                ''
                                            )}
                                        </ul>
                                    </b>
                                </aside>
                            </section>
                        </CCol>
                        <CCol sm="2">
                            {' '}
                            <IconButton
                                icon={faUpload}
                                color={'primary'}
                                text={'Upload'}
                                disabled={
                                    copiedAccecptedFiles.length === 0 || fs === undefined
                                }
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
                                {uploadFilesData.progress
                                    ? `Progress: ${Number(
                                          uploadFilesData.progress * 100,
                                      ).toFixed(2)}%`
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
            <div style={{ height: 400 }}>
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
