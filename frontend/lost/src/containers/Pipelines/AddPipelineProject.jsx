import React, { useEffect, useState } from 'react'
import IconButton from '../../components/IconButton'
import {
    faPlus,
    faTimes,
    faUpload,
    faEarth,
    faFileZipper,
} from '@fortawesome/free-solid-svg-icons'
import BaseModal from '../../components/BaseModal'
import { useDropzone } from 'react-dropzone'
import { CRow, CCol, CInput } from '@coreui/react'
import * as pipelinedProjectsApi from '../../actions/pipeline/pipeline_projects_api'
import * as Notification from '../../components/Notification'
import HelpButton from '../../components/HelpButton'
import CollapseCard from '../../containers/pipeline/globalComponents/modals/CollapseCard'
const AddPipelineProject = ({ visLevel, projectNames = [], refetch }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { acceptedFiles, getRootProps, getInputProps, isDragReject, isFocused } =
        useDropzone({
            accept: '.zip',
            maxFiles: 1,
        })
    const [uploadZipfile, setUploadZipfile] = useState()
    const [gitUrl, setGitUrl] = useState()
    //'https://github.com/l3p-cv/lost-pipeline-zoo.git'
    const [gitBranch, setGitBranch] = useState('main')
    const [submitNewPipelineProjectData, submitNewPipelineProject, breakUpload] =
        pipelinedProjectsApi.useSubmitNewPipelineProject()

    const {
        data: importPipelineProjectGitData,
        mutate: importPipelineGit,
        status: pipelineImportGitStatus,
    } = pipelinedProjectsApi.useImportPipelineProjectGit()
    // useEffect(() => {
    //     if (acceptedFiles.length === 1) {
    //     }
    // }, [acceptedFiles])

    const getColor = () => {
        if (uploadZipfile) {
            return '#2EB85C'
        }
        if (isDragReject) {
            return '#ff1744'
        }
        if (isFocused) {
            return '#2196f3'
        }
        return '#eeeeee'
    }
    useEffect(() => {
        if (acceptedFiles[0]) {
            setUploadZipfile(acceptedFiles[0])
        }
    }, [acceptedFiles])
    useEffect(() => {
        if (submitNewPipelineProjectData.isSuccess) {
            Notification.showSuccess('Import succeeded.')
            setUploadZipfile(undefined)
            setIsModalOpen(false)
        }
        if (submitNewPipelineProjectData.isSuccess === false) {
            setUploadZipfile(undefined)
            if (submitNewPipelineProjectData.errorMessage) {
                Notification.showError(
                    `Import failed: ${submitNewPipelineProjectData.errorMessage}`,
                    7500,
                )
            } else {
                Notification.showError('Import failed.')
            }
        }
    }, [submitNewPipelineProjectData])

    useEffect(() => {
        if (pipelineImportGitStatus === 'success') {
            if (importPipelineProjectGitData !== 'success') {
                setGitUrl('')
                setGitBranch('main')
                Notification.showError(
                    `Import failed: ${importPipelineProjectGitData}`,
                    7500,
                )
            } else {
                setGitUrl('')
                setGitBranch('main')
                setIsModalOpen(false)
                refetch()
                Notification.showSuccess('Import succeeded.')
            }
        }
        if (pipelineImportGitStatus === 'error') {
            setGitUrl('')
            setGitBranch('main')
            Notification.showError('Import failed.')
        }
    }, [pipelineImportGitStatus])

    const onImportZipFile = () => {
        if (uploadZipfile) {
            if (projectNames.includes(uploadZipfile.name.split('.')[0])) {
                Notification.showDecision({
                    title: 'The uploaded pipe project already exists, do you want to update it ?',
                    option1: {
                        text: 'Yes',
                        callback: () => {
                            submitNewPipelineProject({
                                zip_file: uploadZipfile,
                                vis_level: visLevel,
                            })
                        },
                    },
                    option2: {
                        text: 'No',
                        callback: () => {},
                    },
                })
            } else {
                submitNewPipelineProject({
                    zip_file: uploadZipfile,
                    vis_level: visLevel,
                })
            }
        }
    }
    const onImportGit = () => {
        //'https://github.com/l3p-cv/lost-pipeline-zoo.git'
        if (gitUrl) {
            const data = {
                gitUrl,
                gitBranch,
            }
            const splittedUrl = gitUrl.split('/')
            if (
                projectNames.includes(splittedUrl[splittedUrl.length - 1]) ||
                projectNames.includes(
                    splittedUrl[splittedUrl.length - 1].split('.git')[0],
                )
            ) {
                Notification.showDecision({
                    title: 'The uploaded pipe project already exists, do you want to update it ?',
                    option1: {
                        text: 'Yes',
                        callback: () => {
                            importPipelineGit(data)
                        },
                    },
                    option2: {
                        text: 'No',
                        callback: () => {},
                    },
                })
            } else {
                importPipelineGit(data)
            }
        }
    }
    const renderModalFooter = () => {
        return (
            <IconButton
                icon={faTimes}
                isOutline={false}
                color="secondary"
                text="Close"
                onClick={() => setIsModalOpen(false)}
            />
        )
    }
    return (
        <>
            <BaseModal
                title="Import or Update pipe project"
                isOpen={isModalOpen}
                toggle={() => setIsModalOpen(false)}
                footer={renderModalFooter()}
            >
                <CRow>
                    <CCol sm="12">
                        <CollapseCard
                            initOpen
                            icon={faFileZipper}
                            buttonText={
                                ' Import / Update pipeline project from .zip File'
                            }
                        >
                            <CRow>
                                <CCol sm="12">
                                    <section
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '20px',
                                            borderWidth: '2px',
                                            borderRadius: '2px',
                                            borderColor: getColor(),
                                            borderStyle: 'dashed',
                                            backgroundColor: '#fafafa',
                                            color: '#bdbdbd',
                                            outline: 'none',
                                            transition: 'border 0.24s ease-in-out',
                                            height: '250px',
                                        }}
                                    >
                                        <div {...getRootProps({ className: 'dropzone' })}>
                                            <input {...getInputProps()} />
                                            <p>
                                                Upload zip-file by drag 'n' drop or
                                                clicking.
                                            </p>
                                        </div>
                                        <aside>
                                            <b style={{ color: '#898989' }}>
                                                <ul>
                                                    {' '}
                                                    {uploadZipfile ? (
                                                        <li key={uploadZipfile.path}>
                                                            {uploadZipfile.path} -{' '}
                                                            {Number(
                                                                (
                                                                    uploadZipfile.size /
                                                                    1024
                                                                ).toFixed(2),
                                                            )}{' '}
                                                            KBytes
                                                        </li>
                                                    ) : (
                                                        ''
                                                    )}
                                                </ul>
                                            </b>
                                        </aside>
                                    </section>
                                    <IconButton
                                        style={{
                                            marginLeft: '5px',
                                            marginTop: '10px',
                                            marginBottom: '20px',
                                        }}
                                        color="primary"
                                        isOutline={false}
                                        disabled={uploadZipfile === undefined}
                                        onClick={() => onImportZipFile()}
                                        icon={faUpload}
                                        text="Import / Update"
                                    />
                                </CCol>
                            </CRow>
                        </CollapseCard>
                        <CollapseCard
                            icon={faEarth}
                            buttonText={
                                'Import / Update pipeline project from a public git repository'
                            }
                        >
                            <CRow>
                                <CCol sm="12">
                                    <CRow
                                        style={{
                                            marginLeft: '5px',
                                            marginTop: '10px',
                                        }}
                                    >
                                        <CInput
                                            type="text"
                                            style={{ maxWidth: '40%' }}
                                            value={gitUrl}
                                            onChange={(e) =>
                                                setGitUrl(e.currentTarget.value)
                                            }
                                        />
                                        <b
                                            style={{
                                                marginLeft: '20px',
                                                display: 'inline',
                                            }}
                                        >
                                            Git Url
                                            <HelpButton
                                                id="url"
                                                text={`Enter a git url to a public git repository that 
                                                contains the LOST pipeline project. `}
                                            />
                                        </b>
                                    </CRow>
                                    <CRow
                                        style={{
                                            marginLeft: '5px',
                                            marginTop: '10px',
                                        }}
                                    >
                                        <CInput
                                            type="text"
                                            style={{ maxWidth: '40%' }}
                                            value={gitBranch}
                                            onChange={(e) =>
                                                setGitBranch(e.currentTarget.value)
                                            }
                                        />
                                        <b
                                            style={{
                                                marginLeft: '20px',
                                                display: 'inline',
                                            }}
                                        >
                                            Git Branch
                                            <HelpButton
                                                id="branch"
                                                text={`Specify a branch or tag name of the Git repository to checkout on import to this branch or tag. 
                                            If no branch is specified, "main" is used by default. `}
                                            />
                                        </b>
                                    </CRow>
                                    <IconButton
                                        style={{
                                            marginLeft: '5px',
                                            marginTop: '10px',
                                            marginBottom: '20px',
                                        }}
                                        color="primary"
                                        isOutline={false}
                                        disabled={gitUrl === undefined}
                                        onClick={() => onImportGit()}
                                        icon={faUpload}
                                        text="Import / Update"
                                    />
                                </CCol>
                            </CRow>
                        </CollapseCard>
                    </CCol>
                </CRow>
            </BaseModal>
            <IconButton
                icon={faPlus}
                text="Import pipeline project"
                onClick={() => setIsModalOpen(true)}
            />
        </>
    )
}

export default AddPipelineProject
