import { faEdit, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import ReactTable from 'react-table'
import { useToggle } from 'react-use'
import { Badge } from 'reactstrap'
import {
    INFERENCE_MODEL_TASK_TYPE,
    INFERENCE_MODEL_TYPE,
    UpdateInferenceModelRequest,
    useDeleteInferenceModel,
    useModels,
} from '../../actions/inference-model/model-api'
import HelpButton from '../../components/HelpButton'
import IconButton from '../../components/IconButton'
import * as Notification from '../../components/Notification'
import { InferenceModalConfigModal } from './InferenceModelConfigModal'

export const TabInferenceModels = () => {
    const { data, isLoading, error } = useModels()
    const [isModalOpen, toggleModal] = useToggle(false)
    const { mutate: deleteInferenceModel } = useDeleteInferenceModel()
    const [selectedModelData, setSelectedModelData] = useState<
        UpdateInferenceModelRequest | undefined
    >(undefined)

    const handleInferenceModelDelete = (modelId: number) => {
        Notification.showDecision({
            title: 'Are you sure you want to delete this model?',
            option1: {
                text: 'YES',
                callback: () => {
                    deleteInferenceModel(modelId)
                },
            },
            option2: {
                text: 'NO!',
                callback: () => {},
            },
        })
    }

    return (
        <>
            <IconButton
                color="primary"
                icon={faPlus}
                text="Add Inference Model"
                onClick={() => {
                    setSelectedModelData(undefined)
                    toggleModal()
                }}
                style={{ marginBottom: 20 }}
            />

            <InferenceModalConfigModal
                isOpen={isModalOpen}
                toggle={toggleModal}
                modelData={selectedModelData}
            ></InferenceModalConfigModal>

            <ReactTable
                loading={isLoading}
                noDataText={error ? 'Failed to load data' : 'No models available'}
                columns={[
                    {
                        Header: 'Name / Last Updated',
                        accessor: 'displayName',
                        Cell: (row) => {
                            return (
                                <>
                                    <b>{row.original.displayName}</b>
                                    <div className="small text-muted">
                                        {new Date(
                                            row.original.lastUpdated,
                                        ).toLocaleString()}
                                    </div>
                                </>
                            )
                        },
                    },
                    {
                        Header: 'Description',
                        accessor: 'description',
                        Cell: (row) => (
                            <HelpButton
                                id={row.original.id}
                                text={row.original.description}
                            />
                        ),
                    },
                    {
                        Header: 'Model Type',
                        accessor: 'modelType',
                        Cell: (row) => {
                            return (
                                <Badge
                                    color={
                                        row.original.modelType ==
                                        INFERENCE_MODEL_TYPE.YOLO
                                            ? 'primary'
                                            : 'dark'
                                    }
                                >
                                    {row.original.modelType}
                                </Badge>
                            )
                        },
                    },

                    {
                        Header: 'Task Type',
                        accessor: 'taskType',
                        Cell: (row) => {
                            return (
                                <Badge
                                    color={
                                        row.original.taskType ==
                                        INFERENCE_MODEL_TASK_TYPE.DETECTION
                                            ? 'success'
                                            : row.original.taskType ==
                                                INFERENCE_MODEL_TASK_TYPE.SEGMENTATION
                                              ? 'info'
                                              : 'warning'
                                    }
                                >
                                    {row.original.taskType ==
                                    INFERENCE_MODEL_TASK_TYPE.DETECTION
                                        ? 'DETECTION'
                                        : row.original.taskType ==
                                            INFERENCE_MODEL_TASK_TYPE.SEGMENTATION
                                          ? 'SEGMENTATION'
                                          : 'UNKNOWN'}
                                </Badge>
                            )
                        },
                    },
                    {
                        Header: 'Triton Server URL',
                        accessor: 'serverUrl',
                        Cell: (row) => {
                            return <pre>{row.original.serverUrl}</pre>
                        },
                    },
                    {
                        Header: 'Triton Model Name',
                        accessor: 'name',
                        Cell: (row) => {
                            return <p>{row.original.name}</p>
                        },
                    },
                    {
                        Header: 'Edit',
                        id: 'edit',
                        Cell: (row) => {
                            return (
                                <IconButton
                                    icon={faEdit}
                                    text={'Edit'}
                                    onClick={() => {
                                        setSelectedModelData(row.original)
                                        toggleModal()
                                    }}
                                />
                            )
                        },
                    },
                    {
                        Header: 'Delete',
                        id: 'delete',
                        Cell: (row) => {
                            return (
                                <IconButton
                                    color="danger"
                                    icon={faTrashAlt}
                                    text={'Delete'}
                                    onClick={() => {
                                        handleInferenceModelDelete(row.original.id)
                                    }}
                                />
                            )
                        },
                    },
                ]}
                data={data?.models}
                defaultPageSize={10}
                className="-striped -highlight"
            />
        </>
    )
}
