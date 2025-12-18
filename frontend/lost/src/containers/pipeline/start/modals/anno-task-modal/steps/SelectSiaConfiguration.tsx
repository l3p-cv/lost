import { CCol, CFormInput, CFormSwitch, CRow } from '@coreui/react'
import { useNodesData, useReactFlow } from '@xyflow/react'
import Select from 'react-select'
import {
  INFERENCE_MODEL_TYPE,
  Model,
  useModels,
} from '../../../../../../actions/inference-model/model-api'
import { CenteredSpinner } from '../../../../../../components/CenteredSpinner'
import { AnnoTaskNodeData } from '../../../nodes'
import InfoText from '../../../../../../components/InfoText'

interface SelectSiaConfigurationProps {
  nodeId: string
}

export const SelectSiaConfiguration = ({ nodeId }: SelectSiaConfigurationProps) => {
  const nodeData = useNodesData(nodeId)
  const { configuration } = nodeData?.data as AnnoTaskNodeData

  const { data: modelsData, isLoading: isModelsLoading } = useModels()

  const { updateNodeData } = useReactFlow()

  const changeValue = (key, value) => {
    const newConfiguration = { ...configuration }
    switch (key) {
      case 'tool-bbox':
        newConfiguration.tools.bbox = value
        break
      case 'tool-polygon':
        newConfiguration.tools.polygon = value
        break
      case 'tool-point':
        newConfiguration.tools.point = value
        break
      case 'tool-line':
        newConfiguration.tools.line = value
        break
      case 'action-draw':
        newConfiguration.annos.actions.draw = value
        break
      case 'action-edit':
        newConfiguration.annos.actions.edit = value
        break
      case 'action-label':
        newConfiguration.annos.actions.label = value
        newConfiguration.annos.multilabels = false
        break
      case 'action-multilabel':
        newConfiguration.annos.multilabels = value
        break
      case 'annos-minarea':
        newConfiguration.annos.minArea = value
        break
      case 'image-junk':
        newConfiguration.tools.junk = value
        break
      case 'image-label':
        newConfiguration.img.actions.label = value
        newConfiguration.img.multilabels = false
        break
      case 'image-multilabel':
        newConfiguration.img.multilabels = value
        break
      case 'inference-model':
        if (!value) {
          newConfiguration.inferenceModel = undefined
          newConfiguration.tools.sam = false
          break
        }
        newConfiguration.inferenceModel = { ...value }
        newConfiguration.tools.sam = value.modelType === INFERENCE_MODEL_TYPE.SAM
        break
      default:
        break
    }
    updateNodeData(nodeId, { configuration: newConfiguration })
  }

  if (!configuration) return ''
  const infoTextGrids = 2

  return (
    <>
      <div id="sia-configuration-heading">
        <h4 className="mb-3 text-center">SIA Configuration</h4>
        <CRow style={{ margin: '5px' }}>
          <CCol sm="6">
            <h2>Annotation Types</h2>
            <CRow>
              <CCol sm="12" style={{ marginTop: '5px' }}>
                <CRow>
                  <CCol sm={infoTextGrids * 2} className="align-self-center">
                    <InfoText
                      text={'BBox'}
                      style={{ fontSize: 20 }}
                      toolTip={'Allow to add / edit bboxes'}
                      id="bbox"
                    />
                  </CCol>
                  <CCol sm="1">
                    <CFormSwitch
                      size="xl"
                      color={'primary'}
                      checked={configuration.tools.bbox}
                      onChange={() => changeValue('tool-bbox', !configuration.tools.bbox)}
                    />
                  </CCol>
                </CRow>
              </CCol>
              <CCol sm="12" style={{ marginTop: '10px' }}>
                <CRow>
                  <CCol sm={infoTextGrids * 2} className="align-self-center">
                    <InfoText
                      text={'Polygon'}
                      style={{ fontSize: 20 }}
                      toolTip={'Allow to add / edit polygons'}
                      id="polygon"
                    />
                  </CCol>
                  <CCol sm="2">
                    <CFormSwitch
                      size="xl"
                      color={'primary'}
                      checked={configuration.tools.polygon}
                      onChange={() =>
                        changeValue('tool-polygon', !configuration.tools.polygon)
                      }
                    />
                  </CCol>
                </CRow>
              </CCol>
              <CCol sm="12" style={{ marginTop: '10px' }}>
                <CRow>
                  <CCol sm={infoTextGrids * 2} className="align-self-center">
                    <InfoText
                      text={'Point'}
                      style={{ fontSize: 20 }}
                      toolTip={'Allow to add / edit points'}
                      id="point"
                    />
                  </CCol>
                  <CCol sm="1">
                    <CFormSwitch
                      size="xl"
                      color={'primary'}
                      checked={configuration.tools.point}
                      onChange={() =>
                        changeValue('tool-point', !configuration.tools.point)
                      }
                    />
                  </CCol>
                </CRow>
              </CCol>
              <CCol sm="12" style={{ marginTop: '10px' }}>
                <CRow>
                  <CCol sm={infoTextGrids * 2} className="align-self-center">
                    <InfoText
                      text={'Line'}
                      style={{ fontSize: 20 }}
                      toolTip={'Allow to add / edit lines'}
                      id="line"
                    />
                  </CCol>
                  <CCol sm="2">
                    <CFormSwitch
                      size="xl"
                      color={'primary'}
                      checked={configuration.tools.line}
                      onChange={() => changeValue('tool-line', !configuration.tools.line)}
                    />
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </CCol>
          <CCol sm="6">
            <h2>Annotation Actions</h2>
            <CRow>
              <CCol sm="12" style={{ marginTop: '5px' }}>
                <CRow>
                  <CCol sm={infoTextGrids * 2} className="align-self-center">
                    <InfoText
                      text={'Draw'}
                      style={{ fontSize: 20 }}
                      toolTip={'Allow to add new annotations'}
                      id="draw-anno"
                    />
                  </CCol>
                  <CCol sm="1">
                    <CFormSwitch
                      size="xl"
                      color={'primary'}
                      checked={configuration.annos.actions.draw}
                      onChange={() =>
                        changeValue('action-draw', !configuration.annos.actions.draw)
                      }
                    />
                  </CCol>
                </CRow>
              </CCol>
              <CCol sm="12" style={{ marginTop: '10px' }}>
                <CRow>
                  <CCol sm={infoTextGrids * 2} className="align-self-center">
                    <InfoText
                      text={'Edit'}
                      style={{ fontSize: 20 }}
                      toolTip={
                        'Allow to edit an annotation (move / change size and points)'
                      }
                      id="edit-anno"
                    />
                  </CCol>
                  <CCol sm="1">
                    <CFormSwitch
                      size="xl"
                      color={'primary'}
                      checked={configuration.annos.actions.edit}
                      onChange={() =>
                        changeValue('action-edit', !configuration.annos.actions.edit)
                      }
                    />
                  </CCol>
                </CRow>
              </CCol>
              <CCol sm="12" style={{ marginTop: '10px' }}>
                <CRow>
                  <CCol sm={infoTextGrids * 2} className="align-self-center">
                    <InfoText
                      text={'Label'}
                      style={{ fontSize: 20 }}
                      toolTip={'Allow to apply a label to an annotation'}
                      id="label-anno"
                    />
                  </CCol>
                  <CCol sm="1">
                    <CFormSwitch
                      size="xl"
                      color={'primary'}
                      checked={configuration.annos.actions.label}
                      onChange={() =>
                        changeValue('action-label', !configuration.annos.actions.label)
                      }
                    />
                  </CCol>
                </CRow>
              </CCol>
              <CCol sm="12" style={{ marginTop: '10px' }}>
                <CRow>
                  <CCol sm={infoTextGrids * 2} className="align-self-center">
                    <InfoText
                      text={'Multilabel'}
                      style={{ fontSize: 20 }}
                      toolTip={'Allow to apply multiple labels to an annotation'}
                      id="multilabel-anno"
                    />
                  </CCol>
                  <CCol sm="1">
                    <CFormSwitch
                      size="xl"
                      color={'primary'}
                      checked={configuration.annos.multilabels}
                      onChange={() =>
                        changeValue('action-multilabel', !configuration.annos.multilabels)
                      }
                      disabled={!configuration.annos.actions.label}
                    />
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </CCol>
        </CRow>
        <hr />
        <CRow style={{ margin: '5px', marginTop: '20px', marginBottom: '20px' }}>
          <CCol sm="12" style={{ marginTop: '5px' }}>
            <InfoText
              text={'Minimum Annotation Size'}
              toolTip={
                'Allow only annotations with an area greater than value in pixel ( only applies to polygons and bboxes)'
              }
              id="min-anno-area"
              style={{ fontSize: 20, marginBottom: '10px' }}
            />
            <CFormInput
              type="number"
              min={1}
              step={1}
              value={configuration.annos.minArea}
              onChange={(e) => changeValue('annos-minarea', e.currentTarget.value)}
            />
          </CCol>
        </CRow>
        <hr />
        <CRow style={{ margin: '5px' }}>
          <CCol sm="12">
            <h2>Image</h2>
            <CCol sm="12">
              <CRow>
                <CCol sm={infoTextGrids} className="align-self-center">
                  <InfoText
                    text={'Junk'}
                    style={{ fontSize: 20 }}
                    toolTip={'Allow to mark images as junk'}
                  />
                </CCol>
                <CCol sm="1" className="align-self-center">
                  <CFormSwitch
                    size="xl"
                    color={'primary'}
                    checked={configuration.tools.junk}
                    onChange={() => changeValue('image-junk', !configuration.tools.junk)}
                  />
                </CCol>
              </CRow>
            </CCol>
            <CCol sm="12">
              <CRow style={{ marginTop: '10px' }} className="align-content-center">
                <CCol sm={infoTextGrids} className="align-self-center">
                  <InfoText
                    text={'Label'}
                    style={{ fontSize: 20 }}
                    toolTip={'Allow to label the whole image'}
                    id="label-image"
                  />
                </CCol>
                <CCol sm="1" className="align-self-center">
                  <CFormSwitch
                    size="xl"
                    color={'primary'}
                    checked={configuration.img.actions.label}
                    onChange={() =>
                      changeValue('image-label', !configuration.img.actions.label)
                    }
                  />
                </CCol>
              </CRow>
            </CCol>
            <CCol sm="12" style={{ marginTop: '10px' }}>
              <CRow>
                <CCol sm={infoTextGrids} className="align-self-center">
                  <InfoText
                    text={'Multilabel'}
                    style={{ fontSize: 20 }}
                    toolTip={'Allow to apply multiple labels to the whole image'}
                    id="multilabel-image"
                  />
                </CCol>
                <CCol sm="1" className="align-self-center">
                  <CFormSwitch
                    size="xl"
                    color={'primary'}
                    checked={configuration.img.multilabels}
                    onChange={() =>
                      changeValue('image-multilabel', !configuration.img.multilabels)
                    }
                    disabled={!configuration.img.actions.label}
                  />
                </CCol>
              </CRow>
            </CCol>
          </CCol>
        </CRow>

        <hr />
        <CRow style={{ margin: '5px', marginTop: '20px', marginBottom: '20px' }}>
          <CCol sm="12">
            <InfoText
              text={'Inference Model'}
              toolTip={'Inference model to use in Annotask'}
              style={{ fontSize: 20, marginBottom: '10px' }}
            />
            {modelsData && (
              <Select
                options={modelsData.models}
                isClearable
                getOptionLabel={(option: Model) => option.displayName}
                getOptionValue={(option: Model) => option.id.toString()}
                onChange={(selectedOption) => {
                  changeValue('inference-model', selectedOption)
                }}
                placeholder="Select a model..."
                defaultValue={configuration.inferenceModel}
                id="inferenceModelSelect"
              />
            )}
            {isModelsLoading && <CenteredSpinner />}
          </CCol>
        </CRow>
      </div>
    </>
  )
}
