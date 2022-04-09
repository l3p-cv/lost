import React, { useEffect, useState } from 'react'
import IconButton from '../../components/IconButton'
import { faPlus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import BaseModal from '../../components/BaseModal'
import { useDropzone } from 'react-dropzone'
import * as pipelinedProjectsApi from '../../actions/pipeline/pipeline_projects_api'
import * as Notification from '../../components/Notification'

const AddPipelineProject = ({ visLevel }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { acceptedFiles, getRootProps, getInputProps, isDragReject, isFocused } =
        useDropzone({
            accept: '.zip',
            maxFiles: 1,
        })

    const [submitNewPipelineProjectData, submitNewPipelineProject, breakUpload] =
        pipelinedProjectsApi.useSubmitNewPipelineProject()

    useEffect(() => {
        if (acceptedFiles.length === 1) {
            console.log('Data recieved')
        }
    }, [acceptedFiles])

    const getColor = () => {
        if (acceptedFiles[0]) {
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
            console.log(acceptedFiles)
            submitNewPipelineProject({
                zip_file: acceptedFiles[0],
                vis_level: visLevel,
            })
        }
    }, [acceptedFiles])

    useEffect(() => {
        console.log(submitNewPipelineProjectData)

        if (submitNewPipelineProjectData.isSuccess) {
            Notification.showSuccess('Import succeeded.')
        }
        if (submitNewPipelineProjectData.isSuccess) {
            Notification.showError('Import failed.')
        }
    }, [submitNewPipelineProjectData])

    const renderModalFooter = () => {
        return (
            <IconButton
                icon={faTimes}
                color={submitNewPipelineProjectData.isSuccess ? 'success' : 'danger'}
                text={submitNewPipelineProjectData.isSuccess ? 'Close' : 'Cancel'}
                onClick={() => setIsModalOpen(false)}
            />
        )
    }
    return (
        <>
            <BaseModal
                title="Import pipe project"
                isOpen={isModalOpen}
                toggle={() => setIsModalOpen(false)}
                footer={renderModalFooter()}
            >
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
                        <p>Upload zip-file by drag 'n' drop or clicking.</p>
                    </div>
                    <aside>
                        <b style={{ color: '#898989' }}>
                            <ul>
                                {' '}
                                {acceptedFiles[0] ? (
                                    <li key={acceptedFiles[0].path}>
                                        {acceptedFiles[0].path} -{' '}
                                        {Number(
                                            (acceptedFiles[0].size / 1024).toFixed(2),
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
