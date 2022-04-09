import React, { useEffect, useState } from 'react'
import IconButton from '../../components/IconButton'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import BaseModal from '../../components/BaseModal'
import { useDropzone } from 'react-dropzone'
import * as pipelineTemplatesApi from '../../actions/pipeline/pipeline_templates_api'
import * as Notification from '../../components/Notification'

const AddPipelineTemplate = ({ visLevel }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { acceptedFiles, getRootProps, getInputProps, isDragReject, isFocused } =
        useDropzone({
            accept: '.zip',
            maxFiles: 1,
        })

    const [submitNewPipelineTemplateData, submitNewPipelineTemplate, breakUpload] =
        pipelineTemplatesApi.useSubmitNewPipelineTemplate()

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
            submitNewPipelineTemplate({
                zip_file: acceptedFiles[0],
                vis_level: visLevel,
            })
        }
    }, [acceptedFiles])

    useEffect(() => {
        if (submitNewPipelineTemplateData === 'success') {
            Notification.showSuccess('Import succeeded.')
        }
        if (submitNewPipelineTemplateData === 'error') {
            Notification.showSuccess('Import failed.')
        }
    }, [submitNewPipelineTemplateData])

    return (
        <>
            <BaseModal
                isOpen={isModalOpen}
                toggle={() => setIsModalOpen(false)}
                isShowCancelButton
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
                text="Import pipeline template"
                onClick={() => setIsModalOpen(true)}
            />
        </>
    )
}

export default AddPipelineTemplate
