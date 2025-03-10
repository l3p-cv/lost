import { useNodesData } from '@xyflow/react'
import { isEmpty } from 'lodash'
import { useState } from 'react'
import { Button, Progress, Tooltip } from 'reactstrap'
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

    const nodeData = useNodesData(nodeId)
    const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData

    const [tooltipOpen, setTooltipOpen] = useState(false)
    const toggleTooltip = () => setTooltipOpen((prev) => !prev)

    const isStepComplete = () => {
        if (currentStep === ANNO_TASK_INFO_STEP) {
            return (
                !isEmpty(annoTaskNodeData.name.trim()) &&
                !isEmpty(annoTaskNodeData.instructions.trim())
            )
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
            goToNextStep()
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
            <Progress value={(currentStep / NUM_STEPS) * 100} className="mb-3" />
            {renderStep()}

            <div className="d-flex justify-content-between mt-3">
                {canGoToPrevStep && (
                    <Button color="secondary" onClick={goToPrevStep}>
                        Previous
                    </Button>
                )}

                <div className="ms-auto">
                    {canGoToNextStep && (
                        <>
                            <Button
                                color="primary"
                                onClick={handleNextClick}
                                id="nextStepButton"
                                onMouseEnter={() => setTooltipOpen(true)}
                                onMouseLeave={() => setTooltipOpen(false)}
                            >
                                Next
                            </Button>
                            <Tooltip
                                isOpen={tooltipOpen && !isStepComplete()}
                                target="nextStepButton"
                                toggle={toggleTooltip}
                                placement="left"
                            >
                                Please complete this step before proceeding.
                            </Tooltip>
                        </>
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
