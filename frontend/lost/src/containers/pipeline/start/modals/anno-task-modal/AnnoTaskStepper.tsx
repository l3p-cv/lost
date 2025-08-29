import { useNodesData } from '@xyflow/react'
import { isEmpty } from 'lodash'
import {
    AvailableGroup,
    AvailableLabelTree,
} from '../../../../../actions/pipeline/model/pipeline-template-response'
import { useStep } from '../../../../../hooks/useStep'
import { AnnoTaskNodeData } from '../../nodes'
import {
    AnnoTaskInfo,
    SelectLabel,
    SelectMiaConfiguration,
    SelectSiaConfiguration,
    SelectStorageSettings,
    SelectTree,
    SelectUser,
} from './steps'
import CoreIconButton from '../../../../../components/CoreIconButton'
import { CProgress } from '@coreui/react'

const NUM_STEPS = 6
const ANNO_TASK_INFO_STEP = 1
const USER_SELECTION_STEP = 2
const LABEL_TREE_SELECTION_STEP = 3
const LABEL_SELECTION_STEP = 4
const STORAGE_SETTINGS_STEP = 5
const CONFIGURATION_STEP = 6

const stepEventMap: Record<number, string> = {
    1: 'anno-task-info-done',
    2: 'user-selection-done',
    3: 'label-tree-selection-done',
    4: 'label-selection-done',
    5: 'storage-settings-done',
    6: 'configuration-done',
}

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

    const nodeData = useNodesData(nodeId)
    const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData

    const isStepComplete = () => {
        if (currentStep === ANNO_TASK_INFO_STEP) {
            return (
                !isEmpty(annoTaskNodeData.name.trim()) //&& 
                // annoTaskNodeData.instructionId !== undefined
            );
        }

        if (currentStep === USER_SELECTION_STEP) {
            return !isEmpty(annoTaskNodeData.selectedUserGroup)
        }

        if (currentStep === LABEL_TREE_SELECTION_STEP) {
            return !isEmpty(annoTaskNodeData.selectedLabelTree)
        }

        if (currentStep === LABEL_SELECTION_STEP) {
            // at least one label selected
            const parentSelected = annoTaskNodeData.labelTreeGraph.nodes.some(
                (node) => node.data.selectedAsParent,
            )
            return parentSelected
        }
        return true
    }

    const handleNextClick = () => {
        if (isStepComplete()) {
            const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true';
            const eventDetail = stepEventMap[currentStep]
            if (joyrideRunning && eventDetail) {
                window.dispatchEvent(new CustomEvent('joyride-next-step', {
                    detail: { step: eventDetail },
                }))
            }
            goToNextStep()
        }
    }
    const handleLastClick = () => {
        if (isStepComplete()) {
            const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true';
            const eventDetail = stepEventMap[currentStep]
            if (joyrideRunning && eventDetail) {
                window.dispatchEvent(new CustomEvent('joyride-next-step', {
                    detail: { step: eventDetail },
                }))
            }
            toggleModal()
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case ANNO_TASK_INFO_STEP:
                return <AnnoTaskInfo nodeId={nodeId} />
            case USER_SELECTION_STEP:
                return <SelectUser nodeId={nodeId} availableGroups={availableGroups} />
            case LABEL_TREE_SELECTION_STEP:
                return (
                    <SelectTree
                        nodeId={nodeId}
                        availableLabelTrees={availableLabelTrees}
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
                if (annoTaskNodeData.type === 'sia') {
                    return <SelectSiaConfiguration nodeId={nodeId} />
                } else if (annoTaskNodeData.type === 'mia') {
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
            <CProgress value={(currentStep / NUM_STEPS) * 100} className="mb-3" color="info" />
            {renderStep()}

            <div className="d-flex justify-content-between mt-3">
                    <CoreIconButton 
                        style={{width: "100px"}}
                        text="Previous" 
                        color="primary" 
                        onClick={goToPrevStep}
                        disabled={!canGoToPrevStep}
                    />
                <div className="ms-auto">
                    {canGoToNextStep && (
                            <CoreIconButton
                                className={currentStep === ANNO_TASK_INFO_STEP ? 'step1next' : currentStep === USER_SELECTION_STEP ? 'step2next' : currentStep === LABEL_TREE_SELECTION_STEP ? 'step3next':currentStep === LABEL_SELECTION_STEP ? 'step4next': currentStep === STORAGE_SETTINGS_STEP ? 'step5next':currentStep === CONFIGURATION_STEP ? 'step6next':""}
                                style={{width: "100px"}}
                                text="Next" 
                                color="primary"
                                onClick={handleNextClick}
                                disabled={!canGoToNextStep}
                                toolTip={isStepComplete() ? "" : "Please complete this step before proceeding"}
                                tTipPlacement='right'
                            />
                    )}

                    {currentStep === NUM_STEPS && (
                        <CoreIconButton 
                            text="Done"
                            style={{width: "100px"}}
                            color='success'
                            onClick={handleLastClick}
                            disabled={!isStepComplete()}
                            className= 'steplast'
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
