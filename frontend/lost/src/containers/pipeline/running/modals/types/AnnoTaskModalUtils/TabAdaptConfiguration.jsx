import * as annoTaskApi from '../../../../../../actions/annoTask/anno_task_api'
import SelectMIAConfiguration from '../../../../start/2/modals/types/annoTaskModal/5/SelectMIAConfiguration'
import SelectSIAConfiguration from '../../../../start/2/modals/types/annoTaskModal/5/SelectSIAConfiguration'

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
