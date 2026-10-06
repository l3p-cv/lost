import { isEmpty } from 'lodash'
import React, { useEffect, useState } from 'react'
import {
  CreateInferenceModelRequest,
  INFERENCE_MODEL_TASK_TYPE,
  INFERENCE_MODEL_TYPE,
  UpdateInferenceModelRequest,
  useCreateInferenceModel,
  useTritonModels,
  useUpdateInferenceModel,
} from '../../api/inference_model'
import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CRow,
} from '@coreui/react'
import CoreIconButton from '../../components/CoreIconButton'
import BaseModal from '../../components/BaseModal'
import { faSave } from '@fortawesome/free-solid-svg-icons'

type ModelModalProps = {
  isOpen: boolean
  toggle: () => void
  modelData?: UpdateInferenceModelRequest // optional → for edit mode
}

const isValidGrpcUrl = (url: string) => /^([a-zA-Z0-9.-]+:\d+)$/.test(url)

const taskTypeOptions = [
  { value: INFERENCE_MODEL_TASK_TYPE.DETECTION, label: 'Detection' },
  { value: INFERENCE_MODEL_TASK_TYPE.SEGMENTATION, label: 'Segmentation' },
]

const modelTypeOptions = [
  { value: INFERENCE_MODEL_TYPE.YOLO, label: 'YOLO' },
  { value: INFERENCE_MODEL_TYPE.SAM, label: 'SAM' },
]

export const InferenceModalConfigModal: React.FC<ModelModalProps> = ({
  isOpen,
  toggle,
  modelData,
}) => {
  const isEditMode = !isEmpty(modelData)

  const [formData, setFormData] = useState<CreateInferenceModelRequest>({
    name: '',
    displayName: '',
    serverUrl: '',
    taskType: INFERENCE_MODEL_TASK_TYPE.DETECTION,
    modelType: INFERENCE_MODEL_TYPE.YOLO,
    description: '',
  })

  const [modelsFetched, setModelsFetched] = useState(false)

  const isFormValid = (): boolean => {
    const { displayName, serverUrl, taskType, modelType } = formData
    const isGrpcValid = isValidGrpcUrl(serverUrl)
    const hasBasicFields =
      displayName.trim() && modelType && taskType !== undefined
    return isGrpcValid && !!hasBasicFields
  }

  const {
    data: modelsResponse,
    refetch: fetchModels,
    isFetching,
  } = useTritonModels(formData.serverUrl)

  const createMutation = useCreateInferenceModel()
  const updateMutation = useUpdateInferenceModel()

  useEffect(() => {
    if (isOpen && modelData) {
      const m = modelData
      setFormData({
        name: m.name,
        displayName: m.displayName,
        serverUrl: m.serverUrl,
        taskType: m.taskType,
        modelType: m.modelType,
        description: m.description || '',
      })
    }
  }, [isOpen, modelData])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange =
    (field: 'taskType' | 'modelType') =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const raw = e.target.value
      setFormData((prev) => ({
        ...prev,
        [field]: field === 'taskType' ? parseInt(raw, 10) : raw,
      }))
    }

  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }))
  }

  const handleFetchModels = async () => {
    await fetchModels()
    setModelsFetched(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const onSuccess = () => {
      toggle()
      resetForm()
    }

    if (isEditMode && modelData) {
      updateMutation.mutate({ id: modelData.id, ...formData }, { onSuccess })
    } else {
      createMutation.mutate(formData, { onSuccess })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      serverUrl: '',
      taskType: INFERENCE_MODEL_TASK_TYPE.DETECTION,
      modelType: INFERENCE_MODEL_TYPE.YOLO,
      description: '',
    })
    setModelsFetched(false)
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const modelOptions = modelsResponse?.models.map((m) => ({ label: m, value: m })) ?? []

  const submitting = createMutation.isLoading || updateMutation.isLoading

  return (
    <BaseModal
      asForm={true}
      isShowCancelButton
      title={isEditMode ? 'Edit Inference Model' : 'Add Inference Model'}
      isOpen={isOpen}
      toggle={() => toggle()}
      onSubmit={handleSubmit}
      onClosed={() => {
        isOpen = false
      }}
      footer={
          <CoreIconButton
            color="success"
            type="submit"
            icon={faSave}
            disabled={submitting || !isFormValid()}
            toolTip={
              !isFormValid()
                ? 'Display name and a valid Triton Server URL (host:port) are required'
                : undefined
            }
            text={submitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          />
      }
    >
      <CForm>
        <CFormLabel>Triton Server URL (gRPC)</CFormLabel>
        <CInputGroup>
          <CFormInput
            name="serverUrl"
            value={formData.serverUrl}
            onChange={handleInputChange}
            placeholder="gRPC URL"
            required
          />

          {isValidGrpcUrl(formData.serverUrl) && (
            <CButton
              onClick={handleFetchModels}
              disabled={isFetching}
              style={{ height: '100%' }}
              color="primary"
            >
              {isFetching ? 'Fetching...' : 'Fetch Models'}
            </CButton>
          )}
        </CInputGroup>
        <CRow>
          {!isValidGrpcUrl(formData.serverUrl) && (
            <small className="text-danger">Enter a valid gRPC URL</small>
          )}
        </CRow>

        {modelsFetched && modelOptions.length > 0 && (
          <>
            <CFormLabel>Model</CFormLabel>
            <CInputGroup>
              <CFormSelect
                options={modelOptions}
                onChange={handleModelSelect}
                value={formData.name}
                placeholder="Select a model"
              />
            </CInputGroup>
          </>
        )}
        <CFormLabel>Display Name</CFormLabel>
        <CInputGroup>
          <CFormInput
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            placeholder="Display Name"
          />
        </CInputGroup>
        <CFormLabel>Task Type</CFormLabel>
        <CInputGroup>
          <CFormSelect
            options={taskTypeOptions}
            value={String(formData.taskType)}
            onChange={handleSelectChange('taskType')}
          />
        </CInputGroup>
        <CFormLabel>Model Type</CFormLabel>
        <CInputGroup>
          <CFormSelect
            options={modelTypeOptions}
            value={formData.modelType}
            onChange={handleSelectChange('modelType')}
          />
        </CInputGroup>

        <CFormLabel>Description</CFormLabel>
        <CInputGroup>
          <CFormInput
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </CInputGroup>
      </CForm>
    </BaseModal>
  )
}
