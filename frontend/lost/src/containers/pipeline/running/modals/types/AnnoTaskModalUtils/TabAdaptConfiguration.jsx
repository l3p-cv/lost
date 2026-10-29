import * as annoTaskApi from '../../../../../../api/anno_task'
import { CAlert } from '@coreui/react'
import { useState } from 'react'
import SelectMIAConfiguration from './SelectMIAConfiguration'
import SelectSIAConfiguration from './SelectSIAConfiguration'

const TabAdaptConfiguration = ({ id, type, configuration }) => {
  const [configError, setConfigError] = useState(null)
  const { data: annoTaskConfigUpdateDate, mutate: updateAnnoTaskConfig } =
    annoTaskApi.useUpdateConfig()

  const onAnnoTaskConfigUpdate = (config, childCallbacks) => {
    updateAnnoTaskConfig({ annotaskId: id, configuration: config },{
      onError: (err) => {
        if (err?.response?.status === 400) {
          setConfigError(err?.response?.data?.message ?? 'Saving the configuration failed.')
        }
        childCallbacks?.onError?.()
      },
      onSuccess: () => {
        setConfigError(null)
        childCallbacks?.onSuccess?.()
      },
    })
  }
  return (
    <>
      {configError && (
        <CAlert color='danger' dismissible onClose={() => setConfigError(null)}>
          {configError}
        </CAlert>
      )}
      {type === 'sia' ? (
        <SelectSIAConfiguration
          peN={undefined}
          configuration={configuration}
          onUpdate={onAnnoTaskConfigUpdate}
        ></SelectSIAConfiguration>
      ) : (
        <SelectMIAConfiguration
          peN={undefined}
          configuration={configuration}
          onUpdate={onAnnoTaskConfigUpdate}
        ></SelectMIAConfiguration>
      )}
    </>
  )
}

export default TabAdaptConfiguration
