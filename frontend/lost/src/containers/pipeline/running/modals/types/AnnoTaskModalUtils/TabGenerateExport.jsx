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
import HelpButton from '../../../../../../components/HelpButton'
import IconButton from '../../../../../../components/IconButton'
import * as Notification from '../../../../../../components/Notification'

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

  return (
    <CContainer>
      <CRow style={{ marginLeft: '5px' }}>
        <CCol sm="6">
          <CRow xs={{ gutterY: 3 }}>
            <CCol sm="12">
              <h4>
                Export Name
                <HelpButton id="export-name" text={`Give your export file a name.`} />
              </h4>
              <CRow>
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
              </CRow>
            </CCol>

            <CCol sm="12">
              <CRow>
                <CCol xs="12" lg="5">
                  <CFormSwitch
                    size="xl"
                    className={'mx-1'}
                    variant={'3d'}
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
                <CCol>
                  <h4>
                    Annotated only
                    <HelpButton
                      id="anno-only"
                      text={
                        'Only add annotations from already annotated images to the export.'
                      }
                    />
                  </h4>
                </CCol>
              </CRow>
            </CCol>

            <CCol sm="12">
              <CRow>
                <CCol xs="12" lg="5">
                  <CFormSwitch
                    size="xl"
                    className={'mx-1'}
                    variant={'3d'}
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
                <CCol>
                  <h4>
                    Include Images
                    <HelpButton
                      id="include-images"
                      text={
                        'Whether images should be packed into the export. (Attention, the file size can become very large). '
                      }
                    />
                  </h4>
                </CCol>
              </CRow>
            </CCol>

            <CCol sm="12">
              <CRow>
                <CCol xs="12" lg="5">
                  <CDropdown>
                    <CDropdownToggle color="secondary">
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
                </CCol>
                <CCol>
                  <h4 className="mb-3">
                    Export Type
                    <HelpButton id="export-type" text={'Type of data export. '} />
                  </h4>
                </CCol>
              </CRow>

              {/* <CRow>
                                <CCol sm="12">
                                    <CRow style={{ marginLeft: '5px' }}>
                                        
                                    </CRow>
                                </CCol>
                            </CRow> */}
            </CCol>
          </CRow>
        </CCol>
        <CCol sm="6">
          <CRow style={{ marginTop: '10px', marginBottom: '40px' }}>
            <CCol sm="12">
              <h4>
                Split Dataset
                <HelpButton
                  id="split-ds"
                  text={`If these settings are active, 
                                the dataset will be split into the parts indicated below. 
                                This is done randomly based on the image path.`}
                />
              </h4>
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
                    <CCol>
                      <b
                        style={{
                          marginLeft: '20px',
                        }}
                      >
                        Active
                        <HelpButton id="random-splits" text={'Enable random splits'} />
                      </b>
                    </CCol>
                  </CRow>
                </CCol>

                {newExport.randomSplits.active ? (
                  <>
                    <div
                      style={{
                        marginLeft: '5px',
                        marginTop: '10px',
                      }}
                    >
                      <CRow>
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
                        <CCol>
                          <b>
                            Train
                            <HelpButton id="split-train" text={'Split for train.'} />
                          </b>
                        </CCol>
                      </CRow>
                    </div>
                    <div
                      style={{
                        marginLeft: '5px',
                        marginTop: '10px',
                      }}
                    >
                      <CRow>
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
                        <CCol>
                          <b>
                            Test
                            <HelpButton id="split-test" text={'Split for test.'} />
                          </b>
                        </CCol>
                      </CRow>
                    </div>
                    <div
                      style={{
                        marginLeft: '5px',
                        marginTop: '10px',
                      }}
                    >
                      <CRow>
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
                        <CCol>
                          <b>
                            Val
                            <HelpButton id="split-val" text={'Split for val.'} />
                          </b>
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
                            <h4 className='mt-3'>Datastore</h4>
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
                                                    console.log("export to datastore switch flipped");
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
        <IconButton
          isOutline={false}
          disabled={newExport.exportName === ''}
          color="primary"
          onClick={() => onGenerateExport()}
          icon={faPlay}
          text="Generate export"
          style={{ marginTop: '20px', marginRight: '20px', maxWidth: '175px' }}
        ></IconButton>
      </CRow>
    </CContainer>
  )
}

export default TabGenerateExport
