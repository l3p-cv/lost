import React from 'react'
import * as annoTaskApi from '../../../../../../../actions/annoTask/anno_task_api'
import SelectSIAConfiguration from '../../../../../start/2/modals/types/annoTaskModal/5/SelectSIAConfiguration'
import SelectMIAConfiguration from '../../../../../start/2/modals/types/annoTaskModal/5/SelectMIAConfiguration'

const TabAdaptConfiguration = (props) => {
    const { data: annoTaskConfigUpdateDate, mutate: updateAnnoTaskConfig } =
        annoTaskApi.useUpdateConfig()

    const onAnnoTaskConfigUpdate = (config) => {
        updateAnnoTaskConfig({ annotaskId: props.annoTask.id, configuration: config })
    }
    return (
        <>
            {props.annoTask.type === 'sia' ? (
                <SelectSIAConfiguration
                    peN={undefined}
                    configuration={props.annoTask.configuration}
                    onUpdate={(config) => onAnnoTaskConfigUpdate(config)}
                ></SelectSIAConfiguration>
            ) : (
                <SelectMIAConfiguration
                    peN={undefined}
                    configuration={props.annoTask.configuration}
                    onUpdate={(config) => onAnnoTaskConfigUpdate(config)}
                ></SelectMIAConfiguration>
            )}
        </>
    )
}

export default TabAdaptConfiguration
