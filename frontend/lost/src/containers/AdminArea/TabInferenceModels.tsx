import { faEdit, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { useState, useMemo } from 'react'
import { useToggle } from 'react-use'
import {
  INFERENCE_MODEL_TASK_TYPE,
  INFERENCE_MODEL_TYPE,
  UpdateInferenceModelRequest,
  useDeleteInferenceModel,
  useModels,
} from '../../actions/inference-model/model-api'
import * as Notification from '../../components/Notification'
import { InferenceModalConfigModal } from './InferenceModelConfigModal'
import { CBadge, CTooltip } from '@coreui/react'
import CoreIconButton from '../../components/CoreIconButton'
import TableHeader from '../../components/TableHeader'
import CoreDataTable from '../../components/CoreDataTable'
import { createColumnHelper } from '@tanstack/react-table'
import BaseContainer from '../../components/BaseContainer'
import ErrorBoundary from '../../components/ErrorBoundary'

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

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper()
    return [
      columnHelper.display({
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          return (
            <>
              <CTooltip content={row.original.description} placement="top">
                <b style={{ textDecoration: 'grey dotted underline' }}>
                  {row.original.displayName}
                </b>
              </CTooltip>
              <div className="small text-muted">{`ID: ${row.original.id}`}</div>
            </>
          )
        },
      }),
      columnHelper.display({
        id: 'modelType',
        header: 'Model Type',
        cell: ({ row }) => (
          <CBadge
            color={
              row.original.modelType === INFERENCE_MODEL_TYPE.YOLO ? 'primary' : 'dark'
            }
          >
            {row.original.modelType}
          </CBadge>
        ),
      }),
      columnHelper.display({
        id: 'taskType',
        header: 'Task Type',
        cell: ({ row }) => (
          <CBadge
            color={
              row.original.taskType === INFERENCE_MODEL_TASK_TYPE.DETECTION
                ? 'success'
                : row.original.taskType === INFERENCE_MODEL_TASK_TYPE.SEGMENTATION
                  ? 'info'
                  : 'warning'
            }
          >
            {row.original.taskType === INFERENCE_MODEL_TASK_TYPE.DETECTION
              ? 'DETECTION'
              : row.original.taskType === INFERENCE_MODEL_TASK_TYPE.SEGMENTATION
                ? 'SEGMENTATION'
                : 'UNKNOWN'}
          </CBadge>
        ),
      }),
      columnHelper.display({
        id: 'serverUrl',
        header: 'Triton Server URL',
        cell: ({ row }) => <pre>{row.original.serverUrl}</pre>,
      }),
      columnHelper.display({
        id: 'name',
        header: 'Triton Model Name',
        cell: ({ row }) => <p>{row.original.name}</p>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <>
            <CoreIconButton
              icon={faEdit}
              style={{ marginRight: '5px' }}
              color="warning"
              toolTip={'Edit Inference Model'}
              onClick={() => {
                setSelectedModelData(row.original)
                toggleModal()
              }}
            />
            <CoreIconButton
              color="danger"
              icon={faTrashAlt}
              style={{ marginRight: '5px' }}
              toolTip={'Delete Inference Model'}
              onClick={() => {
                handleInferenceModelDelete(row.original.id)
              }}
            />
          </>
        ),
      }),
    ]
  }, [])

  const tableData = useMemo(() => data?.models ?? [], [data?.models])

  return (
    <>
      <TableHeader
        headline={'Inference Models'}
        buttonText="Add Inference Model"
        color="primary"
        icon={faPlus}
        onClick={() => {
          setSelectedModelData(undefined)
          toggleModal()
        }}
        buttonStyle={{ marginBottom: 20 }}
      />

      <InferenceModalConfigModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        modelData={selectedModelData}
      ></InferenceModalConfigModal>

      <BaseContainer>
        <ErrorBoundary>
          <CoreDataTable tableData={tableData} columns={columns} isLoading={isLoading} />
        </ErrorBoundary>
      </BaseContainer>
    </>
  )
}
