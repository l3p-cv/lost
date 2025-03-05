import { useCallback } from 'react'
import { connect } from 'react-redux'
import Stepper from 'react-stepper-wizard'
import actions from '../../../../../../../actions/pipeline/pipelineStartModals/annoTask'
import UserInfo from './1/UserInfo.jsx'
import SelectUser from './2/SelectUser.jsx'
import SelectTree from './3/SelectTree'
import SelectLabel from './4/SelectLabel'
import SelectMIAConfiguration from './5/SelectMIAConfiguration'
import SelectSIAConfiguration from './5/SelectSIAConfiguration'
import SelectStorageSettings from './5/SelectStorageSettings'

const { selectTab, verifyTab } = actions

const AnnoTaskModal = (props) => {
    const changeCurrentStep = useCallback(
        (newStep) => {
            props.selectTab(props.peN, newStep)
        },
        [props],
    )

    const renderContent = () => {
        switch (props.stepper.currentStep) {
            case 0:
                return <UserInfo {...props} />
            case 1:
                return <SelectUser {...props} />
            case 2:
                return <SelectTree {...props} />
            case 3:
                return (
                    <SelectLabel
                        availableLabelTrees={props.availableLabelTrees}
                        peN={props.peN}
                        verifyTab={props.verifyTab}
                    />
                )
            case 4:
                return (
                    <SelectStorageSettings
                        peN={props.peN}
                        // datastoreList={[]}
                    />
                )
            case 5:
                if (props.annoTask.type === 'sia') {
                    return <SelectSIAConfiguration {...props} />
                } else if (props.annoTask.type === 'mia') {
                    return <SelectMIAConfiguration {...props} />
                }
                break
            default:
                break
        }
    }

    const renderStepper = () => {
        if (props.stepper.steps) {
            return (
                <Stepper
                    stepperData={props.stepper}
                    changeCurrentStep={changeCurrentStep}
                />
            )
        }
    }

    return (
        <div>
            {renderStepper()}
            {renderContent()}
        </div>
    )
}

export default connect(null, { selectTab, verifyTab })(AnnoTaskModal)
