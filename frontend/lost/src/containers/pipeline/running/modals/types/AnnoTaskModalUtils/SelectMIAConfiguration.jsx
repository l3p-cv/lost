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
import { useEffect, useState } from 'react'
import InfoText from '../../../../../../components/InfoText'

export const SelectMIAConfiguration = ({ ...props }) => {
  const [configuration, setConfiguration] = useState()

  useEffect(() => {
    setConfiguration(props.configuration)
  }, [props])

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

    setConfiguration(newConfiguration)
    props.onUpdate(newConfiguration)
  }
  return (
    <>
      {configuration ? (
        <>
          <CRow style={{ margin: '5px' }}>
            <CCol sm="12">
              <InfoText
                text={'MIA Configuration:'}
                style={{ fontSize: 20, marginBottom: '15px' }}
              />
              <CRow
                style={{ marginLeft: '5px', marginBottom: '15px' }}
                className="align-content-center"
              >
                <CCol sm="4" className="align-self-center">
                  <InfoText
                    text={'-Show proposed label:'}
                    toolTip={'Show proposed label (if given)'}
                    id="show-proposed-label"
                    style={{ fontSize: 20 }}
                  />
                </CCol>
                <CCol sm="1" className="align-self-center">
                  <CFormSwitch
                    // className={'mx-1'}
                    // variant={'3d'}
                    size="xl"
                    color={'primary'}
                    checked={configuration.showProposedLabel}
                    onChange={(e) =>
                      changeValue('show-proposed-label', !configuration.showProposedLabel)
                    }
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol sm="12">
                  <CRow style={{ marginLeft: '5px' }}>
                    <InfoText
                      text={'-Annotation Type:'}
                      tTipPlacement="right"
                      toolTip={
                        'Wether annotation requests are based on whole images or two_d annotations (in example from a previous SIA annotation step)'
                      }
                      style={{ fontSize: 20, marginBottom: '15px' }}
                    />
                    <CDropdown>
                      <CDropdownToggle color="primary">
                        {configuration.type}
                      </CDropdownToggle>
                      <CDropdownMenu>
                        <CDropdownItem
                          href="#"
                          onClick={(e) => changeValue('anno-type', 'annoBased')}
                        >
                          annoBased
                        </CDropdownItem>
                        <CDropdownItem
                          href="#"
                          onClick={(e) => changeValue('anno-type', 'imageBased')}
                        >
                          imageBased
                        </CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>
                  </CRow>
                </CCol>
                {configuration.type === 'annoBased' ? (
                  <>
                    <CRow style={{ marginLeft: '5px' }}>
                      <CCol
                        sm="4"
                        style={{ marginTop: '15px' }}
                        className="align-self-center"
                      >
                        <InfoText
                          text={'-Draw Anno:'}
                          id="draw-anno"
                          toolTip={'Wether to draw two_d annnotations into the image'}
                          style={{ fontSize: 20, marginBottom: '15px' }}
                        />
                      </CCol>
                      <CCol sm="1" className="align-self-center">
                        <CFormSwitch
                          className={'mx-1'}
                          size="xl"
                          variant={'3d'}
                          color={'primary'}
                          checked={configuration.drawAnno}
                          onChange={(e) =>
                            changeValue('draw-anno', !configuration.drawAnno)
                          }
                        />
                      </CCol>
                    </CRow>
                    <CRow style={{ marginLeft: '5px' }}>
                      <CCol
                        sm="4"
                        style={{ marginTop: '15px' }}
                        className="align-self-center"
                      >
                        <InfoText
                          text={'-Add Context:'}
                          id="add-context"
                          toolTip={`Add some amount of pixels will be added around the annotation when the
                                                        annotation is cropped.
                                                        The number of pixels that are add is calculated relative to the
                                                        image size.
                                                        So if you set addContext to 0.1,
                                                        10 percent of the image size will be added to the crop.
                                                        This setting is useful to provide the annotator some more visual
                                                        context during the annotation step. `}
                          style={{ fontSize: 20, marginBottom: '15px' }}
                        />
                      </CCol>
                      <CCol sm="8" className="align-self-center">
                        <CFormInput
                          type="number"
                          min={0.0}
                          step={0.01}
                          max={1.0}
                          style={{ maxWidth: '20%' }}
                          value={configuration.addContext}
                          onChange={(e) =>
                            changeValue('add-context', e.currentTarget.value)
                          }
                        />
                      </CCol>
                    </CRow>
                  </>
                ) : (
                  ''
                )}
              </CRow>
            </CCol>
          </CRow>
        </>
      ) : (
        ''
      )}
    </>
  )
}

export default SelectMIAConfiguration
