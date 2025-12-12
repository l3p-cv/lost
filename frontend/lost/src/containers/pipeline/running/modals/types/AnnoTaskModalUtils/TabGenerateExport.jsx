import { useEffect, useState } from 'react'

import {
  CBadge,
  CCol,
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormInput,
  CFormSwitch,
  CRow,
} from '@coreui/react'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import * as annoTaskApi from '../../../../../../actions/annoTask/anno_task_api'
import * as Notification from '../../../../../../components/Notification'
import CoreIconButton from '../../../../../../components/CoreIconButton'
import InfoText from '../../../../../../components/InfoText'

const TabGenerateExport = ({ annotaskId, imgCount, annotatedImgCount, setActive }) => {
  const {
    data: annoTaskExportData,
    mutate: generateExport,
    status: generateExportStatus,
  } = annoTaskApi.useGenerateExport()

  const [newExport, setNewExport] = useState({
    exportName: 'LOST_Annotation',
    exportType: 'LOST_Dataset',
    annotatedOnly: true,
    includeImages: false,
    randomSplits: {
      active: false,
      train: 0.7,
      test: 0.2,
      val: 0.1,
    },
  })

  useEffect(() => {
    if (generateExportStatus === 'success') {
      Notification.showSuccess('Your annotation export will now be created.')
    }
    if (generateExportStatus === 'error') {
      Notification.showError('Error while creating your export.')
    }
  }, [generateExportStatus])

  const onGenerateExport = () => {
    const data = { annotaskId: annotaskId, exportConfig: newExport }
    generateExport(data)
    setActive(0)
  }
  const validateSplit = (splitType, value) => {
    let splits = {}
    if (splitType === 'train') {
      splits = { ...newExport.randomSplits, train: parseFloat(value) }
    }
    if (splitType === 'test') {
      splits = { ...newExport.randomSplits, test: parseFloat(value) }
    }
    if (splitType === 'val') {
      splits = { ...newExport.randomSplits, val: parseFloat(value) }
    }
    if (splits.train + splits.test + splits.val <= 1.0) {
      setNewExport({ ...newExport, randomSplits: splits })
    }
  }

  const dropdownMenuLost = () => {
    return (
      <CDropdown>
        <CDropdownToggle color="primary" variant="outline">
          {newExport.exportType}
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem
            href="#"
            onClick={(e) =>
              setNewExport({
                ...newExport,
                exportType: 'LOST_Dataset',
              })
            }
          >
            LOST_Dataset
          </CDropdownItem>
          {/* <CDropdownItem
                        href="#"
                        onClick={(e) =>
                          setNewExport({
                            ...newExport,
                            exportType: 'PascalVOC',
                          })
                        }
                      >
                        PascalVOC
                      </CDropdownItem>
                      <CDropdownItem
                        href="#"
                        onClick={(e) =>
                          setNewExport({
                            ...newExport,
                            exportType: 'MS_Coco',
                          })
                        }
                      >
                        MSCoco
                      </CDropdownItem>
                      <CDropdownItem
                        href="#"
                        onClick={(e) =>
                          setNewExport({
                            ...newExport,
                            exportType: 'YOLO',
                          })
                        }
                      >
                        YOLO
                      </CDropdownItem> */}
          <CDropdownItem
            href="#"
            onClick={(e) =>
              setNewExport({
                ...newExport,
                exportType: 'CSV',
              })
            }
          >
            CSV
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    )
  }

  return (
    <CContainer>
      <CRow style={{ marginLeft: '5px' }}>
        <CCol sm="6">
          <CRow xs={{ gutterY: 3 }}>
            <CCol sm="4" className="align-self-center">
              <InfoText
                text="Export Name:"
                toolTip="Give your export file a name."
                style={{ fontSize: 20 }}
                id="export-name"
              />
            </CCol>
            <CCol>
              <CFormInput
                type="text"
                value={newExport.exportName}
                onChange={(e) =>
                  setNewExport({
                    ...newExport,
                    exportName: e.currentTarget.value,
                  })
                }
              />
            </CCol>
            <CCol sm="12">
              <CRow>
                <CCol xl="4" className="align-self-center">
                  <InfoText
                    text="Annotated only:"
                    toolTip="Only add annotations from already annotated images to the export."
                    style={{ fontSize: 20 }}
                    id="annotated-only"
                  />
                </CCol>
                <CCol xs="6" lg="2">
                  <CFormSwitch
                    size="xl"
                    className={'mx-1'}
                    color={'primary'}
                    checked={newExport.annotatedOnly}
                    onChange={(e) =>
                      setNewExport({
                        ...newExport,
                        annotatedOnly: !newExport.annotatedOnly,
                      })
                    }
                  />
                </CCol>
              </CRow>
            </CCol>
            <CCol sm="12">
              <CRow>
                <CCol xl="4">
                  <InfoText
                    text="Include Images:"
                    toolTip="Whether images should be packed into the export. (Attention, the file size can become very large). "
                    style={{ fontSize: 20 }}
                    id="include-images"
                  />
                </CCol>
                <CCol xs="6" lg="2">
                  <CFormSwitch
                    size="xl"
                    className={'mx-1'}
                    color={'primary'}
                    checked={newExport.includeImages}
                    onChange={(e) =>
                      setNewExport({
                        ...newExport,
                        includeImages: !newExport.includeImages,
                      })
                    }
                  />
                  {newExport.includeImages ? (
                    <CBadge color="primary" shape="pill" style={{ marginLeft: '20px' }}>
                      {newExport.annotatedOnly
                        ? `${annotatedImgCount} images`
                        : `${imgCount} images`}
                    </CBadge>
                  ) : (
                    ''
                  )}
                </CCol>
              </CRow>
            </CCol>
            <CCol sm="12">
              <CRow>
                <CCol xl="4" className="align-self-center">
                  <InfoText
                    text="Export Type:"
                    toolTip="Type of data export"
                    style={{ fontSize: 20 }}
                    id="export-type"
                  />
                </CCol>
                <CCol xs="12" lg="5">
                  {dropdownMenuLost()}
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </CCol>
        <CCol sm="6">
          <CRow
            style={{
              marginTop: '0px',
              marginBottom: '40px',
              marginLeft: '20px',
            }}
            xs={{ gutterY: 0 }}
          >
            <CCol sm="10">
              <CRow>
                <CCol sm="7" className="align-self-center">
                  <InfoText
                    text={'Split Dataset Export:'}
                    toolTip={`If this setting is active, 
                                the dataset will be split into the parts indicated below. 
                                This is done randomly based on the image path`}
                    style={{ fontSize: 20, marginLeft: '20px' }}
                    id="random-splits"
                  />
                </CCol>
                <CCol>
                  <CFormSwitch
                    size="xl"
                    className={'mx-1'}
                    color={'primary'}
                    checked={newExport.randomSplits.active}
                    onChange={(e) =>
                      setNewExport({
                        ...newExport,
                        randomSplits: {
                          train: newExport.randomSplits.train,
                          test: newExport.randomSplits.test,
                          val: newExport.randomSplits.val,
                          active: !newExport.randomSplits.active,
                        },
                      })
                    }
                  />
                </CCol>
                {newExport.randomSplits.active ? (
                  <>
                    <div
                      style={{
                        marginLeft: '15px',
                        marginTop: '10px',
                      }}
                    >
                      <CRow>
                        <CCol className="align-self-center">
                          <InfoText
                            text="-Train Portion: "
                            toolTip={`Split for train`}
                            style={{ fontSize: 20, marginLeft: '20px' }}
                            id="split-train"
                          />
                        </CCol>
                        <CCol md="6">
                          <CFormInput
                            type="number"
                            min={0.0}
                            step={0.01}
                            max={1.0}
                            value={newExport.randomSplits.train}
                            onChange={(e) =>
                              validateSplit('train', e.currentTarget.value)
                            }
                          />
                        </CCol>
                      </CRow>
                    </div>
                    <div
                      style={{
                        marginLeft: '15px',
                        marginTop: '10px',
                      }}
                    >
                      <CRow>
                        <CCol className="align-self-center">
                          <InfoText
                            text="-Test Portion: "
                            toolTip={`Split for test`}
                            style={{ fontSize: 20, marginLeft: '20px' }}
                            id="split-test"
                          />
                        </CCol>
                        <CCol md="6">
                          <CFormInput
                            type="number"
                            min={0.0}
                            step={0.01}
                            max={1.0}
                            value={newExport.randomSplits.test}
                            onChange={(e) => validateSplit('test', e.currentTarget.value)}
                          />
                        </CCol>
                      </CRow>
                    </div>
                    <div
                      style={{
                        marginLeft: '15px',
                        marginTop: '10px',
                      }}
                    >
                      <CRow>
                        <CCol className="align-self-center">
                          <InfoText
                            text="-Val Portion: "
                            toolTip={`Split for val`}
                            style={{ fontSize: 20, marginLeft: '20px' }}
                            id="split-val"
                          />
                        </CCol>
                        <CCol md="6">
                          <CFormInput
                            type="number"
                            min={0.0}
                            step={0.01}
                            max={1.0}
                            value={newExport.randomSplits.val}
                            onChange={(e) => validateSplit('val', e.currentTarget.value)}
                          />
                        </CCol>
                      </CRow>
                    </div>
                  </>
                ) : (
                  ''
                )}
              </CRow>
            </CCol>
            {/* <CCol sm="12">
              <h4 className="mt-3">Datastore</h4>
              <CRow>
                <CCol sm="12">
                  <CRow>
                    <CCol md="2">
                      <CFormSwitch
                        size="xl"
                        className={'mx-1'}
                        variant={'3d'}
                        color={'primary'}
                        checked={newExport.randomSplits.active}
                        onChange={(e) => {
                          console.log('export to datastore switch flipped')
                        }}
                      />
                    </CCol>
                    <CCol>
                      <b
                        style={{
                          marginLeft: '20px',
                        }}
                      >
                        Export to Datastore
                        <HelpButton
                          id="store-to-datastore"
                          text={`If this setting is active, 
                                the exported file will be saved on the selected datastore instead of this LOST instance.`}
                        />
                      </b>
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
            </CCol> */}
          </CRow>
        </CCol>
      </CRow>
      <CRow className="justify-content-center">
        <CoreIconButton
          disabled={newExport.exportName === ''}
          color="primary"
          onClick={() => onGenerateExport()}
          icon={faPlay}
          text="Generate export"
          style={{ marginTop: '40px', maxWidth: '175px' }}
        />
      </CRow>
    </CContainer>
  )
}

export default TabGenerateExport
