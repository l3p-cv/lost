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
} from '../../actions/inference-model/model-api'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CRow,
} from '@coreui/react'
import CoreIconButton from '../../components/CoreIconButton'

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
    const { name, displayName, serverUrl, taskType, modelType } = formData
    const isGrpcValid = isValidGrpcUrl(serverUrl)
    const hasBasicFields =
      name.trim() && displayName.trim() && modelType && taskType !== undefined
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
    if (modelData) {
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
  }, [modelData])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = <T,>(field: keyof CreateInferenceModelRequest) => {
    return (option: { value: T }) => {
      setFormData((prev) => ({ ...prev, [field]: option.value }))
    }
  }

  const handleModelSelect = (option: { value: string }) => {
    setFormData((prev) => ({ ...prev, name: option.value }))
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
    <CModal
      visible={isOpen}
      onClose={() => {
        if (isOpen) {
          toggle()
        }
      }}
    >
      <CModalHeader>
        {isEditMode ? 'Edit Inference Model' : 'Add Inference Model'}
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
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
                  // @ts-expect-error using custom form data
                  onChange={handleModelSelect}
                  value={modelOptions.find((opt) => opt.value === formData.name)}
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
              value={taskTypeOptions.find((opt) => opt.value === formData.taskType)}
              // @ts-expect-error using custom form data
              onChange={handleSelectChange<number>('taskType')}
            />
          </CInputGroup>
          <CFormLabel>Model Type</CFormLabel>
          <CInputGroup>
            <CFormSelect
              options={modelTypeOptions}
              value={modelTypeOptions.find((opt) => opt.value === formData.modelType)}
              // @ts-expect-error using custom form data
              onChange={handleSelectChange<string>('modelType')}
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
        </CModalBody>

        <CModalFooter>
          <CoreIconButton
            color="primary"
            onClick={toggle}
            disabled={submitting}
            text={'Cancel'}
          />
          <CButton
            color="primary"
            type="submit"
            // disabled={submitting || !isFormValid()}
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}
