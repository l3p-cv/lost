import { useReactFlow } from '@xyflow/react'
import { Button, Progress } from 'reactstrap'
import {
    AvailableGroup,
    AvailableLabelTree,
} from '../../../../../actions/pipeline/model/pipeline-template-response'
import { useStep } from '../../../../../hooks/useStep'
import {
    AnnoTaskInfo,
    SelectLabel,
    SelectMiaConfiguration,
    SelectSiaConfiguration,
    SelectStorageSettings,
    SelectTree,
    SelectUser,
} from './steps'

const NUM_STEPS = 6
const ANNO_TASK_INFO_STEP = 1
const USER_SELECTION_STEP = 2
const LABEL_TREE_SELECTION_STEP = 3
const LABEL_SELECTION_STEP = 4
const STORAGE_SETTINGS_STEP = 5
const CONFIGURATION_STEP = 6

interface StepperProps {
    toggleModal: () => void
    nodeId: string
    availableLabelTrees: AvailableLabelTree[]
    availableGroups: AvailableGroup[]
}

export const AnnoTaskStepper = ({
    nodeId,
    availableLabelTrees,
    availableGroups,
    toggleModal,
}: StepperProps) => {
    const [
        currentStep,
        { goToNextStep, goToPrevStep, canGoToNextStep, canGoToPrevStep },
    ] = useStep(NUM_STEPS)

    const { getNode } = useReactFlow()

    const isStepComplete = () => {
        // if (currentStep === 1) return formData.name.trim() !== ''
        // if (currentStep === 2) return formData.email.trim() !== ''
        // if (currentStep === 3) return formData.password.trim() !== ''
        return true
    }

    const renderStep = () => {
        switch (currentStep) {
            case ANNO_TASK_INFO_STEP:
                return <AnnoTaskInfo nodeId={nodeId} />
            case USER_SELECTION_STEP:
                return (
                    <SelectUser
                        nodeId={nodeId}
                        availableGroups={availableGroups}
                        goToNextStep={goToNextStep}
                    />
                )
            case LABEL_TREE_SELECTION_STEP:
                return (
                    <SelectTree
                        nodeId={nodeId}
                        availableLabelTrees={availableLabelTrees}
                        goToNextStep={goToNextStep}
                    />
                )

            case LABEL_SELECTION_STEP:
                return (
                    <SelectLabel
                        nodeId={nodeId}
                        availableLabelTrees={availableLabelTrees}
                    />
                )

            case STORAGE_SETTINGS_STEP:
                return <SelectStorageSettings nodeId={nodeId} />

            case CONFIGURATION_STEP: {
                const node = getNode(nodeId)
                if (node?.data.type === 'sia') {
                    return <SelectSiaConfiguration nodeId={nodeId} />
                } else if (node?.data.type === 'mia') {
                    return <SelectMiaConfiguration nodeId={nodeId} />
                } else break
            }
            default:
                return null
        }
    }

    return (
        <div>
            <p className="text-center text-muted">
                Step {currentStep}/{NUM_STEPS}
            </p>
            <Progress value={(currentStep / NUM_STEPS) * 100} className="mb-3" />
            {renderStep()}

            <div className="d-flex justify-content-between mt-3">
                {canGoToPrevStep && (
                    <Button color="secondary" onClick={goToPrevStep}>
                        Previous
                    </Button>
                )}

                <div className="ms-auto">
                    {canGoToNextStep &&
                        currentStep !== USER_SELECTION_STEP &&
                        currentStep !== LABEL_TREE_SELECTION_STEP && (
                            <Button
                                color="primary"
                                onClick={goToNextStep}
                                disabled={!isStepComplete()}
                            >
                                Next
                            </Button>
                        )}

                    {currentStep === NUM_STEPS && (
                        <Button
                            color="success"
                            onClick={toggleModal}
                            disabled={!isStepComplete()}
                        >
                            Done
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
