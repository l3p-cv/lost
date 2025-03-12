import * as annoTaskApi from '../../../../../../actions/annoTask/anno_task_api'
import SelectMIAConfiguration from './SelectMIAConfiguration'
import SelectSIAConfiguration from './SelectSIAConfiguration'

const TabAdaptConfiguration = ({ id, type, configuration }) => {
    const { data: annoTaskConfigUpdateDate, mutate: updateAnnoTaskConfig } =
        annoTaskApi.useUpdateConfig()

    const onAnnoTaskConfigUpdate = (config) => {
        updateAnnoTaskConfig({ annotaskId: id, configuration: config })
    }
    return (
        <>
            {type === 'sia' ? (
                <SelectSIAConfiguration
                    peN={undefined}
                    configuration={configuration}
                    onUpdate={(config) => onAnnoTaskConfigUpdate(config)}
                ></SelectSIAConfiguration>
            ) : (
                <SelectMIAConfiguration
                    peN={undefined}
                    configuration={configuration}
                    onUpdate={(config) => onAnnoTaskConfigUpdate(config)}
                ></SelectMIAConfiguration>
            )}
        </>
    )
}

export default TabAdaptConfiguration
