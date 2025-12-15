import {
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormInput,
  CFormSwitch,
  CRow,
} from '@coreui/react'
import { useNodesData, useReactFlow } from '@xyflow/react'
import HelpButton from '../../../../../../components/HelpButton'
import { AnnoTaskNodeData } from '../../../nodes'
import InfoText from '../../../../../../components/InfoText'

interface SelectMiaConfigurationProps {
  nodeId: string
}

export const SelectMiaConfiguration = ({ nodeId }: SelectMiaConfigurationProps) => {
  const nodeData = useNodesData(nodeId)
  const { configuration } = nodeData?.data as AnnoTaskNodeData

  const { updateNodeData } = useReactFlow()

  const changeValue = (key, value) => {
    const newConfiguration = { ...configuration }
    switch (key) {
      case 'show-proposed-label':
        newConfiguration.showProposedLabel = value
        break
      case 'anno-type':
        newConfiguration.type = value
        break
      case 'draw-anno':
        newConfiguration.drawAnno = value
        break
      case 'add-context':
        newConfiguration.addContext = value
        break
      default:
        break
    }
    updateNodeData(nodeId, { configuration: newConfiguration })
  }
  return (
    <>
      {configuration ? (
        <div id="mia-configuration-heading">
          <h4 className="mb-3 text-center">MIA Configuration</h4>
          <CRow style={{ margin: '5px', marginLeft: '5px' }}>
            <CCol sm="12" className="align-self-center">
              <CRow>
                <CCol sm="4" className="align-self-center">
                  <InfoText
                    text={'-Show proposed label:'}
                    toolTip={'Show proposed label (if given)'}
                    style={{ fontSize: 20 }}
                  />
                </CCol>
                <CCol sm="1" className="align-self-center">
                  <CFormSwitch
                    size="xl"
                    color={'primary'}
                    checked={configuration.showProposedLabel}
                    onChange={() =>
                      changeValue('show-proposed-label', !configuration.showProposedLabel)
                    }
                  />
                </CCol>
              </CRow>
            </CCol>
          </CRow>
          <hr />

          <CRow style={{ margin: '5px' }}>
            <InfoText
              text={'Annotation Type:'}
              toolTip={
                'If annotation requests are based on whole images or two_d annotations (in example from a previous SIA annotation step)'
              }
              style={{ fontSize: 20, marginBottom: '15px' }}
            />
            <CRow style={{ marginLeft: '5px' }}>
              <CDropdown>
                <CDropdownToggle color="primary">{configuration.type}</CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem
                    href="#"
                    onClick={() => changeValue('anno-type', 'annoBased')}
                  >
                    annoBased
                  </CDropdownItem>
                  <CDropdownItem
                    href="#"
                    onClick={() => changeValue('anno-type', 'imageBased')}
                  >
                    imageBased
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CRow>
            <CRow>
              {configuration.type === 'annoBased' ? (
                <CRow style={{ marginLeft: '5px' }} className="align-items-center">
                  <CRow className="align-items-center" style={{ marginTop: '15px' }}>
                    <CCol sm="4" className="align-self-center">
                      <InfoText
                        text={'-Draw Anno:'}
                        toolTip={'Draw 2D annotations on the image'}
                        style={{ fontSize: 20 }}
                        id="draw-anno"
                      />
                    </CCol>
                    <CCol sm="1" className="align-self-center">
                      <CFormSwitch
                        size="xl"
                        color={'primary'}
                        checked={configuration.drawAnno}
                        onChange={() => changeValue('draw-anno', !configuration.drawAnno)}
                      />
                    </CCol>
                  </CRow>

                  <CRow style={{ marginTop: '10px' }}>
                    <CCol sm="4" className="align-self-center">
                      <InfoText
                        text={'-Add Context:'}
                        toolTip={`A margin of pixels is added around the annotation when it is cropped. The number of pixels is calculated relative to the image size. For example, setting addContext to 0.1 adds 10% of the image size to the crop. This helps provide the annotator with more visual context during annotation.`}
                        style={{ fontSize: 20 }}
                      />
                    </CCol>
                    <CCol sm="8" className="align-self-center">
                      <CFormInput
                        type="number"
                        min={0.0}
                        step={0.01}
                        max={1.0}
                        style={{ maxWidth: '20%' }}
                        value={configuration.addContext || 0.3}
                        onChange={(e) =>
                          changeValue('add-context', e.currentTarget.value)
                        }
                      />
                    </CCol>
                  </CRow>
                </CRow>
              ) : (
                ''
              )}
            </CRow>
          </CRow>
        </div>
      ) : (
        ''
      )}
    </>
  )
}
