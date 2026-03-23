import { CCol, CContainer, CFormSelect, CRow } from '@coreui/react'
import { faBoxesPacking } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import * as annoTaskApi from '../../../../../../api/anno_task'
import * as datasetApi from '../../../../../../actions/dataset/dataset_api'
import { showSuccess } from '../../../../../../components/Notification'
import DatasetEditModal from '../../../../../Datasets/DatasetEditModal'
import CoreIconButton from '../../../../../../components/CoreIconButton'
import InfoText from '../../../../../../components/InfoText'

const NOTIFICATION_TIMEOUT_MS = 5000

type TabStorageSettingsProps = {
  annotaskId: number | string
}

const TabStorageSettings = ({ annotaskId }: TabStorageSettingsProps) => {
  const { data: flatDatasetList, refetch: reloadFlatDatasetList } =
    datasetApi.useFlatDatasets()
  const { data: storageSettings, refetch: getStorageSettings } =
    annoTaskApi.useGetStorageSettings(annotaskId)
  const { data: updateStorageSettingsResponse, mutate: updateStorageSettings } =
    annoTaskApi.useUpdateStorageSettings()

  const [datasetDropdownOptions, setDatasetDropdownOptions] = useState([])
  const [selectedDatasetID, setSelectedDatasetID] = useState()
  const [isCreateDatasetModalOpen, setIsCreateDatasetModalOpen] = useState(false)

  const convertDatasetToDropdownOptions = (datasets) => {
    const options = [
      {
        key: '-1',
        value: '-1',
        text: 'No Dataset',
      },
    ]

    Object.keys(datasets).forEach((datasetId) => {
      options.push({
        key: datasetId,
        value: datasetId,
        text: datasets[datasetId],
      })
    })
    setDatasetDropdownOptions(options)
  }

  useEffect(() => {
    getStorageSettings()
  }, [])

  useEffect(() => {
    if (storageSettings === undefined || storageSettings === null) return

    let datasetId = '-1'
    if (storageSettings.datasetId !== null) datasetId = `${storageSettings.datasetId}`

    setSelectedDatasetID(datasetId)
  }, [storageSettings])

  useEffect(() => {
    convertDatasetToDropdownOptions(flatDatasetList)
  }, [flatDatasetList])

  useEffect(() => {
    if (updateStorageSettingsResponse === undefined) return

    if (updateStorageSettingsResponse.status === 200) {
      showSuccess('Dataset changed successfully', NOTIFICATION_TIMEOUT_MS)
    }
  }, [updateStorageSettingsResponse])

  const updateSelectedDatasetID = (datasetId) => {
    console.log('UPDATE with data: ', datasetId)
    const data = {
      annotaskId,
      datasetId: datasetId,
    }

    updateStorageSettings(data)
    setSelectedDatasetID(datasetId)
  }

  return (
    <>
      <CContainer>
        <CRow style={{ marginLeft: '5px' }}>
          <CCol sm="12">
            <CRow xs={{ gutterY: 3 }}>
              <CCol sm="12">
                <InfoText
                  text={'Dataset'}
                  toolTip={'Select the dataset where the annotations are linked to'}
                  style={{ fontSize: 20, marginBottom: '15px' }}
                />
                <CRow>
                  <CCol>
                    <CFormSelect
                      placeholder="Select Dataset"
                      options={[
                        {
                          label: 'Select an option',
                          value: '',
                          disabled: true,
                        },
                        ...datasetDropdownOptions.map((opt) => ({
                          label: opt.text,
                          value: opt.value,
                        })),
                      ]}
                      value={selectedDatasetID}
                      onChange={(data) => {
                        updateSelectedDatasetID(data.target.value)
                      }}
                      // defaultValue={
                      //     datasetDropdownOptions.length == null
                      //         ? datasetDropdownOptions[0]
                      //         : ""

                      // }
                    ></CFormSelect>
                  </CCol>
                </CRow>
                <CRow className="justify-content-end">
                  <CCol sm="auto" className="align-self-end">
                    <CoreIconButton
                      color="primary"
                      icon={faBoxesPacking}
                      text="Create new dataset"
                      onClick={() => {
                        setIsCreateDatasetModalOpen(true)
                      }}
                      className="mt-2"
                    />
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </CContainer>
      <DatasetEditModal
        isVisible={isCreateDatasetModalOpen}
        setIsVisible={setIsCreateDatasetModalOpen}
        editedDatasetObj={{}}
        flatDatasetList={flatDatasetList}
        onDatasetCreated={(datasetId) => {
          reloadFlatDatasetList()
          updateSelectedDatasetID(`${datasetId}`)
        }}
      />
    </>
  )
}

export default TabStorageSettings
